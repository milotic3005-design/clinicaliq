## 2024-05-24 - Search Input Clear Button
**Learning:** When implementing elements that clear or remove user input, explicitly clear any associated autocomplete/suggestion states to prevent stale UI, and include focus restoration logic.
**Action:** Use `inputRef.current?.focus()` to restore focus, explicit state clears for suggestions, and ensure icon-only buttons have descriptive `aria-label` attributes and `focus-visible` styles.
