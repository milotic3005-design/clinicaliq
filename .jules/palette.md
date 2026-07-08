## 2026-07-08 - Accessible Clear Button
**Learning:** Implementing a clear button requires focus restoration, dynamic inline padding for multiple icons, and clearing suggestion states to prevent stale UI.
**Action:** Always include focus restoration logic (`inputRef.current?.focus()`), explicit ARIA labels for icon buttons, and adjust padding (`pr-16`) when layering interactive elements inside text inputs.
