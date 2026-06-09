## 2025-02-18 - Restoring Focus When Clearing Inputs
**Learning:** When clearing an input with an icon button, focus is inherently lost from the input to the button. If the user wants to type immediately after clearing, they must click the input again. Providing an explicit focus restoration `inputRef.current?.focus()` ensures seamless typing and prevents frustration.
**Action:** Always include `.focus()` logic on the corresponding input ref when implementing clear buttons or similar interaction-resetting components.
