## 2024-10-31 - Search Clear Button Accessibility
**Learning:** Implementing elements that clear user input requires proper ARIA labels, focus restoration, and suggestion state clearing to prevent stale UI and maintain keyboard accessibility.
**Action:** Always include focus restoration logic (`inputRef.current?.focus()`) and clear associated autocomplete states when implementing input clear buttons.
