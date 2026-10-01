# Roast Ordering Demo Specification

## Goals

- Recreate the supplied Roast ordering design as a responsive React application.
- Use Vite, Bun, Tailwind CSS v4, and source-owned shadcn/ui components.
- Support the complete reference ordering flow in the browser: categories, drink details, conditional modifiers, cart operations, totals, and simulated checkout.

## Non-goals

- No backend, server database, authentication, inventory system, or real payment processing.
- No server-side persistence or sync across devices.
- No changes to the supplied menu, prices, tax rate, or pickup copy unless requested later.

## Scope

- Twelve fixed drinks split across All, Espresso, Slow & Cold, Seasonal, and Not Coffee categories.
- A drink dialog with size, milk, espresso, syrup, and serving/ice choices.
- Conditional modifiers matching the source: espresso and cold brew omit milk; non-coffee drinks omit espresso; cold drinks expose ice rather than serving temperature.
- A right-side cart sheet with line-item quantity controls, removal, 8.75% tax, and total.
- A checkout review with a customer-entered pickup name, ASAP or scheduled pickup, and simulated submission.
- Persistent carts, favorites, pickup names, and order history in browser IndexedDB, with migration from local storage.
- Transactional shared-state updates, atomic checkout, and conflict detection for stale cart edits.
- Editable cart items, removal with Undo, and a sticky mobile cart bar.
- Order tracking through Received, Preparing, Ready, and Collected, with downloadable text receipts.
- A local barista view with cross-tab status updates and automatic order progression.
- Shop details, San Francisco opening hours, and illustrative availability states.

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

- Browser storage retains the cart and demo orders; a backend is still required for cross-device use.
- Replace fixed menu data with a menu API when a backend exists.
- Integrate payment and order submission only after defining checkout, inventory, and fulfillment requirements.
