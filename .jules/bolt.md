
## 2024-07-04 - LRU Cache Eviction and Autocomplete API Caching
**Learning:** The application's `MemoryCache` lacked a maximum size limit and LRU eviction policy, risking Out-of-Memory (OOM) issues with unbounded growth. Simultaneously, the `/api/v1/suggest` route was not caching autocomplete queries, resulting in redundant high-frequency calls to multiple external APIs. By properly implementing LRU (via `Map` insertion order preservation and explicit `delete`/`set` for recency) and integrating it into the suggest API, we prevent memory leaks while dramatically reducing external API load.
**Action:** Implemented LRU eviction with a `maxSize` of 500 in `MemoryCache`. Added cache checks and updates to `/api/v1/suggest` to memoize the autocomplete responses.
