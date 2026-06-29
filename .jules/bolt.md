## 2026-06-29 - LRU Memory Cache for Autocomplete
**Learning:** High-frequency API routes (like autocomplete) can cause unbounded memory growth (OOM leaks) if in-memory caches lack eviction policies. A Map's insertion order preservation enables a lightweight O(1) LRU cache, but requires explicitly deleting and re-inserting keys to refresh recency.
**Action:** Always enforce a maxSize limit and implement LRU eviction (by explicitly deleting/re-inserting keys) when using custom in-memory caches to prevent memory leaks.
