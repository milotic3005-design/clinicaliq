## 2024-07-03 - LRU Cache Memory Leaks
**Learning:** Implementing an in-memory cache without an LRU eviction policy or size limit in Next.js API routes handling user input can lead to unbounded memory growth and OOM crashes.
**Action:** Always use a Map with insertion order eviction (`map.keys().next().value`) and explicit recency updates via delete/re-insert to maintain an efficient LRU size-bounded cache.
