## 2024-05-20 - Adding clear button with focus restoration
**Learning:** When implementing elements that clear or remove user input (like a search clear button), clearing the suggestions explicitly prevents stale UI states. Furthermore, focus restoration logic via refs (`inputRef.current?.focus()`) improves keyboard accessibility and seamless navigation.
**Action:** Always explicitly clear any associated autocomplete/suggestion states to prevent stale UI, include focus restoration logic, and ensure icon-only buttons have descriptive `aria-label` attributes and `focus-visible` styles.
