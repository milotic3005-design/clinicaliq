## 2024-05-24 - Search Input Clear Button Interactions
**Learning:** When implementing elements that clear or remove user input (like a search clear button), it's critical to restore focus to the input (`inputRef.current?.focus()`) so users don't lose their place, and to explicitly clear any associated autocomplete/suggestion states to prevent stale UI.
**Action:** Always include focus restoration logic, clear suggestion states, and ensure icon-only buttons have descriptive `aria-label` attributes and `focus-visible` styles when adding clear buttons to inputs.
