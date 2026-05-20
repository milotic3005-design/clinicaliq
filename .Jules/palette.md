## 2024-05-20 - Focus Restoration for Clear Buttons

**Learning:** When implementing elements that clear or remove user input (like a search clear button), if focus is not explicitly restored to the input element, users lose their keyboard context. This forces them to manually tab back to or click the input field again, disrupting the flow, especially for screen reader and keyboard-only users.

**Action:** Always include focus restoration logic (e.g., `inputRef.current?.focus()`) within the clear/reset handler. Additionally, ensure icon-only buttons have descriptive `aria-label` attributes and `focus-visible` styles to maintain a seamless and accessible user experience.
