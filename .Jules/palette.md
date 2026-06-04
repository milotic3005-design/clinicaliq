## 2024-06-04 - Search Bar Clear Button
**Learning:** Adding a clear button to search bars improves usability, but it's crucial to explicitly manage focus (returning it to the input) and clear stale autocomplete suggestion states to prevent screen reader confusion and UI bugs.
**Action:** Always include focus restoration (`inputRef.current?.focus()`), suggestion clearing, `aria-label`, and `type="button"` when adding input clear controls.
