import { mergeItems, unavailableItem, type CartItem } from './menu'
import { createOrder, type Order, type OrderStatus } from './orders'
import { readCart, readFavorites, readOrders } from './storage'
import { pickupSlots } from './shop'

export type RoastData = { cart: CartItem[]; favorites: string[]; orders: Order[]; name: string }
export const EMPTY_ROAST: RoastData = { cart: [], favorites: [], orders: [], name: '' }

export function readRoastData(value: unknown): RoastData {
  if (!value || typeof value !== 'object') return EMPTY_ROAST
  const data = value as Partial<RoastData>
  return { cart: readCart(data.cart), favorites: readFavorites(data.favorites), orders: readOrders(data.orders), name: typeof data.name === 'string' ? data.name.slice(0, 40) : '' }
}

export function readLegacyRoastData(): RoastData {
  const read = (key: string) => {
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') }
    catch { return null }
  }
  return readRoastData({ cart: read('roast.cart.v1'), favorites: read('roast.favorites.v1'), orders: read('roast.orders.v1'), name: read('roast.name.v1') })
}

export function sameCart(left: CartItem[], right: CartItem[]) {
  return JSON.stringify(left.map((item) => [item.key, item.quantity])) === JSON.stringify(right.map((item) => [item.key, item.quantity]))
}

export function saveCartItem(cart: CartItem[], item: CartItem, original?: CartItem) {
  if (unavailableItem(item)) throw new Error('This drink or modifier is unavailable. Please review your choices.')
  if (original) {
    const current = cart.find((entry) => entry.key === original.key)
    if (!current || !sameCart([current], [original])) {
      throw new Error('This drink changed or was removed in another tab. Return to your cart and reopen the drink before editing.')
    }
  }
  return mergeItems(cart.filter((entry) => entry.key !== original?.key), item)
}

export function submitOrder(data: RoastData, expectedCart: CartItem[], name: string, pickupAt: number | null): { data: RoastData; order: Order } {
  if (!sameCart(data.cart, expectedCart)) throw new Error('Your cart changed in another tab. Please review your order and try again.')
  if (!data.cart.length || data.cart.some(unavailableItem)) throw new Error('Please review unavailable items in your cart.')
  if (!name.trim()) throw new Error('Please enter a name for pickup.')
  if (pickupAt !== null && !pickupSlots().includes(pickupAt)) throw new Error('That pickup time has expired. Please choose another.')
  const order = createOrder(data.cart, name, pickupAt)
  return { data: { ...data, cart: [], orders: [order, ...data.orders], name: name.trim() }, order }
}

export function setOrderStatus(orders: Order[], id: string, status: OrderStatus) {
  const stages: OrderStatus[] = ['received', 'preparing', 'ready', 'collected']
  return orders.map((order) => order.id === id && stages.indexOf(status) > stages.indexOf(order.status) ? { ...order, status } : order)
}
