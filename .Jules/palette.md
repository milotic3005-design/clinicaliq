## 2025-05-10 - Screen Reader Accessibility for Modals
**Learning:** Icon-only close buttons in modals (`X` from lucide-react) must have explicit `aria-label`s for screen reader support. Found this missing in the CADD calculator and Drug Detail Modals.
**Action:** Always add descriptive `aria-label` to icon-only buttons (`<button><X /></button>`).
