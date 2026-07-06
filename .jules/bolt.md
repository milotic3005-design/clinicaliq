## 2024-05-23 - Prevent Unbounded Memory Growth in Cache
**Learning:** Unbounded in-memory caching in Next.js API routes (like for autocomplete queries) can cause Memory Leaks/OOM errors because standard Maps grow indefinitely unless capped.
**Action:** Always implement a maximum size limit with an eviction policy (like LRU via Map insertion order) when building custom in-memory caches.
