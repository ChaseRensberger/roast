import { describe, expect, test } from 'bun:test'
import { drinks, groupsFor, initialOptions, makeItem, mergeItems, optionSummary, totals, unavailableItem, unitPrice } from '../src/lib/menu'
import { advanceOrders, createOrder } from '../src/lib/orders'
import { pickupSlots, shopIsOpen } from '../src/lib/shop'
import { readCart, readFavorites, readOrders } from '../src/lib/storage'
import { receiptText } from '../src/lib/receipt'

const latte = drinks.find((drink) => drink.id === 'bsl')!
const item = makeItem(latte, initialOptions(latte), 2)
const now = Date.parse('2026-09-30T19:00:00Z')

describe('Menu and cart', () => {
  test('keeps the twelve original drinks and conditional groups', () => {
    expect(drinks).toHaveLength(12)
    expect(groupsFor(drinks.find((drink) => drink.id === 'esp')!).map((group) => group.key)).not.toContain('milk')
    expect(groupsFor(drinks.find((drink) => drink.id === 'cb')!).map((group) => group.key)).not.toContain('milk')
    expect(groupsFor(drinks.find((drink) => drink.id === 'mat')!).map((group) => group.key)).not.toContain('shots')
  })
  test('prices the chosen modifiers', () => {
    expect(unitPrice(latte, initialOptions(latte))).toBeCloseTo(6)
    expect(unitPrice(latte, { ...initialOptions(latte), milk: 1, shots: 1 })).toBeCloseTo(7.6)
    expect(optionSummary(latte, initialOptions(latte))).toBe('Medium · Whole · Single · None · Hot')
  })
  test('rounds tax and totals to cents', () => {
    expect(totals([item])).toEqual({ subtotal: 12, tax: 1.05, total: 13.05 })
    expect(totals([])).toEqual({ subtotal: 0, tax: 0, total: 0 })
  })
  test('merges identical items without changing other customizations', () => {
    const oat = makeItem(latte, { ...item.options, milk: 1 }, 1)
    const merged = mergeItems([item, oat], item)
    expect(merged.map((entry) => entry.quantity)).toEqual([4, 1])
    expect(mergeItems([{ ...item, quantity: 99 }], item)[0].quantity).toBe(99)
    expect(item.quantity).toBe(2)
  })
  test('flags sold-out drinks and unavailable modifiers', () => {
    expect(unavailableItem(item)).toBe(false)
    expect(unavailableItem(makeItem(latte, { ...item.options, milk: 2 }, 1))).toBe(true)
    const soldOut = drinks.find((drink) => drink.id === 'mcc')!
    expect(unavailableItem(makeItem(soldOut, initialOptions(soldOut), 1))).toBe(true)
  })
})

describe('Order lifecycle', () => {
  test('captures a receipt snapshot and the real pickup name', () => {
    const order = createOrder([item], '  Chase  ', null, now)
    expect(order.name).toBe('Chase')
    expect(order.pickupAt).toBe(now + 360_000)
    expect(order.status).toBe('received')
    expect(order.total).toBe(13.05)
    expect(order.items[0]).not.toBe(item)
    expect(order.items[0].options).not.toBe(item.options)
    expect(createOrder([item], 'Chase', null, now).ticket).not.toBe(order.ticket)
  })
  test('progresses ASAP orders without changing completed ones', () => {
    const orders = [createOrder([item], 'Chase', null, now)]
    expect(advanceOrders(orders, now)).toBe(orders)
    expect(advanceOrders(orders, now + 15_000)[0].status).toBe('preparing')
    expect(advanceOrders(orders, now + 360_000)[0].status).toBe('ready')
    const collected = [{ ...orders[0], status: 'collected' as const }]
    expect(advanceOrders(collected, now + 900_000)).toBe(collected)
  })
  test('waits to prepare a scheduled order until six minutes before pickup', () => {
    const orders = [createOrder([item], 'Chase', now + 1_800_000, now)]
    expect(advanceOrders(orders, now + 60_000)).toBe(orders)
    expect(advanceOrders(orders, now + 1_440_000)[0].status).toBe('preparing')
    expect(advanceOrders(orders, now + 1_800_000)[0].status).toBe('ready')
  })
  test('never moves manually advanced tickets backward', () => {
    const order = createOrder([item], 'Chase', now + 1_800_000, now)
    expect(advanceOrders([{ ...order, status: 'preparing' }], now)[0].status).toBe('preparing')
    expect(advanceOrders([{ ...order, status: 'ready' }], now)[0].status).toBe('ready')
  })
  test('provides an itemized, clearly simulated receipt', () => {
    const receipt = receiptText(createOrder([item], 'Chase', null, now))
    expect(receipt).toContain('2 × Brown Sugar Latte')
    expect(receipt).toContain('Medium · Whole')
    expect(receipt).toContain('Pickup for Chase')
    expect(receipt).toContain('Tax (8.75%): $1.05')
    expect(receipt).toContain('Total: $13.05')
    expect(receipt).toContain('No payment collected')
  })
})

describe('Shop schedule', () => {
  test('uses San Francisco time, not the visitor time zone', () => {
    expect(shopIsOpen(Date.parse('2026-09-30T14:00:00Z'))).toBe(true)
    expect(shopIsOpen(Date.parse('2026-10-01T01:00:00Z'))).toBe(false)
    expect(shopIsOpen(Date.parse('2026-09-30T13:59:00Z'))).toBe(false)
  })
  test('offers quarter-hour slots at least fifteen minutes ahead', () => {
    const slots = pickupSlots(now + 30_000)
    expect(slots).toHaveLength(8)
    expect(slots.every((slot) => slot % 900_000 === 0 && slot >= now + 30_000 + 900_000)).toBe(true)
  })
  test('does not schedule outside opening hours', () => {
    expect(pickupSlots(Date.parse('2026-10-01T00:50:00Z'))).toEqual([])
  })
})

describe('Persisted state validation', () => {
  test('restores valid carts and orders', () => {
    expect(readCart(JSON.parse(JSON.stringify([item])))).toEqual([item])
    const order = createOrder([item], 'Chase', null, now)
    expect(readOrders(JSON.parse(JSON.stringify([order])))).toEqual([order])
  })
  test('rejects malformed carts without crashing', () => {
    expect(readCart(null)).toEqual([])
    expect(readCart([null, {}, { ...item, quantity: -1 }, { ...item, quantity: 1.5 }, { ...item, options: {} }, { ...item, options: { ...item.options, milk: 400 } }])).toEqual([])
    expect(readCart([{ ...item, drink: { id: 'not-a-drink' } }])).toEqual([])
  })
  test('rejects malformed orders and filters unknown favorites', () => {
    expect(readOrders([null, {}, { ...createOrder([item], 'Chase', null, now), total: 'bad' }])).toEqual([])
    expect(readFavorites(['bsl', 'unknown', 1, null])).toEqual(['bsl'])
  })
})
