import { money } from '@/lib/menu'

export function OrderTotals({ subtotal, tax, total }: { subtotal: number; tax: number; total: number }) {
  return <dl className="space-y-2 text-sm">
    <div className="flex justify-between text-muted-foreground"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
    <div className="flex justify-between text-muted-foreground"><dt>Tax <span className="text-xs">(8.75%)</span></dt><dd>{money(tax)}</dd></div>
    <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>Total</dt><dd>{money(total)}</dd></div>
  </dl>
}
