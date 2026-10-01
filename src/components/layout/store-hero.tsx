import { MapPinIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function StoreHero({ onShop }: { onShop: () => void }) {
  return <section className="mx-auto max-w-300 px-5 pt-10 sm:px-8 sm:pt-12"><div className="flex flex-wrap items-end gap-8"><div className="max-w-140"><Button className="mb-3 h-auto p-0 text-xs font-semibold uppercase tracking-[.16em] text-primary" variant="link" onClick={onShop}><MapPinIcon className="size-3" /> Fillmore Street</Button><h1 className="font-heading text-4xl leading-[1.04] tracking-tight sm:text-6xl">A little pause.<br /><span className="text-[#8c491a]">A very good cup.</span></h1><p className="mt-5 max-w-110 text-base leading-relaxed text-muted-foreground">Twelve drinks, pulled slow. Build yours the way you like it and we will have it on the counter with your name on it.</p></div><div className="mb-3 ml-auto hidden gap-2 sm:flex" aria-hidden="true"><span className="size-16 rounded-full bg-[#ffe1d0]" /><span className="size-16 rounded-[999px_999px_999px_8px] bg-[#e1eecc]" /><span className="size-16 rounded-full bg-card" /></div></div></section>
}
