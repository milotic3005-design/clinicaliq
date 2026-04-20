## 2024-05-24 - Frontend Autocomplete API Caching
**Learning:** For features like auto-suggest search that query multiple backends on keystroke, the backend may cache results (e.g. Next.js data cache), but the frontend still suffers redundant requests when the user backspaces or edits their text.
**Action:** Implement a local `useRef` cache in the React component for `debouncedQuery` results. By intercepting these redundant search variations locally, we avoid fetching entirely, drastically reducing perceived latency and cutting down unnecessary HTTP requests in the browser.
