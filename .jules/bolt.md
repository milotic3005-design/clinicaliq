## 2026-06-18 - LRU Cache Eviction for Autocomplete
**Learning:** Unbounded in-memory caching for user-generated inputs (like autocomplete) leads to Out-of-Memory leaks. Also, Maps require delete and re-insert to update insertion order for LRU.
**Action:** Always enforce a maximum size limit and use an LRU eviction policy when implementing Map-based caches in Next.js API routes.
