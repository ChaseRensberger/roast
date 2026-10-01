export type Category = 'All' | 'Espresso' | 'Slow & Cold' | 'Seasonal' | 'Not Coffee'
export type Drink = {
  id: string
  category: Category
  name: string
  kicker: string
  price: number
  description: string
  layers: { color: string; height: string }[]
  pad: string
  handle?: boolean
  straw?: boolean
  badge?: string
}
export type Options = Record<string, number>
export type CartItem = { key: string; drink: Drink; options: Options; quantity: number }
export type OptionGroup = { key: string; label: string; hint?: string; options: { label: string; note?: string; price: number; unavailable?: boolean }[] }

const C = { espresso: '#4a2b18', crema: '#a8703f', milk: '#f3e6cf', foam: '#fbf3e6', oat: '#e6d3b0', cold: '#33200f', matcha: '#8fa073', chai: '#c08a52', ice: '#dfe6e4' }
export const drinks: Drink[] = [
  { id: 'esp', category: 'Espresso', name: 'Roast Espresso', kicker: 'Ethiopia · Guji', price: 3.25, description: 'Two ounces of our house pull - stone fruit up front, cocoa on the finish.', handle: true, layers: [{ color: C.espresso, height: '62%' }, { color: C.crema, height: '38%' }], pad: '#ffe1d0' },
  { id: 'cor', category: 'Espresso', name: 'Cortado', kicker: 'Even split', price: 4.1, description: 'Equal parts espresso and steamed milk in a small glass. Nothing to hide behind.', layers: [{ color: C.espresso, height: '48%' }, { color: C.milk, height: '52%' }], pad: '#eee7db' },
  { id: 'flw', category: 'Espresso', name: 'Flat White', kicker: 'Silk microfoam', price: 4.75, description: 'A double ristretto under milk poured thin and glossy, no dry foam.', handle: true, layers: [{ color: C.espresso, height: '32%' }, { color: C.milk, height: '56%' }, { color: C.foam, height: '12%' }], pad: '#e1eecc' },
  { id: 'cap', category: 'Espresso', name: 'Cappuccino', kicker: 'Old school', price: 4.5, description: 'A proper cap - a third espresso, a third milk, a third cloud.', handle: true, layers: [{ color: C.espresso, height: '34%' }, { color: C.milk, height: '33%' }, { color: C.foam, height: '33%' }], pad: '#eee7db' },
  { id: 'bsl', category: 'Espresso', name: 'Brown Sugar Latte', kicker: 'House favorite', price: 5.4, badge: 'Most ordered', description: 'Slow-cooked brown sugar syrup, espresso, milk, a dusting of cinnamon.', handle: true, layers: [{ color: C.crema, height: '30%' }, { color: C.milk, height: '58%' }, { color: C.foam, height: '12%' }], pad: '#ffe1d0' },
  { id: 'cb', category: 'Slow & Cold', name: 'Cold Brew', kicker: '18-hour steep', price: 4.25, description: 'Coarse ground, steeped overnight, cut to strength. Low acid, high resolve.', straw: true, layers: [{ color: C.cold, height: '88%' }, { color: C.ice, height: '12%' }], pad: '#dcd3c4' },
  { id: 'shf', category: 'Slow & Cold', name: 'Salted Honey Cold Foam', kicker: 'Layered', price: 5.6, badge: 'Seasonal', description: 'Cold brew under a lid of salted honey foam that folds in as you drink.', straw: true, layers: [{ color: C.cold, height: '66%' }, { color: C.foam, height: '34%' }], pad: '#e1eecc' },
  { id: 'iol', category: 'Slow & Cold', name: 'Iced Oat Latte', kicker: 'Barista oat', price: 5.2, description: 'Espresso over oat milk and hand-cut ice. Sweet without adding anything.', straw: true, layers: [{ color: C.crema, height: '26%' }, { color: C.oat, height: '56%' }, { color: C.ice, height: '18%' }], pad: '#eee7db' },
  { id: 'hll', category: 'Seasonal', name: 'Honey Lavender Latte', kicker: 'Sonoma lavender', price: 5.75, badge: 'Seasonal', description: 'Steeped lavender honey, espresso, milk. Floral, not perfumed.', handle: true, layers: [{ color: C.crema, height: '28%' }, { color: C.milk, height: '60%' }, { color: C.foam, height: '12%' }], pad: '#e1eecc' },
  { id: 'mcc', category: 'Seasonal', name: 'Maple Cardamom Cortado', kicker: 'Small & warming', price: 5.1, description: 'Dark maple and cracked cardamom folded into a cortado.', layers: [{ color: C.espresso, height: '44%' }, { color: C.milk, height: '56%' }], pad: '#ffe1d0' },
  { id: 'mat', category: 'Not Coffee', name: 'Ceremonial Matcha', kicker: 'Uji, first harvest', price: 5.5, description: 'Whisked thin, poured over milk. Grassy, sweet, a little oceanic.', layers: [{ color: C.matcha, height: '42%' }, { color: C.milk, height: '58%' }], pad: '#e1eecc' },
  { id: 'chai', category: 'Not Coffee', name: 'Masala Chai', kicker: 'Cooked in the pot', price: 4.9, description: 'Assam boiled with ginger, clove and black pepper, finished with milk.', handle: true, layers: [{ color: C.chai, height: '52%' }, { color: C.milk, height: '40%' }, { color: C.foam, height: '8%' }], pad: '#eee7db' },
]
export const categories: Category[] = ['All', 'Espresso', 'Slow & Cold', 'Seasonal', 'Not Coffee']
export const money = (value: number) => `$${value.toFixed(2)}`
export const isSoldOut = (drink: Drink) => drink.id === 'mcc'

