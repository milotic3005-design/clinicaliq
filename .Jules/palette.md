## 2024-05-21 - Added clear search input button
**Learning:** When implementing a clear button for an input field with an autocomplete/suggestion list, clearing the input state isn't enough. You must also explicitly clear the suggestion state and hide the suggestion dropdown to prevent stale UI, AND crucially, you must explicitly call `focus()` on the input reference to restore keyboard context for accessibility.
**Action:** Always include focus restoration logic (`ref.current?.focus()`) when building UI elements that clear or remove user input, ensuring keyboard users don't lose their place.
