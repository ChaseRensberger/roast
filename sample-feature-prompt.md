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
