import { HistoryIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { money, type CartItem } from '@/lib/menu'
import { dateLabel, statusLabels, timeLabel, type Order } from '@/lib/orders'

type Props = { orders: Order[]; onClose: () => void; onTrack: (id: string) => void; onReorder: (items: CartItem[]) => void }
export function OrderHistory({ orders, onClose, onTrack, onReorder }: Props) {
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle className="font-heading text-3xl font-normal">Your coffee journal.</DialogTitle><DialogDescription>Recent orders, saved on this browser. No account needed.</DialogDescription></DialogHeader>
    {!orders.length ? <div className="py-10 text-center"><HistoryIcon className="mx-auto mb-4 size-8 text-primary" /><p className="font-heading text-xl">Your first cup is a click away.</p><p className="mt-2 text-sm text-muted-foreground">Placed orders and their receipts will appear here.</p><Button className="mt-5" variant="outline" onClick={onClose}>Explore the menu</Button></div> : orders.map((order) => <article key={order.id} className="space-y-3 rounded-2xl bg-card/60 p-4"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{order.ticket} · {order.name}</h3><p className="mt-1 text-xs text-muted-foreground">{dateLabel(order.createdAt)} · {timeLabel(order.createdAt)} · {statusLabels[order.status]}</p></div><span className="text-sm font-bold">{money(order.total)}</span></div><p className="text-sm text-muted-foreground">{order.items.map((item) => `${item.quantity} × ${item.drink.name}`).join(', ')}</p><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => onTrack(order.id)}>Track & receipt</Button><Button size="sm" onClick={() => onReorder(order.items)}>Order again</Button></div></article>)}
  </DialogContent></Dialog>
}
