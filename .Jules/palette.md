## 2024-05-29 - Clear Button Focus Restoration

**Learning:** When implementing elements that clear or remove user input (like a search clear button), clearing the state alone is insufficient for a good keyboard user experience. Without focus restoration, focus is lost after the click.
**Action:** Always include focus restoration logic (`inputRef.current?.focus()`) when clearing inputs, and explicitly clear any associated autocomplete/suggestion states (`setSuggestions([])`, `setShowSuggestions(false)`) to prevent stale UI. Ensure the button itself has descriptive `aria-label` attributes and `focus-visible` styles.
