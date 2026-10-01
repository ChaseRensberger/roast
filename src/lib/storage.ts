import { drinks, groupsFor, makeItem, type CartItem } from './menu'
import type { Order } from './orders'

export function readCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const drink = drinks.find((entry) => entry.id === item.drink?.id)
    if (!drink || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || !item.options || typeof item.options !== 'object') return []
    if (groupsFor(drink).some((group) => !Number.isInteger(item.options[group.key]) || !group.options[item.options[group.key]])) return []
    return [makeItem(drink, item.options, item.quantity)]
  })
}
export function readFavorites(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && drinks.some((drink) => drink.id === id)) : []
}
export function readOrders(value: unknown): Order[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((order) => {
    if (!order || typeof order !== 'object' || typeof order.id !== 'string' || typeof order.ticket !== 'string' || typeof order.name !== 'string' || !['received', 'preparing', 'ready', 'collected'].includes(order.status) || ![order.createdAt, order.pickupAt, order.subtotal, order.tax, order.total].every((number) => typeof number === 'number' && Number.isFinite(number)) || typeof order.scheduled !== 'boolean') return []
    const items = readCart(order.items)
    return items.length === order.items?.length && items.length ? [{ ...order, items } as Order] : []
  })
}
