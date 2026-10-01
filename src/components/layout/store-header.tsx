import { CoffeeIcon, HistoryIcon, MapPinIcon, ShoppingBagIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shopIsOpen } from '@/lib/shop'

type Props = { count: number; now: number; barista: boolean; onShop: () => void; onHistory: () => void; onCart: () => void; onHome: () => void }
export function StoreHeader({ count, now, barista, onShop, onHistory, onCart, onHome }: Props) {
  return <header className="sticky top-0 z-20 border-b border-border/50 bg-background/90 backdrop-blur-md"><div className="mx-auto flex max-w-300 items-center gap-2 px-5 py-4 sm:gap-4 sm:px-8">
    <button className="mr-auto flex items-center gap-2 font-heading text-xl tracking-tight" onClick={onHome} aria-label="Roast home"><span className="grid size-8 place-items-center rounded-full bg-primary text-background"><CoffeeIcon className="size-5" /></span>Roast</button>
    <Button className="hidden sm:inline-flex" variant="ghost" onClick={onShop}><MapPinIcon /> Fillmore St <span className={`size-1.5 rounded-full ${shopIsOpen(now) ? 'bg-[#65834e]' : 'bg-muted-foreground'}`} /><span className="hidden text-xs text-muted-foreground lg:inline">{shopIsOpen(now) ? 'Open · ready in ~6 min' : 'Closed · demo ordering available'}</span></Button>
    {!barista && <><Button variant="ghost" onClick={onHistory} aria-label="Order history"><HistoryIcon /><span className="hidden md:inline">Orders</span></Button><Button variant="outline" onClick={onCart}><ShoppingBagIcon /> Cart <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{count}</span></Button></>}
    {barista && <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold">Barista demo</span>}
  </div></header>
}
