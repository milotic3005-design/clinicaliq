## 2026-05-04 - Accessible Remove Button in Drug Interaction Checker
**Learning:** Found an icon-only 'remove drug' button (`<button><X /></button>`) in the `DrugInteractionChecker` missing an `aria-label`. This made it completely opaque to screen readers.
**Action:** Always verify icon-only buttons (`lucide-react` icons inside `<button>`) have explicit `aria-label`s describing their action (e.g., "Remove drug").
