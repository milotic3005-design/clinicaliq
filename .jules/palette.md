## 2024-06-19 - Clear Button Context Restoration
**Learning:** When implementing a clear button for an autocomplete input, it's critical to restore focus to the input and explicitly clear suggestion states to prevent stale UI.
**Action:** Always include focus restoration logic (e.g., inputRef.current?.focus()) and state clearing in the clear button's onClick handler.
