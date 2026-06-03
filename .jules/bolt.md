## 2024-05-24 - In-Memory LRU Caching for Autocomplete
**Learning:** Using an unbounded Map for in-memory caching causes memory leaks. Map preserves insertion order, allowing efficient OOM-safe LRU eviction via map.keys().next().value.
**Action:** Always enforce a maxSize and implement LRU eviction for custom in-memory caches, especially for high-frequency autocomplete routes.
