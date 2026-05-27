## 2024-05-18 - MemoryCache LRU Eviction

**Learning:** When using JavaScript Maps for an LRU cache, inserting an existing key does not automatically move it to the end of the insertion order. Map preserves the original insertion order. Unbounded in-memory Maps in Next.js APIs can cause Out-Of-Memory (OOM) errors.
**Action:** When updating Map values or refreshing access recency in an LRU implementation, always `delete` the key first, then `set` it again to correctly push it to the end of the insertion queue.
