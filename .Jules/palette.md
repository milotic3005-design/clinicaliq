## 2026-06-07 - Add Clear Button to Search Bar
**Learning:** When implementing elements that clear or remove user input (like a search clear button), we must explicitly clear any associated autocomplete/suggestion states to prevent stale UI, include focus restoration logic to the input, and ensure the button has an aria-label and type="button".
**Action:** Always verify focus state, stale suggestion states, and ARIA labels when introducing input clearance controls.
