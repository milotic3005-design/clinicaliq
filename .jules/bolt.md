## 2024-07-08 - Caching Autocomplete APIs and Implementing LRU Eviction
**Learning:** High-frequency API endpoints like autocomplete search can cause redundant concurrent external API requests that bottleneck backend performance. Additionally, utilizing an unbounded `Map` for an in-memory cache without an eviction policy causes memory leaks as the app scales.
**Action:** When implementing autocomplete APIs, integrate a shared cache instance (e.g., `MemoryCache`) early with a bounded LRU eviction policy using `Map` insertion order (delete and re-set) to constrain maximum entries.
