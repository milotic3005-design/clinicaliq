## 2024-06-12 - Search Bar Clear Button with Focus Restoration
**Learning:** When adding a clear button to an input, it's essential to not just clear the input state and autocomplete suggestions, but also forcefully restore focus to the input element so keyboard users do not lose their place in the DOM hierarchy.
**Action:** Always include `inputRef.current?.focus()` in the clear action for search inputs, ensuring proper `aria-label` and keyboard `focus-visible` classes are on the clear button.
