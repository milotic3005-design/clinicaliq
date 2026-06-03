## 2024-06-03 - Custom Clear Buttons
**Learning:** When implementing a clear button for an autocomplete input, it's crucial to explicitly reset all associated suggestion states (e.g. `setSuggestions([])` and `setShowSuggestions(false)`) and restore focus (`inputRef.current?.focus()`).
**Action:** Always ensure state cleanup and focus restoration when implementing search or filter clear actions.
