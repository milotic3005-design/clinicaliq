## 2026-06-27 - Bounded LRU Cache for Auto-Suggest
**Learning:** In JavaScript, Map preserves insertion order, but `Map.prototype.set` does not update the insertion order of an existing key. To correctly implement LRU, the key must be explicitly deleted before re-insertion. Unbounded caches on high-frequency routes (like suggest) risk OOM leaks.
**Action:** Always enforce a maximum size limit and use the correct LRU pattern (delete then set) when building in-memory caches for user-generated input.
