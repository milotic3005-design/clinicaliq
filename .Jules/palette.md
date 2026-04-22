## 2026-04-22 - Add aria-label to icon-only buttons
**Learning:** Found multiple instances where icon-only buttons and links were using `title` tags for hover hints but lacked `aria-label` attributes, meaning screen readers would read them as empty links/buttons.
**Action:** Always ensure that any interactive element (like `<button>` or `<a>`) containing only an icon has an explicit `aria-label` for screen reader users.
