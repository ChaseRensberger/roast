import { afterEach, describe, expect, test } from 'bun:test'
import { IDBFactory } from 'fake-indexeddb'
import { createId } from '../src/lib/id'
import { drinks, initialOptions, makeItem } from '../src/lib/menu'
import { createOrder } from '../src/lib/orders'
import { EMPTY_ROAST, readRoastData, saveCartItem, setOrderStatus, submitOrder, type RoastData } from '../src/lib/roast-state'
import { isNewerSnapshot, openStateDatabase, StateRepository, StorageUnavailableError } from '../src/lib/state-repository'

const connections: IDBDatabase[] = []
const drink = drinks.find((entry) => entry.id === 'bsl')!
const item = makeItem(drink, initialOptions(drink), 1)

async function twoTabs(initial: RoastData = EMPTY_ROAST) {
  const factory = new IDBFactory()
  const databases = await Promise.all([openStateDatabase(factory), openStateDatabase(factory)])
  connections.push(...databases)
  const customer = new StateRepository(Promise.resolve(databases[0]), 'roast.state.v2', initial, readRoastData)
  const barista = new StateRepository(Promise.resolve(databases[1]), 'roast.state.v2', initial, readRoastData)
  await Promise.all([customer.read(), barista.read()])
  return { customer, barista }
}

afterEach(() => {
  connections.splice(0).forEach((db) => db.close())
})

