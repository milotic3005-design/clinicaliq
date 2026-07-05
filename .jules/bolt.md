## 2024-07-05 - Implementing LRU Cache for Autocomplete
**Learning:** In Next.js API routes, unbounded in-memory caching for user-generated input can cause OOM leaks. JS Maps preserve insertion order, making them perfect for simple LRU caches by evicting `map.keys().next().value`, but it requires explicitly deleting and re-setting existing keys to update their recency.
**Action:** Always enforce a `maxSize` limit and use an LRU pattern for in-memory caches, explicitly managing recency for existing items.
