## 2026-06-28 - Adding a Clear Button to Search Bar
**Learning:** When adding a clear button to an interactive combobox, it's critical not just to clear the input value, but also to explicitly clear associated dropdown states (like autocomplete suggestions) and immediately restore browser focus back to the input element so the user can seamlessly continue typing.
**Action:** For all future micro-UX clear button implementations, ensure the `onClick` handler includes state resets for any related dynamic UI and an explicit `ref.current?.focus()` call.
