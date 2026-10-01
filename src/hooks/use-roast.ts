import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { mergeItems, unavailableItem, type CartItem } from '@/lib/menu'
import { advanceOrders, type OrderStatus } from '@/lib/orders'
import { readLegacyRoastData, readRoastData, saveCartItem, setOrderStatus, submitOrder, type RoastData } from '@/lib/roast-state'
import { usePersistentState } from './use-persistent-state'

export function useRoast() {
  const [initial] = useState(readLegacyRoastData)
  const [data, setData, storageFailed, ready] = usePersistentState('roast.state.v2', initial, readRoastData)
  const [now, setNow] = useState(Date.now)

  async function action(update: (old: RoastData) => RoastData) {
    try { await setData(update) }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : 'Your changes could not be saved. Please try again.') }
  }

  useEffect(() => {
    if (!ready) return
    const tick = () => {
      const time = Date.now()
      setNow(time)
      if (data.orders.some((order) => order.status === 'received' || order.status === 'preparing')) {
        void setData((old) => {
          const orders = advanceOrders(old.orders, time)
          return orders === old.orders ? old : { ...old, orders }
        }).catch(() => {})
      }
    }
    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [setData, ready, data.orders])

  async function removeItem(key: string) {
    let removed: CartItem | undefined
    await action((old) => {
      removed = old.cart.find((item) => item.key === key)
      return removed ? { ...old, cart: old.cart.filter((item) => item.key !== key) } : old
    })
    if (removed) {
      const item = removed
      toast('Drink removed', { action: { label: 'Undo', onClick: () => { void action((old) => ({ ...old, cart: mergeItems(old.cart, item) })) } } })
    }
  }

  async function saveItem(item: CartItem, original?: CartItem) {
    await setData((old) => ({ ...old, cart: saveCartItem(old.cart, item, original) }))
    toast.success(original ? 'Your drink has been updated' : `${item.drink.name} added to your order`)
  }

  async function changeQuantity(key: string, delta: number) {
    let removed: CartItem | undefined
    await action((old) => {
      const item = old.cart.find((entry) => entry.key === key)
      if (!item) return old
      if (item.quantity + delta <= 0) {
        removed = item
        return { ...old, cart: old.cart.filter((entry) => entry.key !== key) }
      }
      return { ...old, cart: old.cart.map((entry) => entry.key === key ? { ...entry, quantity: Math.min(99, entry.quantity + delta) } : entry) }
    })
    if (removed) {
      const item = removed
      toast('Drink removed', { action: { label: 'Undo', onClick: () => { void action((old) => ({ ...old, cart: mergeItems(old.cart, item) })) } } })
    }
  }

  async function placeOrder(pickupName: string, pickupAt: number | null, expectedCart: CartItem[]) {
    const next = await setData((old) => submitOrder(old, expectedCart, pickupName, pickupAt).data)
    return next.orders[0].id
  }

  async function reorder(items: CartItem[]) {
    const available = items.filter((item) => !unavailableItem(item))
    await setData((old) => ({ ...old, cart: available.reduce(mergeItems, old.cart) }))
    if (available.length < items.length) toast('Unavailable drinks or modifiers were skipped. You can customize them from the menu.')
    if (available.length) toast.success('Previous order added to your cart')
    return available.length > 0
  }

  return {
    ...data, now, storageFailed, loading: !ready,
    removeItem, saveItem, changeQuantity, placeOrder, reorder,
    toggleFavorite: (id: string) => action((old) => ({ ...old, favorites: old.favorites.includes(id) ? old.favorites.filter((entry) => entry !== id) : [...old.favorites, id] })),
    setStatus: (id: string, status: OrderStatus) => action((old) => ({ ...old, orders: setOrderStatus(old.orders, id, status) })),
  }
}
export type RoastState = ReturnType<typeof useRoast>
