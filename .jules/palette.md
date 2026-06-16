## 2024-06-16 - Search Bar Clear Button Accessibility
**Learning:** When adding clear buttons for text inputs, explicitly managing focus (e.g., inputRef.current?.focus()) and clearing associated autocomplete states prevents a broken screen reader experience and stale UI.
**Action:** Always include focus restoration logic and explicitly clear suggestions/states when implementing input-clearing controls.
