## 2026-06-26 - Autocomplete Caching with Bounded LRU
**Learning:** High-frequency autocomplete endpoints can overwhelm external APIs if not cached. However, in-memory caches in Next.js backend routes must have bounded size limits (e.g. max 500 entries) and LRU eviction (using Map insertion order manipulation) to prevent memory leaks and out-of-memory errors on long-running processes.
**Action:** Implement bounded LRU caching for frequent API endpoints to reduce latency while protecting server memory.
