## 2026-06-23 - LRU Cache Eviction and Autocomplete Memoization
**Learning:** Next.js API routes with unbounded in-memory caches (like Maps) will leak memory over time, leading to OOM. Additionally, high-frequency autocomplete endpoints without caching cause redundant parallel downstream API calls.
**Action:** Always implement a max size and LRU eviction policy (using Map insertion order manipulation via delete/set) for in-memory caches, and wrap high-throughput external fetches in cache layers.
