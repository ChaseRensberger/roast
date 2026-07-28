# Roast Ordering Demo Specification

## Goals

- Recreate the supplied Roast ordering design as a responsive React application.
- Use Vite, Bun, Tailwind CSS v4, and source-owned shadcn/ui components.
- Support the complete reference ordering flow in the browser: categories, drink details, conditional modifiers, cart operations, totals, and simulated checkout.

## Non-goals

- No backend, database, authentication, inventory system, or real payment processing.
- No persistence across page reloads.
- No changes to the supplied menu, prices, tax rate, or pickup copy unless requested later.

## Scope

- Twelve fixed drinks split across All, Espresso, Slow & Cold, Seasonal, and Not Coffee categories.
- A drink dialog with size, milk, espresso, syrup, and serving/ice choices.
- Conditional modifiers matching the source: espresso and cold brew omit milk; non-coffee drinks omit espresso; cold drinks expose ice rather than serving temperature.
- A right-side cart sheet with line-item quantity controls, removal, 8.75% tax, and total.
- A simulated payment action that clears the cart and shows a randomized pickup name and ticket.

## Key Requirements

- The visual system uses the supplied warm cream, terracotta, sage, Caprasimo, and Figtree direction.
- Drink imagery remains abstract CSS cup illustrations rather than external photography.
- All interactions are keyboard reachable and overlays provide accessible titles.
- The interface adapts for mobile screens and respects reduced-motion preferences.

## Decisions

- React is the implementation framework.
- The application is a client-only demo; Pay has no external side effects.
- Bun manages packages and runs Vite commands.
- shadcn/ui supplies the reusable Button, Card, Dialog, Sheet, Badge, Separator, and toast primitives.

## Future Considerations

- Add local storage if a retained cart is needed.
- Replace fixed menu data with a menu API when a backend exists.
- Integrate payment and order submission only after defining checkout, inventory, and fulfillment requirements.
