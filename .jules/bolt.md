## 2024-05-19 - Unbounded In-Memory Cache Anti-Pattern
**Learning:** Using an unbounded `Map` for in-memory caching in Next.js API routes that handle user-generated input (like autocomplete queries) can lead to unbounded memory growth and Out-of-Memory (OOM) leaks.
**Action:** Always enforce a maximum size limit (`if (cache.size > MAX) cache.clear()`) or use an LRU pattern by leveraging `Map` insertion order (evicting the oldest item using `map.keys().next().value` and updating recency by deleting and re-inserting) to prevent unbounded memory growth.
