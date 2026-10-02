Add a checkbox labeled “Hide sold-out drinks” to src/components/drinks/drink-menu.tsx, directly below the category buttons.

Requirements:
- Unchecked by default.
- When checked, exclude drinks for which the existing isSoldOut() helper returns true.
- Apply this filter together with the selected category, including Favorites.
- Keep the checkbox selection when switching categories; do not persist it across reloads.
- Preserve the existing drink order.
- If Favorites contains no saved drinks, keep the existing empty state. If saved drinks exist but are all hidden, show “No available favorites.” instead.
- Use existing styling conventions and add no dependencies.
- Ensure tests, build, and lint pass.

## Environment and verification

The project is at `/data/roast`. Keep installed tools under `/data` because
`/home/wingman` may be reset.

Use Bun at `/data/tools/package/bin/bun`. If it is missing, install it with:

    export BUN_INSTALL=/data/tools/package
    curl -fsSL https://bun.sh/install | bash

From `/data/roast`, install dependencies and verify the change with:

    /data/tools/package/bin/bun install --frozen-lockfile
    /data/tools/package/bin/bun run test
    /data/tools/package/bin/bun run build
    /data/tools/package/bin/bun run lint

Run the app so the preview can reach it:

    /data/tools/package/bin/bun run dev --host 0.0.0.0 --port 5173

The preview uses the hostname `nettuno`; ensure Vite allows that host.
Do not add project dependencies unless the feature requires them.
