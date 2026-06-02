## 2026-06-02 - LRU Map Cache for High-Frequency API Requests
**Learning:** Map's insertion order can be used to implement an LRU cache efficiently. However, setting an existing key does not refresh its insertion order; you must first delete it. Using this pattern on high-frequency autocomplete APIs reduces external fetches and protects memory bounds (e.g., maxSize: 500) preventing OOM leaks.
**Action:** Always wrap memory caches handling user input with bounds (e.g., LRU size limit). Refresh Map keys explicitly by deleting and re-inserting them. Cache frequent parallel API queries.
