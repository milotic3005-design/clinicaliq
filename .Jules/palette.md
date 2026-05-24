## 2024-05-24 - Input Focus Restoration
**Learning:** When implementing elements that clear or remove user input (like a search clear button), it is critical to explicitly restore focus back to the input element. Otherwise, keyboard users lose their place in the document flow and must manually tab back to the input to type a new query, causing friction.
**Action:** Always include focus restoration logic (e.g., `inputRef.current?.focus()`) when clearing inputs, and ensure icon-only clear buttons have descriptive `aria-label` attributes and `focus-visible` styles.
