import { useState } from 'react'
import { MinusIcon, PlusIcon, ShoppingBagIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

type Layer = { color: string; height: string }
type Drink = {
  id: string
  category: Category
  name: string
  kicker: string
  price: number
  description: string
  layers: Layer[]
  pad: string
  handle?: boolean
  straw?: boolean
  badge?: string
}
type Category = 'All' | 'Espresso' | 'Slow & Cold' | 'Seasonal' | 'Not Coffee'
type OptionGroup = { key: string; label: string; hint?: string; options: { label: string; note?: string; price: number }[] }
type CartItem = { key: string; drink: Drink; options: Record<string, number>; quantity: number }

const COLORS = {
  espresso: '#4a2b18', crema: '#a8703f', milk: '#f3e6cf', foam: '#fbf3e6', oat: '#e6d3b0',
  cold: '#33200f', matcha: '#8fa073', chai: '#c08a52', ice: '#dfe6e4',
}

const drinks: Drink[] = [
  { id: 'esp', category: 'Espresso', name: 'Roast Espresso', kicker: 'Ethiopia · Guji', price: 3.25, description: 'Two ounces of our house pull - stone fruit up front, cocoa on the finish.', handle: true, layers: [{ color: COLORS.espresso, height: '62%' }, { color: COLORS.crema, height: '38%' }], pad: '#ffe1d0' },
  { id: 'cor', category: 'Espresso', name: 'Cortado', kicker: 'Even split', price: 4.1, description: 'Equal parts espresso and steamed milk in a small glass. Nothing to hide behind.', layers: [{ color: COLORS.espresso, height: '48%' }, { color: COLORS.milk, height: '52%' }], pad: '#eee7db' },
  { id: 'flw', category: 'Espresso', name: 'Flat White', kicker: 'Silk microfoam', price: 4.75, description: 'A double ristretto under milk poured thin and glossy, no dry foam.', handle: true, layers: [{ color: COLORS.espresso, height: '32%' }, { color: COLORS.milk, height: '56%' }, { color: COLORS.foam, height: '12%' }], pad: '#e1eecc' },
  { id: 'cap', category: 'Espresso', name: 'Cappuccino', kicker: 'Old school', price: 4.5, description: 'A proper cap - a third espresso, a third milk, a third cloud.', handle: true, layers: [{ color: COLORS.espresso, height: '34%' }, { color: COLORS.milk, height: '33%' }, { color: COLORS.foam, height: '33%' }], pad: '#eee7db' },
  { id: 'bsl', category: 'Espresso', name: 'Brown Sugar Latte', kicker: 'House favorite', price: 5.4, badge: 'Most ordered', description: 'Slow-cooked brown sugar syrup, espresso, milk, a dusting of cinnamon.', handle: true, layers: [{ color: COLORS.crema, height: '30%' }, { color: COLORS.milk, height: '58%' }, { color: COLORS.foam, height: '12%' }], pad: '#ffe1d0' },
  { id: 'cb', category: 'Slow & Cold', name: 'Cold Brew', kicker: '18-hour steep', price: 4.25, description: 'Coarse ground, steeped overnight, cut to strength. Low acid, high resolve.', straw: true, layers: [{ color: COLORS.cold, height: '88%' }, { color: COLORS.ice, height: '12%' }], pad: '#dcd3c4' },
  { id: 'shf', category: 'Slow & Cold', name: 'Salted Honey Cold Foam', kicker: 'Layered', price: 5.6, badge: 'Seasonal', description: 'Cold brew under a lid of salted honey foam that folds in as you drink.', straw: true, layers: [{ color: COLORS.cold, height: '66%' }, { color: COLORS.foam, height: '34%' }], pad: '#e1eecc' },
  { id: 'iol', category: 'Slow & Cold', name: 'Iced Oat Latte', kicker: 'Barista oat', price: 5.2, description: 'Espresso over oat milk and hand-cut ice. Sweet without adding anything.', straw: true, layers: [{ color: COLORS.crema, height: '26%' }, { color: COLORS.oat, height: '56%' }, { color: COLORS.ice, height: '18%' }], pad: '#eee7db' },
  { id: 'hll', category: 'Seasonal', name: 'Honey Lavender Latte', kicker: 'Sonoma lavender', price: 5.75, badge: 'Seasonal', description: 'Steeped lavender honey, espresso, milk. Floral, not perfumed.', handle: true, layers: [{ color: COLORS.crema, height: '28%' }, { color: COLORS.milk, height: '60%' }, { color: COLORS.foam, height: '12%' }], pad: '#e1eecc' },
  { id: 'mcc', category: 'Seasonal', name: 'Maple Cardamom Cortado', kicker: 'Small & warming', price: 5.1, description: 'Dark maple and cracked cardamom folded into a cortado.', layers: [{ color: COLORS.espresso, height: '44%' }, { color: COLORS.milk, height: '56%' }], pad: '#ffe1d0' },
  { id: 'mat', category: 'Not Coffee', name: 'Ceremonial Matcha', kicker: 'Uji, first harvest', price: 5.5, description: 'Whisked thin, poured over milk. Grassy, sweet, a little oceanic.', layers: [{ color: COLORS.matcha, height: '42%' }, { color: COLORS.milk, height: '58%' }], pad: '#e1eecc' },
  { id: 'chai', category: 'Not Coffee', name: 'Masala Chai', kicker: 'Cooked in the pot', price: 4.9, description: 'Assam boiled with ginger, clove and black pepper, finished with milk.', handle: true, layers: [{ color: COLORS.chai, height: '52%' }, { color: COLORS.milk, height: '40%' }, { color: COLORS.foam, height: '8%' }], pad: '#eee7db' },
]

const categories: Category[] = ['All', 'Espresso', 'Slow & Cold', 'Seasonal', 'Not Coffee']
const money = (value: number) => `$${value.toFixed(2)}`

function groupsFor(drink: Drink): OptionGroup[] {
  const cold = Boolean(drink.straw)
  const groups: OptionGroup[] = [
    { key: 'size', label: 'Size', options: [{ label: 'Small', note: '8 oz', price: 0 }, { label: 'Medium', note: '12 oz', price: 0.6 }, { label: 'Large', note: '16 oz', price: 1.1 }] },
    { key: 'milk', label: 'Milk', options: [{ label: 'Whole', price: 0 }, { label: 'Oat', note: '+0.70', price: 0.7 }, { label: 'Almond', note: '+0.70', price: 0.7 }, { label: 'No milk', price: 0 }] },
    { key: 'shots', label: 'Espresso', options: [{ label: 'Single', price: 0 }, { label: 'Double', note: '+0.90', price: 0.9 }, { label: 'Triple', note: '+1.80', price: 1.8 }] },
    { key: 'syrup', label: 'Syrup', hint: 'pumps to taste', options: [{ label: 'None', price: 0 }, { label: 'Vanilla', note: '+0.60', price: 0.6 }, { label: 'Brown sugar', note: '+0.60', price: 0.6 }, { label: 'Honey lavender', note: '+0.75', price: 0.75 }] },
    { key: 'serve', label: cold ? 'Ice' : 'Serve', options: cold ? [{ label: 'Light ice', price: 0 }, { label: 'Regular ice', price: 0 }, { label: 'Extra ice', price: 0 }] : [{ label: 'Warm', price: 0 }, { label: 'Hot', price: 0 }, { label: 'Extra hot', price: 0 }] },
  ]
  return groups.filter((group) => !(group.key === 'milk' && (drink.id === 'esp' || drink.id === 'cb')) && !(group.key === 'shots' && drink.category === 'Not Coffee'))
}

function initialOptions(drink: Drink) {
  return Object.fromEntries(groupsFor(drink).map((group) => [group.key, group.key === 'size' || group.key === 'serve' ? 1 : 0]))
}

function unitPrice(drink: Drink, options: Record<string, number>) {
  return groupsFor(drink).reduce((total, group) => total + group.options[options[group.key]].price, drink.price)
}

function optionSummary(drink: Drink, options: Record<string, number>) {
  return groupsFor(drink).map((group) => group.options[options[group.key]].label).join(' · ')
}

function DrinkCup({ drink, large = false }: { drink: Drink; large?: boolean }) {
  return (
    <div className={cn('relative flex items-end', large ? 'scale-125' : '')} aria-hidden="true">
      {drink.handle && <div className="absolute top-6 -right-5 h-10 w-7 rounded-r-full border-[5px] border-l-0 border-black/15" />}
      {drink.straw && <div className="absolute -top-7 right-3 h-16 w-2.5 rotate-[11deg] rounded-full bg-primary" />}
      <div className="flex h-24 w-[74px] flex-col justify-end overflow-hidden rounded-t-[14px] rounded-b-[34px] border-2 border-black/10 shadow-sm">
        {drink.layers.map((layer, index) => <div key={index} style={{ height: layer.height, background: layer.color }} />)}
      </div>
    </div>
  )
}

function App() {
  const [category, setCategory] = useState<Category>('All')
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null)
  const [options, setOptions] = useState<Record<string, number>>({})
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [confirmation, setConfirmation] = useState<{ name: string; ticket: string } | null>(null)

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + unitPrice(item.drink, item.options) * item.quantity, 0)
  const tax = subtotal * 0.0875

  const selectDrink = (drink: Drink) => {
    setSelectedDrink(drink)
    setOptions(initialOptions(drink))
    setQuantity(1)
  }

  const addToCart = () => {
    if (!selectedDrink) return
    const key = `${selectedDrink.id}|${optionSummary(selectedDrink, options)}`
    setCart((items) => {
      const existing = items.find((item) => item.key === key)
      return existing
        ? items.map((item) => item.key === key ? { ...item, quantity: item.quantity + quantity } : item)
        : [...items, { key, drink: selectedDrink, options, quantity }]
    })
    toast.success(`${selectedDrink.name} added to your order`)
    setSelectedDrink(null)
  }

  const changeCartQuantity = (key: string, delta: number) => setCart((items) => items
    .map((item) => item.key === key ? { ...item, quantity: item.quantity + delta } : item)
    .filter((item) => item.quantity > 0))

  const pay = () => {
    const names = ['Ada', 'Ren', 'Mika', 'Jonah', 'Priya']
    setConfirmation({ name: names[Math.floor(Math.random() * names.length)], ticket: `A-${200 + Math.floor(Math.random() * 90)}` })
    setCart([])
  }

  return (
    <main className="min-h-screen overflow-x-hidden pb-20">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-300 items-center gap-4 px-5 py-4 sm:px-8">
          <div className="mr-auto flex items-center gap-2.5 font-heading text-xl tracking-tight">
            <span className="grid size-7 place-items-center rounded-full bg-primary"><span className="size-2.5 rounded-full bg-background" /></span>
            Roast
          </div>
          <p className="hidden text-xs text-muted-foreground md:block">Pickup · Fillmore St · ready in ~6 min</p>
          <Button variant="outline" onClick={() => setCartOpen(true)}>
            <ShoppingBagIcon data-icon="inline-start" /> Cart
            <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{cartCount}</span>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-300 px-5 pt-10 sm:px-8 sm:pt-12">
        <div className="flex flex-wrap items-end gap-8">
          <div className="max-w-140">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.16em] text-primary">Fillmore Street</p>
            <h1 className="font-heading text-4xl leading-[1.04] tracking-tight sm:text-6xl">Good morning.<br /><span className="text-[#8c491a]">What are we drinking?</span></h1>
            <p className="mt-5 max-w-110 text-base leading-relaxed text-muted-foreground">Twelve drinks, pulled slow. Build yours the way you like it and we will have it on the counter with your name on it.</p>
          </div>
          <div className="mb-3 ml-auto hidden gap-2 sm:flex" aria-hidden="true">
            <span className="size-16 rounded-full bg-[#ffe1d0]" /><span className="size-16 rounded-[999px_999px_999px_8px] bg-[#e1eecc]" /><span className="size-16 rounded-full bg-card" />
          </div>
        </div>
      </section>

      <nav className="mx-auto flex max-w-300 flex-wrap gap-2 px-5 pt-8 sm:px-8" aria-label="Drink categories">
        {categories.map((item) => <Button key={item} variant={category === item ? 'default' : 'outline'} onClick={() => setCategory(item)}>{item}</Button>)}
      </nav>

      <section className="mx-auto grid max-w-300 grid-cols-1 gap-5 px-5 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-4" aria-label="Drink menu">
        {drinks.filter((drink) => category === 'All' || drink.category === category).map((drink) => (
          <Card key={drink.id} role="button" tabIndex={0} onClick={() => selectDrink(drink)} onKeyDown={(event) => event.key === 'Enter' && selectDrink(drink)} className="group cursor-pointer gap-0 overflow-hidden border-0 py-0 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50">
            <div className="relative grid h-48 place-items-center overflow-hidden" style={{ background: drink.pad }}>
              <span className="absolute size-38 rounded-full bg-background/55" />
              <DrinkCup drink={drink} />
              {drink.badge && <Badge className="absolute top-3 left-3 border-0 bg-[#fff2eb] text-[#643312]">{drink.badge}</Badge>}
            </div>
            <CardHeader className="gap-2 p-5">
              <p className="text-[10px] font-semibold tracking-[.12em] text-primary uppercase">{drink.kicker}</p>
              <CardTitle className="flex items-baseline justify-between gap-2 font-heading text-lg font-normal"><span>{drink.name}</span><span className="font-sans text-sm font-bold">{money(drink.price)}</span></CardTitle>
            </CardHeader>
            <CardContent className="pb-5 text-[13px] leading-relaxed text-muted-foreground">{drink.description}</CardContent>
          </Card>
        ))}
      </section>

      <Dialog open={Boolean(selectedDrink)} onOpenChange={(open) => !open && setSelectedDrink(null)}>
        {selectedDrink && <DialogContent showCloseButton={false} className="max-h-[92dvh] max-w-[calc(100%-1.5rem)] gap-0 overflow-y-auto rounded-[2.25rem] p-0 sm:grid sm:h-[min(760px,88dvh)] sm:max-h-none sm:max-w-5xl sm:grid-cols-[minmax(300px,400px)_1fr] sm:overflow-hidden">
          <div className="relative min-h-60 overflow-hidden p-8 sm:min-h-0" style={{ background: selectedDrink.pad }}>
            <span className="absolute -top-12 -left-12 size-55 rounded-full bg-background/45" />
            <div className="relative grid h-full place-items-center"><DrinkCup drink={selectedDrink} large /></div>
            <div className="absolute right-6 bottom-5 left-6 flex flex-wrap gap-1.5"><Badge variant="secondary">{selectedDrink.category}</Badge><Badge variant="secondary">Ready ~6 min</Badge></div>
          </div>
          <div className="flex min-h-0 flex-col bg-popover sm:overflow-hidden">
            <DialogHeader className="p-7 pb-4 sm:p-9 sm:pb-5">
              <div className="flex justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-primary">{selectedDrink.kicker}</p><DialogTitle className="mt-1.5 font-heading text-3xl font-normal">{selectedDrink.name}</DialogTitle></div><Button variant="ghost" size="icon" aria-label="Close drink options" onClick={() => setSelectedDrink(null)}><XIcon /></Button></div>
              <DialogDescription className="max-w-115 leading-relaxed">{selectedDrink.description}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6 px-7 pb-7 sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:px-9">
              {groupsFor(selectedDrink).map((group) => <div key={group.key}>
                <div className="mb-2 flex items-baseline justify-between"><h3 className="text-xs font-bold uppercase tracking-[.12em]">{group.label}</h3><span className="text-xs text-muted-foreground">{group.hint}</span></div>
                <div className="flex flex-wrap gap-2">{group.options.map((option, index) => <Button key={option.label} variant={options[group.key] === index ? 'default' : 'outline'} size="sm" onClick={() => setOptions((current) => ({ ...current, [group.key]: index }))}>{option.label}{option.note && <span className="ml-1 opacity-65">{option.note}</span>}</Button>)}</div>
              </div>)}
            </div>
            <div className="sticky bottom-0 flex flex-wrap items-center gap-4 border-t bg-popover p-6 sm:static sm:px-9">
              <div className="flex items-center rounded-full border bg-background p-1"><Button variant="ghost" size="icon-sm" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><MinusIcon /></Button><span className="w-7 text-center text-sm font-bold">{quantity}</span><Button variant="ghost" size="icon-sm" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}><PlusIcon /></Button></div>
              <Button className="min-w-52 flex-1" size="lg" onClick={addToCart}>Add to order <span className="opacity-70">·</span> {money(unitPrice(selectedDrink, options) * quantity)}</Button>
            </div>
          </div>
        </DialogContent>}
      </Dialog>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent showCloseButton={false} className="w-full max-w-107.5 gap-0 border-0 bg-popover p-0">
          <SheetHeader className="flex-row items-start justify-between p-7"><div><SheetTitle className="font-heading text-2xl font-normal">{confirmation ? 'Thank you' : 'Your order'}</SheetTitle><SheetDescription className="mt-1">Fillmore St pickup</SheetDescription></div><Button variant="ghost" size="icon" aria-label="Close cart" onClick={() => setCartOpen(false)}><XIcon /></Button></SheetHeader>
          {confirmation ? <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center rise-in"><div className="grid size-30 place-items-center rounded-full bg-[#e1eecc]"><div className="h-17 w-14 rounded-t-xl rounded-b-[1.6rem] bg-[#8c491a]" /></div><h2 className="font-heading text-2xl">Order in, {confirmation.name}</h2><p className="max-w-72 text-sm leading-relaxed text-muted-foreground">Ticket {confirmation.ticket} · ready in about 6 minutes at the Fillmore St counter.</p><Button variant="outline" onClick={() => { setConfirmation(null); setCartOpen(false) }}>Start another order</Button></div> : cart.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"><span className="size-24 rounded-full bg-card" /><p className="max-w-56 text-sm leading-relaxed text-muted-foreground">Nothing brewing yet. Pick something from the board.</p></div> : <><div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 pb-5">{cart.map((item) => <div key={item.key} className="flex gap-3 rounded-3xl bg-card p-3.5"><div className="flex h-14 w-11 shrink-0 flex-col justify-end overflow-hidden rounded-t-lg rounded-b-2xl">{item.drink.layers.map((layer, index) => <span key={index} style={{ height: layer.height, background: layer.color }} />)}</div><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><h3 className="font-heading text-base font-normal">{item.drink.name}</h3><span className="text-sm font-bold">{money(unitPrice(item.drink, item.options) * item.quantity)}</span></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{optionSummary(item.drink, item.options)}</p><div className="mt-2 flex items-center gap-2"><Button variant="outline" size="icon-xs" aria-label={`Decrease ${item.drink.name} quantity`} onClick={() => changeCartQuantity(item.key, -1)}><MinusIcon /></Button><span className="text-xs font-bold">{item.quantity}</span><Button variant="outline" size="icon-xs" aria-label={`Increase ${item.drink.name} quantity`} onClick={() => changeCartQuantity(item.key, 1)}><PlusIcon /></Button><Button variant="link" size="xs" className="ml-auto" onClick={() => setCart((items) => items.filter((cartItem) => cartItem.key !== item.key))}>Remove</Button></div></div></div>)}</div><div className="p-6 pt-2"><Separator /><div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground"><p className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></p><p className="flex justify-between"><span>Tax</span><span>{money(tax)}</span></p></div><div className="mt-3 flex justify-between font-heading text-xl"><span>Total</span><span>{money(subtotal + tax)}</span></div><Button className="mt-5 w-full" size="lg" onClick={pay}>Pay {money(subtotal + tax)}</Button><p className="mt-2 text-center text-xs text-muted-foreground">Apple Pay · card on file ending 4402</p></div></>}
        </SheetContent>
      </Sheet>
      <Toaster position="bottom-center" richColors />
    </main>
  )
}

export default App
