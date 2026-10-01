import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowRightIcon, CoffeeIcon, ShoppingBagIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { StoreHeader } from '@/components/layout/store-header'
import { StoreHero } from '@/components/layout/store-hero'
import { DrinkMenu } from '@/components/drinks/drink-menu'
import { DrinkDialog } from '@/components/drinks/drink-dialog'
import { CartSheet } from '@/components/cart/cart-sheet'
import { CheckoutDialog } from '@/components/checkout/checkout-dialog'
import { OrderTracker } from '@/components/orders/order-tracker'
import { OrderHistory } from '@/components/orders/order-history'
import { ShopDialog } from '@/components/shop/shop-dialog'
import { BaristaView } from '@/components/barista/barista-view'
import { useRoast } from '@/hooks/use-roast'
import { useDemoView } from '@/hooks/use-demo-view'
import { money, totals, type CartItem, type Drink } from '@/lib/menu'
import { statusLabels, timeLabel } from '@/lib/orders'

type Overlay = null | { type: 'cart' | 'checkout' | 'shop' | 'history' } | { type: 'drink'; drink: Drink; item?: CartItem } | { type: 'track'; id: string }

export default function App() {
  const roast = useRoast()
  const { barista, navigate } = useDemoView()
  const [overlay, setOverlay] = useState<Overlay>(null)
  const count = roast.cart.reduce((sum, item) => sum + item.quantity, 0)
  const active = roast.orders.filter((order) => order.status !== 'collected')
  const tracked = overlay?.type === 'track' ? roast.orders.find((order) => order.id === overlay.id) : undefined
  const close = () => setOverlay(null)
  const home = () => { close(); navigate(false) }

  if (roast.loading) return <main className="grid min-h-screen place-items-center bg-background"><p role="status" className="font-heading text-xl">Opening the shop…</p></main>

  return <main className="min-h-screen overflow-x-hidden pb-24 sm:pb-8">
    <StoreHeader count={count} now={roast.now} barista={barista} onShop={() => setOverlay({ type: 'shop' })} onHistory={() => setOverlay({ type: 'history' })} onCart={() => setOverlay({ type: 'cart' })} onHome={home} />
    {roast.storageFailed && <p role="alert" className="mx-auto max-w-300 px-5 pt-4 text-sm text-destructive">Browser storage is unavailable. This tab can still run the demo, but changes might not survive a refresh or sync with other tabs.</p>}
    {barista ? <BaristaView orders={roast.orders} onStatus={roast.setStatus} onBack={home} /> : <>
      {!!active.length && <section aria-label="Active orders" className="mx-auto mt-5 flex max-w-300 flex-col gap-2 px-5 sm:px-8">{active.map((order) => <button key={order.id} onClick={() => setOverlay({ type: 'track', id: order.id })} className="flex items-center gap-3 rounded-2xl border border-[#65834e]/20 bg-[#e1eecc]/70 p-4 text-left"><CoffeeIcon className="size-5 shrink-0 text-[#3e512b]" /><div className="flex-1"><p className="text-sm font-semibold">{order.ticket} · {statusLabels[order.status]}</p><p className="mt-0.5 text-xs text-muted-foreground">{order.status === 'ready' ? `${order.name}, your drinks are waiting at the counter.` : `Pickup for ${order.name} · around ${timeLabel(order.pickupAt)}`}</p></div><span className="hidden text-xs font-semibold sm:inline">Track order</span><ArrowRightIcon className="size-4" /></button>)}</section>}
      <StoreHero onShop={() => setOverlay({ type: 'shop' })} />
      <DrinkMenu favorites={roast.favorites} onFavorite={roast.toggleFavorite} onSelect={(drink) => setOverlay({ type: 'drink', drink })} />
    </>}
    <footer className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-4 border-t px-5 py-6 text-xs text-muted-foreground sm:px-8"><p>Roast · a neighborhood coffee demo. No real payments or orders.</p><div className="flex gap-4"><button className="underline-offset-4 hover:underline" onClick={() => setOverlay({ type: 'shop' })}>Shop details</button><button className="underline-offset-4 hover:underline" onClick={() => { close(); navigate(!barista) }}>{barista ? 'Customer view' : 'Barista view'}</button></div></footer>
    {!barista && !overlay && count > 0 && <div className="fixed right-0 bottom-0 left-0 z-20 border-t bg-background/95 px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden"><Button className="h-12 w-full rounded-2xl" onClick={() => setOverlay({ type: 'cart' })}><ShoppingBagIcon /> {count} {count === 1 ? 'drink' : 'drinks'} · {money(totals(roast.cart).total)} <span className="ml-auto">View order →</span></Button></div>}
    <CartSheet open={overlay?.type === 'cart'} onOpenChange={(open) => !open && close()} items={roast.cart} onEdit={(item) => setOverlay({ type: 'drink', drink: item.drink, item })} onRemove={roast.removeItem} onQuantity={roast.changeQuantity} onCheckout={() => setOverlay({ type: 'checkout' })} />
    {overlay?.type === 'drink' && <DrinkDialog key={overlay.item?.key ?? overlay.drink.id} drink={overlay.drink} item={overlay.item} onSave={roast.saveItem} onClose={() => setOverlay(overlay.item ? { type: 'cart' } : null)} />}
    {overlay?.type === 'checkout' && <CheckoutDialog items={roast.cart} savedName={roast.name} now={roast.now} onClose={() => setOverlay({ type: 'cart' })} onPlace={async (name, pickupAt, expectedCart) => { const id = await roast.placeOrder(name, pickupAt, expectedCart); setOverlay({ type: 'track', id }) }} />}
    {tracked && <OrderTracker order={tracked} now={roast.now} onClose={close} onCollected={() => roast.setStatus(tracked.id, 'collected')} />}
    {overlay?.type === 'history' && <OrderHistory orders={roast.orders} onClose={close} onTrack={(id) => setOverlay({ type: 'track', id })} onReorder={async (items) => { try { if (await roast.reorder(items)) setOverlay({ type: 'cart' }) } catch { toast.error('Your order could not be added. Please try again.') } }} />}
    {overlay?.type === 'shop' && <ShopDialog now={roast.now} onClose={close} />}
    <Toaster position="bottom-center" richColors />
  </main>
}
