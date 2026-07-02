## 2026-07-02 - Prevent OOM with LRU Cache
**Learning:** Unbounded in-memory caching using `Map` can cause Out-of-Memory (OOM) errors. JavaScript's `Map` preserves insertion order, allowing for an efficient LRU implementation.
**Action:** Always enforce a maximum size limit and refresh access order by explicitly deleting and re-inserting keys on read and write.