describe('Cross-tab transactions', () => {
  test('keeps both a new order and a simultaneous barista status update', async () => {
    const previous = createOrder([item], 'Ada', null)
    const next = createOrder([item], 'Ren', null)
    const { customer, barista } = await twoTabs({ ...EMPTY_ROAST, orders: [previous] })
    await Promise.all([
      customer.update((old) => ({ ...old, orders: [next, ...old.orders] })),
      barista.update((old) => ({ ...old, orders: setOrderStatus(old.orders, previous.id, 'ready') })),
    ])
    const latest = await customer.read()
    expect(latest.value.orders.map((order) => order.id)).toEqual([next.id, previous.id])
    expect(latest.value.orders[1].status).toBe('ready')
    expect(await barista.read()).toEqual(latest)
  })

  test('retains simultaneous favorite changes from separate connections', async () => {
    const { customer, barista } = await twoTabs()
    await Promise.all([
      customer.update((old) => ({ ...old, favorites: [...old.favorites, 'bsl'] })),
      barista.update((old) => ({ ...old, favorites: [...old.favorites, 'cb'] })),
    ])
    expect((await customer.read()).value.favorites.toSorted()).toEqual(['bsl', 'cb'])
  })

  test('checkout preserves a concurrent barista update on an existing ticket', async () => {
    const previous = createOrder([item], 'Ada', null)
    const { customer, barista } = await twoTabs({ ...EMPTY_ROAST, cart: [item], orders: [previous] })
    await Promise.all([
      customer.update((old) => submitOrder(old, [item], 'Ren', null).data),
      barista.update((old) => ({ ...old, orders: setOrderStatus(old.orders, previous.id, 'ready') })),
    ])
    const latest = (await customer.read()).value
    expect(latest.cart).toEqual([])
    expect(latest.orders).toHaveLength(2)
    expect(latest.orders.find((order) => order.id === previous.id)?.status).toBe('ready')
  })

  test('commits checkout and cart clearing together and rejects a duplicate checkout', async () => {
    const { customer, barista } = await twoTabs({ ...EMPTY_ROAST, cart: [item] })
    const results = await Promise.allSettled([
      customer.update((old) => submitOrder(old, [item], 'Ada', null).data),
      barista.update((old) => submitOrder(old, [item], 'Ren', null).data),
    ])
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1)
    const latest = (await customer.read()).value
    expect(latest.cart).toEqual([])
    expect(latest.orders).toHaveLength(1)
    expect(latest.name).toBe(latest.orders[0].name)
  })

  test('does not revive a drink after another tab checks out', async () => {
    const { customer, barista } = await twoTabs({ ...EMPTY_ROAST, cart: [item] })
    await barista.update((old) => submitOrder(old, [item], 'Ada', null).data)
    await expect(customer.update((old) => ({ ...old, cart: saveCartItem(old.cart, { ...item, quantity: 2 }, item) }))).rejects.toThrow('changed or was removed')
    const latest = (await customer.read()).value
    expect(latest.cart).toEqual([])
    expect(latest.orders).toHaveLength(1)
  })

  test('rejects an edit against a quantity changed by another connection', async () => {
    const { customer, barista } = await twoTabs({ ...EMPTY_ROAST, cart: [item] })
    await barista.update((old) => ({ ...old, cart: [{ ...item, quantity: 3 }] }))
    await expect(customer.update((old) => ({ ...old, cart: saveCartItem(old.cart, { ...item, quantity: 2 }, item) }))).rejects.toThrow('changed or was removed')
    expect((await customer.read()).value.cart[0].quantity).toBe(3)
  })

  test('domain conflicts abort the transaction without marking storage unavailable', async () => {
    const { customer } = await twoTabs()
    const conflict = new Error('A deliberate edit conflict')
    try {
      await customer.update(() => { throw conflict })
      throw new Error('Expected rejection')
    } catch (cause) {
      expect(cause).toBe(conflict)
      expect(cause).not.toBeInstanceOf(StorageUnavailableError)
    }
    expect((await customer.read()).revision).toBe(0)
    await customer.update((old) => ({ ...old, name: 'Still works' }))
    expect((await customer.read()).value.name).toBe('Still works')
  })

  test('ignores older read results after a newer commit', async () => {
    const { customer, barista } = await twoTabs()
    const old = await customer.read()
    const committed = await barista.update((data) => ({ ...data, name: 'Ada' }))
    expect(isNewerSnapshot(old, committed.revision)).toBe(false)
    expect(isNewerSnapshot(committed, old.revision)).toBe(true)
    expect(isNewerSnapshot(committed, committed.revision)).toBe(false)
  })

  test('does not advance the revision for an unchanged state', async () => {
    const { customer } = await twoTabs()
    const before = await customer.read()
    expect((await customer.update((old) => old)).revision).toBe(before.revision)
  })

  test('migrates initial data once without replacing newer database state', async () => {
    const { customer, barista } = await twoTabs({ ...EMPTY_ROAST, cart: [item], favorites: ['bsl'], name: 'Ada' })
    expect((await barista.read()).value.cart).toEqual([item])
    await customer.update((old) => ({ ...old, name: 'Ren' }))
    expect((await barista.read()).value.name).toBe('Ren')
  })

  test('a stale status command cannot move a ticket backward', async () => {
    const order = createOrder([item], 'Ada', null)
    const { customer, barista } = await twoTabs({ ...EMPTY_ROAST, orders: [order] })
    await barista.update((old) => ({ ...old, orders: setOrderStatus(old.orders, order.id, 'collected') }))
    await customer.update((old) => ({ ...old, orders: setOrderStatus(old.orders, order.id, 'preparing') }))
    expect((await customer.read()).value.orders[0].status).toBe('collected')
  })
})

describe('Cart edit conflicts', () => {
  test('saves an unchanged original and merges a matching destination customization', () => {
    const oat = makeItem(drink, { ...item.options, milk: 1 }, 2)
    expect(saveCartItem([item, oat], { ...oat, quantity: 1 }, item)).toEqual([{ ...oat, quantity: 3 }])
  })

  test('still adds new drinks without requiring an original item', () => {
    expect(saveCartItem([], item)).toEqual([item])
  })
})

describe('HTTP-safe order IDs', () => {
  test('uses the native UUID implementation when available', () => {
    const source = { randomUUID: () => '12345678-1234-4234-8234-123456789abc' } as Crypto
    expect(createId(source)).toBe('12345678-1234-4234-8234-123456789abc')
  })

  test('generates UUIDs when randomUUID is unavailable on plain HTTP', () => {
    const source = { getRandomValues: crypto.getRandomValues.bind(crypto) } as Crypto
    const ids = Array.from({ length: 100 }, () => createId(source))
    expect(ids.every((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id))).toBe(true)
    expect(new Set(ids).size).toBe(100)
  })
})
