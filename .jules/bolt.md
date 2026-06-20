## 2024-05-24 - LRU Cache for Autocomplete API
**Learning:** High-frequency APIs like autocomplete can cause memory exhaustion if cached without eviction limits. In Next.js API routes, a JavaScript `Map` preserves insertion order. To implement LRU, we must explicitly `delete` and re-`set` keys on access, and evict the oldest using `map.keys().next().value`.
**Action:** Always enforce a max size on in-memory caches and use LRU patterns to prevent memory leaks in API routes.
