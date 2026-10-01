import { money, optionSummary, unitPrice } from './menu'
import { dateLabel, timeLabel, type Order } from './orders'
import { SHOP } from './shop'

export function receiptText(order: Order) {
  return ['ROAST · DEMO RECEIPT', SHOP.address, `${order.ticket} · ${dateLabel(order.createdAt)} at ${timeLabel(order.createdAt)}`, `Pickup for ${order.name} at ${timeLabel(order.pickupAt)} (San Francisco time)`, '', ...order.items.flatMap((item) => [`${item.quantity} × ${item.drink.name}  ${money(unitPrice(item.drink, item.options) * item.quantity)}`, `  ${optionSummary(item.drink, item.options)}`]), '', `Subtotal: ${money(order.subtotal)}`, `Tax (8.75%): ${money(order.tax)}`, `Total: ${money(order.total)}`, '', 'No payment collected. This is a simulated order.'].join('\n')
}

export function downloadReceipt(order: Order) {
  const url = URL.createObjectURL(new Blob([receiptText(order)], { type: 'text/plain;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `roast-${order.ticket.toLowerCase()}-receipt.txt`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