export function groupsFor(drink: Drink): OptionGroup[] {
  const groups: OptionGroup[] = [
    { key: 'size', label: 'Size', options: [{ label: 'Small', note: '8 oz', price: 0 }, { label: 'Medium', note: '12 oz', price: 0.6 }, { label: 'Large', note: '16 oz', price: 1.1 }] },
    { key: 'milk', label: 'Milk', options: [{ label: 'Whole', price: 0 }, { label: 'Oat', note: '+0.70', price: 0.7 }, { label: 'Almond', note: 'Unavailable today', price: 0.7, unavailable: true }, { label: 'No milk', price: 0 }] },
    { key: 'shots', label: 'Espresso', options: [{ label: 'Single', price: 0 }, { label: 'Double', note: '+0.90', price: 0.9 }, { label: 'Triple', note: '+1.80', price: 1.8 }] },
    { key: 'syrup', label: 'Syrup', hint: 'pumps to taste', options: [{ label: 'None', price: 0 }, { label: 'Vanilla', note: '+0.60', price: 0.6 }, { label: 'Brown sugar', note: '+0.60', price: 0.6 }, { label: 'Honey lavender', note: '+0.75', price: 0.75 }] },
    { key: 'serve', label: drink.straw ? 'Ice' : 'Serve', options: drink.straw ? [{ label: 'Light ice', price: 0 }, { label: 'Regular ice', price: 0 }, { label: 'Extra ice', price: 0 }] : [{ label: 'Warm', price: 0 }, { label: 'Hot', price: 0 }, { label: 'Extra hot', price: 0 }] },
  ]
  return groups.filter((group) => !(group.key === 'milk' && ['esp', 'cb'].includes(drink.id)) && !(group.key === 'shots' && drink.category === 'Not Coffee'))
}
export function initialOptions(drink: Drink): Options {
  return Object.fromEntries(groupsFor(drink).map((group) => [group.key, ['size', 'serve'].includes(group.key) ? 1 : 0]))
}
export function unitPrice(drink: Drink, options: Options) {
  return groupsFor(drink).reduce((total, group) => total + (group.options[options[group.key]]?.price ?? 0), drink.price)
}
export function optionSummary(drink: Drink, options: Options) {
  return groupsFor(drink).map((group) => group.options[options[group.key]]?.label ?? '').join(' · ')
}
export function makeItem(drink: Drink, options: Options, quantity: number): CartItem {
  return { key: `${drink.id}|${optionSummary(drink, options)}`, drink, options, quantity }
}
export function mergeItems(items: CartItem[], item: CartItem): CartItem[] {
  return items.some((entry) => entry.key === item.key)
    ? items.map((entry) => entry.key === item.key ? { ...entry, quantity: Math.min(99, entry.quantity + item.quantity) } : entry)
    : [...items, item]
}
export function unavailableItem(item: CartItem) {
  return isSoldOut(item.drink) || groupsFor(item.drink).some((group) => !group.options[item.options[group.key]] || group.options[item.options[group.key]].unavailable)
}
export function totals(items: CartItem[]) {
  const subtotal = Math.round(items.reduce((sum, item) => sum + unitPrice(item.drink, item.options) * item.quantity, 0) * 100) / 100
  const tax = Math.round(subtotal * 0.0875 * 100) / 100
  return { subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100 }
}
