## 2024-05-15 - Missing ARIA Labels on Icon-Only Modal Close Buttons
**Learning:** Icon-only close buttons in modals (like CADD calculator and drug details) frequently lack ARIA labels and distinct keyboard focus states, making them invisible to screen readers and difficult for keyboard navigation.
**Action:** Always add `aria-label` to icon-only buttons (e.g., `<X>` icons) and use `focus-visible:ring-2` to ensure proper keyboard accessibility.
