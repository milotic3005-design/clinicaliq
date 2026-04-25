## 2024-04-25 - Search Clear Focus Retention
**Learning:** When implementing a clear button for search inputs, simply clearing the text is insufficient. Retaining focus (`inputRef.current?.focus()`) immediately after clearing prevents keyboard navigation disruption and allows the user to immediately type a new query.
**Action:** Always include `.focus()` on the corresponding input element when implementing clear/reset actions in form controls.
