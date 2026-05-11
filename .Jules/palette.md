## 2024-05-11 - Add ARIA labels to icon-only buttons
**Learning:** Icon-only buttons without `aria-label` or `title` are inaccessible to screen readers, especially in interactive components like modals and lists.
**Action:** Always verify that every `<button>` or `<a>` containing only an icon component (e.g. `<X />`) includes an `aria-label` explaining its action.
