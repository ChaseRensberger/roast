import type { Drink } from '@/lib/menu'
import { cn } from '@/lib/utils'

export function DrinkCup({ drink, large = false }: { drink: Drink; large?: boolean }) {
  return <div className={cn('relative flex items-end', large && 'scale-125')} aria-hidden="true">
    {drink.handle && <div className="absolute top-6 -right-5 h-10 w-7 rounded-r-full border-[5px] border-l-0 border-black/15" />}
    {drink.straw && <div className="absolute -top-7 right-3 h-16 w-2.5 rotate-[11deg] rounded-full bg-primary" />}
    <div className="flex h-24 w-[74px] flex-col justify-end overflow-hidden rounded-t-[14px] rounded-b-[34px] border-2 border-black/10 shadow-sm">
      {drink.layers.map((layer, index) => <div key={index} style={{ height: layer.height, background: layer.color }} />)}
    </div>
  </div>
}
