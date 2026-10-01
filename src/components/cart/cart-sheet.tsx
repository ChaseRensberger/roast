import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { money, optionSummary, totals, unitPrice, unavailableItem, type CartItem } from '@/lib/menu'
import { OrderTotals } from '@/components/orders/order-totals'

type Props = { open: boolean; onOpenChange: (open: boolean) => void; items: CartItem[]; onEdit: (item: CartItem) => void; onRemove: (key: string) => void; onQuantity: (key: string, delta: number) => void; onCheckout: () => void }
export function CartSheet({ open, onOpenChange, items, onEdit, onRemove, onQuantity, onCheckout }: Props) {
  const blocked = items.some(unavailableItem)
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-full max-w-107.5 gap-0 border-0 bg-popover p-0">
      <SheetHeader className="p-7"><SheetTitle className="font-heading text-2xl font-normal">Your order</SheetTitle><SheetDescription>Fillmore St pickup · made fresh for you</SheetDescription></SheetHeader>
      {!items.length ? <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"><span className="grid size-24 place-items-center rounded-full bg-card"><ShoppingBagIcon className="size-8 text-primary" /></span><h2 className="font-heading text-xl">Nothing brewing yet.</h2><p className="text-sm text-muted-foreground">Pick something from the board.</p><Button variant="outline" onClick={() => onOpenChange(false)}>Browse drinks</Button></div> : <>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 pb-5">
          {items.map((item) => <div key={item.key} className="rounded-3xl bg-card p-4">
            <div className="flex justify-between gap-3"><h3 className="font-heading text-base font-normal">{item.drink.name}</h3><span className="text-sm font-bold">{money(unitPrice(item.drink, item.options) * item.quantity)}</span></div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{optionSummary(item.drink, item.options)}</p>
            {unavailableItem(item) && <p className="mt-2 text-xs font-semibold text-destructive">An item or modifier is unavailable. Edit or remove this drink.</p>}
            <div className="mt-3 flex items-center gap-2"><Button variant="outline" size="icon-xs" aria-label={`Decrease ${item.drink.name} quantity`} onClick={() => onQuantity(item.key, -1)}><MinusIcon /></Button><span className="text-xs font-bold">{item.quantity}</span><Button variant="outline" size="icon-xs" disabled={item.quantity >= 99} aria-label={`Increase ${item.drink.name} quantity`} onClick={() => onQuantity(item.key, 1)}><PlusIcon /></Button><Button className="ml-auto" variant="ghost" size="sm" onClick={() => onEdit(item)}>Edit</Button><Button variant="ghost" size="icon-xs" aria-label={`Remove ${item.drink.name}`} onClick={() => onRemove(item.key)}><Trash2Icon /></Button></div>
          </div>)}
        </div>
        <div className="space-y-5 border-t p-6"><OrderTotals {...totals(items)} /><Button className="w-full" size="lg" disabled={blocked} onClick={onCheckout}>Continue to checkout</Button><p className="text-center text-xs text-muted-foreground">Demo checkout · no payment collected</p></div>
      </>}
    </SheetContent>
  </Sheet>
}
