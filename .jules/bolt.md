## 2024-10-18 - In-memory Caching in Next.js
**Learning:** In long-running node environments (like Next.js API routes), unbounded in-memory caches using `Map` can lead to Out-Of-Memory (OOM) crashes due to varied user inputs continuously expanding the cache.
**Action:** Always enforce a maximum size limit and ideally an LRU pattern (by deleting and re-inserting to update insertion order) when implementing custom in-memory caches.
