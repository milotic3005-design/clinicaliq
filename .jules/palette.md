## 2024-06-26 - Clear Button Focus Restoration
**Learning:** When adding a clear button to an input, it's critical to restore focus to the input element and clear related states (like autocomplete suggestions) to prevent stale UI and maintain a smooth keyboard navigation flow.
**Action:** Always include focus restoration logic (e.g., inputRef.current?.focus()) and state cleanup when implementing clear mechanisms.
