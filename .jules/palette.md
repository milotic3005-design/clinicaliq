## 2025-06-30 - Clear Button Focus Management
**Learning:** When clearing an input with a button, users expect focus to return to the input immediately so they can keep typing, otherwise they have to manually re-click the input.
**Action:** Always include `inputRef.current?.focus()` and clear related suggestion states when implementing input clear actions.
