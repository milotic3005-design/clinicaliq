## 2024-05-24 - Cache high-frequency queries and enforce unbounded growth
**Learning:** High-frequency API endpoints like autocomplete/suggest can hammer external APIs and degrade performance. Unbounded in-memory caches, such as simple Maps, can lead to Out-Of-Memory (OOM) issues over time.
**Action:** Always cache responses for frequent queries and strictly enforce a bounded LRU eviction policy using `Map` insertion order manipulation (delete & re-insert) to limit memory growth.
