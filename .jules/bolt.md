## 2026-05-25 - Prevent OOM via In-Memory Map LRU Caching
**Learning:** Using unbounded Map objects for caching user-generated data in Node.js serverless or edge environments can lead to slow memory leaks and Out-of-Memory (OOM) errors over time, especially for high-cardinality data like autocomplete queries.
**Action:** Always enforce a `maxSize` limit and implement LRU (Least Recently Used) eviction (`map.keys().next().value`) to keep memory footprint bounded. Delete and re-insert keys upon access to preserve recency in JavaScript Maps.
