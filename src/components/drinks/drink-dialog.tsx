import { useRef, useState } from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { groupsFor, initialOptions, isSoldOut, makeItem, money, unitPrice, type CartItem, type Drink } from '@/lib/menu'
import { DrinkCup } from './drink-cup'

type Props = { drink: Drink; item?: CartItem; onClose: () => void; onSave: (item: CartItem, original?: CartItem) => Promise<void> }
export function DrinkDialog({ drink, item, onClose, onSave }: Props) {
  const [options, setOptions] = useState(item?.options ?? initialOptions(drink))
  const [quantity, setQuantity] = useState(item?.quantity ?? 1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const locked = useRef(false)
  const groups = groupsFor(drink)
  const invalid = isSoldOut(drink) || groups.some((group) => group.options[options[group.key]]?.unavailable)
  async function save() {
    if (locked.current) return
    locked.current = true
    setSaving(true)
    setError('')
    try { await onSave(makeItem(drink, options, quantity), item); onClose() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Your drink could not be saved. Please try again.') }
    finally { locked.current = false; setSaving(false) }
  }

  return <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
    <DialogContent showCloseButton={!saving} className="max-h-[92dvh] max-w-[calc(100%-1.5rem)] gap-0 overflow-y-auto rounded-[2.25rem] p-0 sm:grid sm:h-[min(760px,88dvh)] sm:max-h-none sm:max-w-5xl sm:grid-cols-[minmax(300px,400px)_1fr] sm:overflow-hidden">
      <div className="relative min-h-56 overflow-hidden p-8 sm:min-h-0" style={{ background: drink.pad }}>
        <span className="absolute -top-12 -left-12 size-55 rounded-full bg-background/45" />
        <div className="relative grid h-full place-items-center"><DrinkCup drink={drink} large /></div>
        <div className="absolute right-6 bottom-5 left-6 flex gap-2"><Badge variant="secondary">{drink.category}</Badge><Badge variant="secondary">Made just for you</Badge></div>
      </div>
      <div className="flex min-h-0 flex-col bg-popover sm:overflow-hidden">
        <DialogHeader className="p-7 pb-4 sm:p-9 sm:pb-5"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-primary">{item ? 'Make it yours · edit drink' : drink.kicker}</p><DialogTitle className="font-heading text-3xl font-normal">{drink.name}</DialogTitle><DialogDescription className="leading-relaxed">{drink.description}</DialogDescription></DialogHeader>
        <fieldset disabled={saving} className="flex flex-col gap-6 px-7 pb-7 sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:px-9">
          {groups.map((group) => <fieldset key={group.key}><legend className="mb-2 text-xs font-bold uppercase tracking-[.12em]">{group.label} <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">{group.hint}</span></legend><div className="flex flex-wrap gap-2">{group.options.map((option, index) => <Button key={option.label} disabled={option.unavailable} aria-pressed={options[group.key] === index} variant={options[group.key] === index ? 'default' : 'outline'} size="sm" onClick={() => setOptions((current) => ({ ...current, [group.key]: index }))}>{option.label}{option.note && <span className="ml-1 opacity-65">{option.note}</span>}</Button>)}</div></fieldset>)}
          <p className="text-xs text-muted-foreground">Almond milk is unavailable today. Our oat milk is a lovely alternative. Tell our barista about any allergies before ordering.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {error && item && <Button variant="outline" onClick={onClose}>Return to cart</Button>}
        </fieldset>
        <div className="sticky bottom-0 flex flex-wrap items-center gap-4 border-t bg-popover p-6 sm:static sm:px-9">
          <div className="flex items-center rounded-full border bg-background p-1"><Button variant="ghost" size="icon-sm" disabled={saving || quantity === 1} aria-label="Decrease quantity" onClick={() => setQuantity((value) => value - 1)}><MinusIcon /></Button><span className="w-7 text-center text-sm font-bold">{quantity}</span><Button variant="ghost" size="icon-sm" disabled={saving || quantity === 99} aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}><PlusIcon /></Button></div>
          <Button className="min-w-52 flex-1" size="lg" disabled={invalid || saving} onClick={save}>{saving ? 'Saving…' : item ? 'Save changes' : 'Add to order'} · {money(unitPrice(drink, options) * quantity)}</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
}
