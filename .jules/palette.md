## 2024-06-17 - Search Clear Focus Management
**Learning:** When implementing elements that clear user input (like a search clear button), failing to clear autocomplete/suggestion states leaves stale UI elements visible, and failing to restore focus forces keyboard users to manually re-navigate back to the input.
**Action:** Always include focus restoration logic (e.g., `inputRef.current?.focus()`), explicitly clear associated states, and ensure icon-only buttons have descriptive `aria-label` and `focus-visible` styles.
