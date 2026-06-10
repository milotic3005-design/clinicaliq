## 2026-06-10 - LRU Cache with JavaScript Map
**Learning:** JavaScript's Map object preserves insertion order. When implementing an LRU cache, evict the oldest item using `map.keys().next().value`. Crucially, `Map.prototype.set` does not update the insertion order of an already-existing key. To refresh an item's recency during a `set` or `get`, you must explicitly `delete` the key first before re-inserting it.
**Action:** Always delete before setting when updating recency in a Map-based LRU cache.
