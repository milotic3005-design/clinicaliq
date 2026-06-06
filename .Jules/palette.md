## 2024-06-06 - Search Clear Button Focus Restoration
**Learning:** When implementing a clear button for an input, restoring focus to the input after clearing is essential for keyboard accessibility, and explicit autocomplete states must be cleared to prevent stale UI.
**Action:** Always include `inputRef.current?.focus()` and clear suggestion state in the `onClick` handler of clear buttons.
