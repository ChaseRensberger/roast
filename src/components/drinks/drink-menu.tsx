import { useState } from 'react'
import { HeartIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { categories, drinks, isSoldOut, money, type Category, type Drink } from '@/lib/menu'
import { DrinkCup } from './drink-cup'

type Props = { favorites: string[]; onFavorite: (id: string) => void; onSelect: (drink: Drink) => void }
export function DrinkMenu({ favorites, onFavorite, onSelect }: Props) {
  const [category, setCategory] = useState<Category | 'Favorites'>('All')
  const filtered = drinks.filter((drink) => category === 'All' || (category === 'Favorites' ? favorites.includes(drink.id) : drink.category === category))
  return <>
    <nav className="mx-auto flex max-w-300 flex-wrap gap-2 px-5 pt-8 sm:px-8" aria-label="Drink categories">
      {[...categories, 'Favorites' as const].map((item) => <Button key={item} aria-pressed={category === item} variant={category === item ? 'default' : 'outline'} onClick={() => setCategory(item)}>{item === 'Favorites' && <HeartIcon />} {item}</Button>)}
    </nav>
    <section className="mx-auto grid max-w-300 grid-cols-1 gap-5 px-5 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-4" aria-label="Drink menu">
      {filtered.map((drink) => <Card key={drink.id} className="group relative gap-0 overflow-hidden border-0 py-0 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
        <button className="w-full text-left focus-visible:ring-3 focus-visible:ring-ring/50" disabled={isSoldOut(drink)} onClick={() => onSelect(drink)} aria-label={`${drink.name}, ${money(drink.price)}${isSoldOut(drink) ? ', sold out today' : ', customize drink'}`}>
          <div className="relative grid h-48 place-items-center overflow-hidden" style={{ background: drink.pad }}>
            <span className="absolute size-38 rounded-full bg-background/55" />
            <div className={isSoldOut(drink) ? 'opacity-40' : ''}><DrinkCup drink={drink} /></div>
            {(isSoldOut(drink) || drink.badge) && <Badge className="absolute top-3 left-3 border-0 bg-[#fff2eb] text-[#643312]">{isSoldOut(drink) ? 'Sold out today' : drink.badge}</Badge>}
          </div>
          <CardHeader className="gap-2 p-5">
            <p className="text-[10px] font-semibold tracking-[.12em] text-primary uppercase">{drink.kicker}</p>
            <CardTitle className="flex items-baseline justify-between gap-2 font-heading text-lg font-normal"><span>{drink.name}</span><span className="font-sans text-sm font-bold">{money(drink.price)}</span></CardTitle>
          </CardHeader>
          <CardContent className="pb-5 text-[13px] leading-relaxed text-muted-foreground">{drink.description}{isSoldOut(drink) && <span className="mt-2 block font-semibold">Back tomorrow. Try our Cortado instead.</span>}</CardContent>
        </button>
        <Button className="absolute top-3 right-3 rounded-full bg-background/90" variant="ghost" size="icon" aria-label={`${favorites.includes(drink.id) ? 'Unsave' : 'Save'} ${drink.name}`} aria-pressed={favorites.includes(drink.id)} onClick={() => onFavorite(drink.id)}><HeartIcon className={favorites.includes(drink.id) ? 'fill-primary text-primary' : ''} /></Button>
      </Card>)}
      {!filtered.length && <div className="col-span-full rounded-3xl border border-dashed p-12 text-center"><HeartIcon className="mx-auto mb-4 text-primary" /><h2 className="font-heading text-xl">Your usuals, right here.</h2><p className="mt-2 text-sm text-muted-foreground">Tap the heart on a drink to save it for next time.</p><Button className="mt-5" variant="outline" onClick={() => setCategory('All')}>Explore the menu</Button></div>}
    </section>
  </>
}
