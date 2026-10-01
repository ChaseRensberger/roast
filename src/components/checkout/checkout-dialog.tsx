import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ClockIcon, CoffeeIcon, LoaderCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OrderTotals } from '@/components/orders/order-totals'
import { money, optionSummary, totals, unitPrice, unavailableItem, type CartItem } from '@/lib/menu'
import { timeLabel } from '@/lib/orders'
import { pickupSlots, shopIsOpen } from '@/lib/shop'

type Props = { items: CartItem[]; savedName: string; now: number; onClose: () => void; onPlace: (name: string, pickupAt: number | null, expectedCart: CartItem[]) => Promise<void> }
export function CheckoutDialog({ items, savedName, now, onClose, onPlace }: Props) {
  const [name, setName] = useState(savedName)
  const [scheduled, setScheduled] = useState(false)
  const [slot, setSlot] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const locked = useRef(false)
  const latest = useRef({ items, onPlace })
  latest.current = { items, onPlace }
  const slots = pickupSlots(now)
  const blocked = !items.length || items.some(unavailableItem)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (locked.current) return
    if (!name.trim()) { setError('Please enter a name for pickup.'); return }
    if (blocked) { setError('Your cart has changed. Please review it before ordering.'); return }
    const pickupAt = scheduled ? Number(slot) : null
    if (scheduled && (!slot || !slots.includes(Number(slot)))) { setError('Please choose an available pickup time.'); return }
    const expectedCart = structuredClone(items)
    const snapshot = JSON.stringify(expectedCart)
    locked.current = true
    setError('')
    setProcessing(true)
    timer.current = setTimeout(async () => {
      try {
        if (snapshot !== JSON.stringify(latest.current.items)) throw new Error('Your cart changed in another tab. Please review your order and try again.')
        if (pickupAt !== null && !pickupSlots().includes(pickupAt)) throw new Error('That pickup time has expired. Please choose another.')
        await latest.current.onPlace(name.trim(), pickupAt, expectedCart)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'We could not place your demo order. Please try again.')
        setProcessing(false)
        locked.current = false
      }
    }, 1200)
  }

  return <Dialog open onOpenChange={(open) => !open && !processing && onClose()}>
    <DialogContent showCloseButton={!processing} className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><p className="eyebrow">One last thing</p><DialogTitle className="font-heading text-3xl font-normal">Meet you at the counter.</DialogTitle><DialogDescription>Review your drinks and tell us who we’re calling.</DialogDescription></DialogHeader>
      <form className="space-y-6" onSubmit={submit}>
        <fieldset disabled={processing} className="space-y-5">
          <div><label className="field-label" htmlFor="pickup-name">Name for pickup</label><input id="pickup-name" className="field" autoComplete="given-name" placeholder="What should we call you?" maxLength={40} value={name} onChange={(event) => setName(event.target.value)} required /></div>
          <div><p className="field-label">Pickup time <span className="font-normal text-muted-foreground">· San Francisco time</span></p><div className="grid grid-cols-2 gap-2"><Button type="button" variant={!scheduled ? 'default' : 'outline'} aria-pressed={!scheduled} onClick={() => setScheduled(false)}><CoffeeIcon /> ASAP · ~6 min</Button><Button type="button" variant={scheduled ? 'default' : 'outline'} aria-pressed={scheduled} disabled={!slots.length} onClick={() => setScheduled(true)}><ClockIcon /> Schedule</Button></div>
            {scheduled && <div className="mt-3"><label className="sr-only" htmlFor="pickup-time">Scheduled pickup time</label><select className="field" id="pickup-time" required value={slot} onChange={(event) => setSlot(event.target.value)}><option value="">Choose a time</option>{slots.map((time) => <option key={time} value={time}>{timeLabel(time)}</option>)}</select></div>}
            {!shopIsOpen(now) && <p className="mt-2 text-xs text-muted-foreground">The shop is currently closed. ASAP orders remain enabled for this demo.</p>}
          </div>
        </fieldset>
        <div className="space-y-3 rounded-2xl bg-card/60 p-4"><h3 className="text-xs font-bold uppercase tracking-wider">Your drinks</h3>{items.map((item) => <div key={item.key}><div className="flex justify-between gap-4 text-sm"><span className="font-semibold">{item.quantity} × {item.drink.name}</span><span>{money(unitPrice(item.drink, item.options) * item.quantity)}</span></div><p className="mt-1 text-xs text-muted-foreground">{optionSummary(item.drink, item.options)}</p></div>)}</div>
        <OrderTotals {...totals(items)} />
        {(error || blocked) && <p role="alert" className="text-sm text-destructive">{error || 'Your cart contains unavailable items or is empty. Go back to review it.'}</p>}
        <div className="rounded-2xl border border-dashed p-3 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Just a demo.</strong> No payment is collected and no order is sent to a real shop. Shop details and availability are illustrative.</div>
        <Button type="submit" size="lg" className="w-full" disabled={processing || blocked}>{processing ? <><LoaderCircleIcon className="animate-spin" /> Placing your order…</> : `Place demo order · ${money(totals(items).total)}`}</Button>
        <div aria-live="polite" className="sr-only">{processing ? 'Placing your demo order. Please wait.' : ''}</div>
        {!processing && <Button className="w-full" type="button" variant="ghost" onClick={onClose}>Back to cart</Button>}
      </form>
    </DialogContent>
  </Dialog>
}
