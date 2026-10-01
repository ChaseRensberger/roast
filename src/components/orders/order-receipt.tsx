import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { money, optionSummary, unitPrice } from '@/lib/menu'
import { dateLabel, timeLabel, type Order } from '@/lib/orders'
import { downloadReceipt } from '@/lib/receipt'
import { OrderTotals } from './order-totals'

export function OrderReceipt({ order }: { order: Order }) {
  return <details className="rounded-2xl border bg-background/60 p-4">
    <summary className="cursor-pointer text-sm font-semibold">View receipt · {money(order.total)}</summary>
    <div className="mt-4 space-y-4"><p className="text-xs text-muted-foreground">{order.ticket} · {dateLabel(order.createdAt)} at {timeLabel(order.createdAt)}<br />Pickup for {order.name} · {timeLabel(order.pickupAt)}</p>
      {order.items.map((item) => <div key={item.key}><div className="flex justify-between gap-3 text-sm"><span>{item.quantity} × {item.drink.name}</span><span>{money(unitPrice(item.drink, item.options) * item.quantity)}</span></div><p className="mt-1 text-xs text-muted-foreground">{optionSummary(item.drink, item.options)}</p></div>)}
      <OrderTotals {...order} /><p className="text-xs text-muted-foreground">Demo receipt · no payment collected</p><Button variant="outline" className="w-full" onClick={() => downloadReceipt(order)}><DownloadIcon /> Download receipt</Button>
    </div>
  </details>
}
