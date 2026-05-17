## 2024-05-24 - Search Bar Clear Button Accessibility
**Learning:** When implementing elements that clear or remove user input (like a search clear button), it is critical to include focus restoration logic (`inputRef.current?.focus()`) to prevent users from losing keyboard context. Also, icon-only buttons need descriptive `aria-label` attributes and `focus-visible` styles.
**Action:** Always ensure focus restoration and proper ARIA labels are added for any future input-clearing or similar UX elements.
