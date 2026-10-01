# Roast

Roast is a coffee-ordering demo built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.
All orders and payments are simulated. The app has no backend, accounts, or payment service.
Shop details and availability are illustrative.

## Run locally

Install dependencies with `bun install`.
Start the app with `bun run dev`.
Vite prints the local address in the terminal.

## Demo flow

1. Choose a drink and customize its size, milk, and extras.
2. Add the drink to your cart. Edit it or remove it with an Undo action.
3. Continue to checkout and enter a pickup name.
4. Choose ASAP or a scheduled pickup time. Scheduled times use San Francisco time.
5. Place the demo order and follow its status.
6. Open Barista view from the footer to advance the order manually.

ASAP orders enter Preparing after 15 seconds and become Ready after six minutes.
Scheduled orders enter Preparing six minutes before pickup and become Ready at pickup time.
ASAP checkout stays available when the shop is closed so the demo works at any time.
Scheduled pickup stays within the displayed shop hours.

The cart, favorites, pickup name, and order history persist in IndexedDB, the database built into the current browser.
The app imports existing local-storage data on its first database initialization.
Tabs on the same origin share this data. Separate browsers and devices do not.
Database transactions keep concurrent tab updates from overwriting each other.
Checkout saves its order and clears its cart in one transaction.
If browser storage fails, the app shows a warning and runs only in the current session without shared writes.

For a two-sided demo, open `/#barista` in a second tab on the same origin.
Place an order in the customer tab, then change its status in the barista tab.
Customers can view and download a text receipt from the order tracker.
If another tab changes or removes a drink during an edit, saving shows a conflict message.
Return to the cart and reopen the drink to edit its current state.
Order IDs work on localhost, HTTPS, and plain HTTP addresses on a local network.

## Code structure

- `src/lib/` contains menu data, pricing, order timing, shop hours, receipts, stored-data validation, and database transactions.
- `src/hooks/` contains browser persistence, cart and order actions, and the customer/barista view switch.
- `src/components/` separates drinks, cart, checkout, orders, shop details, layout, and the barista view.
- `src/App.tsx` connects the feature components and controls overlays.
- `tests/domain.test.ts` covers pricing, cart merging, order timing, receipts, scheduling, and stored-data validation.
- `tests/shared-state.test.ts` covers concurrent updates, atomic checkout, stale edits, migration, and HTTP-safe order IDs.

Run `bun test` for tests, `bun run build` for a production build, and `bun run lint` for lint checks.
