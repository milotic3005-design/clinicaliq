## 2024-05-18 - Memoize expensive text parsing in render cycles
**Learning:** Parsing dense text (like FDA labels) into bullet points using regex inside a React render cycle blocks the main thread, causing significant input lag when the component re-renders frequently (e.g., during search keystrokes).
**Action:** Always wrap expensive text-processing functions in `useMemo` when they depend on static data, preventing recalculation on every state change that triggers a re-render.
