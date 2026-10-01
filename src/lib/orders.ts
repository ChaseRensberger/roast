import { type CartItem, totals } from './menu'
import { createId } from './id'

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'collected'
export type Order = {
  id: string
  ticket: string
  name: string
  items: CartItem[]
  createdAt: number
  pickupAt: number
  scheduled: boolean
  status: OrderStatus
  subtotal: number
  tax: number
  total: number
}
export const statusLabels: Record<OrderStatus, string> = { received: 'Received', preparing: 'Preparing', ready: 'Ready for pickup', collected: 'Collected' }
export const timeLabel = (time: number) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit' }).format(time)
export const dateLabel = (time: number) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric' }).format(time)

export function createOrder(items: CartItem[], name: string, pickupAt: number | null, now = Date.now()): Order {
  const id = createId()
  return { id, ticket: `R-${id.slice(0, 6).toUpperCase()}`, name: name.trim(), items: structuredClone(items), createdAt: now, pickupAt: pickupAt ?? now + 6 * 60_000, scheduled: pickupAt !== null, status: 'received', ...totals(items) }
}
export function advanceOrders(orders: Order[], now = Date.now()): Order[] {
  let changed = false
  const next = orders.map((order) => {
    if (order.status === 'ready' || order.status === 'collected') return order
    const startsAt = order.scheduled ? order.pickupAt - 6 * 60_000 : order.createdAt + 15_000
    const status = now >= order.pickupAt ? 'ready' : now >= startsAt ? 'preparing' : order.status
    if (status === order.status) return order
    changed = true
    return { ...order, status: status as OrderStatus }
  })
  return changed ? next : orders
}
