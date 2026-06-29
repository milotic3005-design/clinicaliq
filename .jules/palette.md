## 2026-06-29 - Clear Search Button Micro-UX
**Learning:** When implementing elements that clear or remove user input, explicitly clearing associated autocomplete/suggestion states and restoring focus prevents stale UI and improves accessibility.
**Action:** Always include focus restoration logic (e.g., inputRef.current?.focus()) and clear related states when building input clear buttons.
