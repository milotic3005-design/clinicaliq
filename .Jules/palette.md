## 2024-05-14 - Add Search Clear Button Accessibility
**Learning:** Adding a clear button to search inputs significantly improves interaction, but it must include proper focus management (e.g. `inputRef.current?.focus()`) so users don't lose context after clearing. The icon-only button also required an `aria-label`.
**Action:** Always include focus restoration logic when building clear or dismiss buttons, and ensure icon-only buttons have descriptive `aria-labels` and visual focus states.
