## 2024-06-18 - Clear Button Accessibility
**Learning:** When implementing elements that clear user input, explicitly restoring focus to the input (`inputRef.current?.focus()`) and clearing associated suggestion states prevents stale UI and improves keyboard accessibility. Icon-only buttons must have descriptive `aria-label` and `focus-visible` styles to be accessible.
**Action:** Always include focus restoration logic, clear suggestion states, and ensure icon-only buttons have `aria-label`, `type="button"`, and `focus-visible` styles when building input clearing interactions.
