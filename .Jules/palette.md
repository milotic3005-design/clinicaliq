## 2024-06-10 - Search Clear Button Focus
**Learning:** When adding clear buttons inside search inputs, it's critical to restore focus to the input element (`inputRef.current?.focus()`) after clearing. Without this, keyboard users lose their place in the DOM structure.
**Action:** Always include focus restoration and `type="button"` for in-input actions.
