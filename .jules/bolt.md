## 2025-02-20 - Unbounded In-Memory Caches and LRU Eviction

**Learning:** This codebase uses an unbounded in-memory cache (`MemoryCache` in `src/lib/cache.ts`) using a JavaScript `Map` to store aggregated API results. In a Node.js or Next.js server environment handling dynamic user queries, an unbounded cache can lead to runaway memory growth and eventual Out-Of-Memory (OOM) errors, especially since the TTL mechanism only evicts on read, not proactively.

**Action:** When implementing in-memory caching for API responses, always enforce a maximum size limit using an LRU (Least Recently Used) eviction policy. JavaScript's `Map` object preserves insertion order, making it straightforward to implement an LRU cache by evicting the oldest item using `map.keys().next().value` and updating an item's recency by deleting and immediately re-inserting it upon access (`get`) or update (`set`).
