## 2024-05-18 - Search Input Clear Button
**Learning:** When implementing elements that clear or remove user input (like a search clear button), always include focus restoration logic (e.g., `inputRef.current?.focus()`), explicitly clear any associated autocomplete/suggestion states to prevent stale UI, and ensure icon-only buttons have descriptive `aria-label` attributes and `focus-visible` styles.
**Action:** Always ensure any "clear input" interactions restore focus to the input element and clean up associated state arrays.
