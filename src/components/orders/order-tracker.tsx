import { CheckIcon, CoffeeIcon, ShoppingBagIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { statusLabels, timeLabel, type Order } from '@/lib/orders'
import { OrderReceipt } from './order-receipt'

type Props = { order: Order; now: number; onClose: () => void; onCollected: () => void }
export function OrderTracker({ order, now, onClose, onCollected }: Props) {
  const stage = ['received', 'preparing', 'ready', 'collected'].indexOf(order.status)
  const minutes = Math.max(1, Math.ceil((order.pickupAt - now) / 60_000))
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
    <DialogHeader><p className="eyebrow">{order.ticket} · Fillmore Street</p><DialogTitle className="font-heading text-3xl font-normal">{stage >= 2 ? stage === 3 ? `Thanks, ${order.name}.` : `Come on over, ${order.name}.` : `Order in, ${order.name}.`}</DialogTitle><DialogDescription>{stage === 3 ? 'Hope that first sip made your day.' : stage === 2 ? 'Your drinks are waiting at the pickup counter.' : order.scheduled ? `See you at ${timeLabel(order.pickupAt)} · San Francisco time.` : `Your drinks should be ready in about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`}</DialogDescription></DialogHeader>
    <div className="my-2 grid place-items-center"><span className="grid size-24 place-items-center rounded-full bg-[#e1eecc]"><CoffeeIcon className="size-10 text-[#643312]" /></span></div>
    <div role="status" aria-live="polite" className="text-center text-sm font-semibold">{statusLabels[order.status]}</div>
    <ol className="grid grid-cols-3 gap-2">{[{ label: 'Received', icon: ShoppingBagIcon }, { label: 'Preparing', icon: CoffeeIcon }, { label: 'Ready', icon: CheckIcon }].map(({ label, icon: Icon }, index) => <li key={label} className={`rounded-2xl p-3 text-center text-xs ${index <= stage ? 'bg-[#e1eecc] text-[#3e512b]' : 'bg-card/50 text-muted-foreground'}`}><Icon className="mx-auto mb-2 size-5" />{label}</li>)}</ol>
    <p className="text-center text-xs text-muted-foreground">Pickup at the side counter · listen for your name.<br />Simulated live updates. Use Barista view to move things along.</p>
    <OrderReceipt order={order} />
    {order.status === 'ready' && <Button onClick={onCollected}>I’ve picked up my order</Button>}
    <Button variant="outline" onClick={onClose}>{order.status === 'collected' ? 'Back to the menu' : 'Keep browsing'}</Button>
  </DialogContent></Dialog>
}
