## 2024-10-27 - Unbounded MemoryCache Growth
**Learning:** The simple in-memory Map cache was storing items infinitely, creating an unbounded memory growth (OOM leak) risk since there was no limit enforced. Additionally, Map insertion order can be leveraged to implement a cheap LRU eviction policy.
**Action:** When using `Map` for caching, implement a maximum size check (`if (cache.size > MAX) cache.clear()` or LRU `map.delete(map.keys().next().value)`) to prevent Out-of-Memory issues.
