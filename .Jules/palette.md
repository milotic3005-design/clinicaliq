## 2024-05-16 - Input Focus Restoration
**Learning:** When implementing elements that clear or remove user input (like a search clear button), users lose their keyboard context if focus is not restored.
**Action:** Always include focus restoration logic (e.g., `inputRef.current?.focus()`) and ensure icon-only buttons have descriptive `aria-label` attributes and `focus-visible` styles.
