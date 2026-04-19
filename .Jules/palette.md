## 2024-04-19 - Clear button focus management
**Learning:** When adding inline controls to inputs (like a clear button in a search bar), it's critical to programmatically return focus to the underlying input (`inputRef.current?.focus()`) after interaction. Otherwise, keyboard and screen reader users lose their place in the DOM hierarchy.
**Action:** Always test inline input controls with keyboard navigation to ensure focus explicitly returns to the logical next element post-interaction.
