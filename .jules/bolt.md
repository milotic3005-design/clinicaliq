## 2024-06-15 - Unbounded Cache in Suggest API
**Learning:** High-frequency APIs like autocomplete can quickly cause OOM issues if the in-memory cache is unbounded. Using a Map to implement an LRU (Least Recently Used) policy requires manually deleting and re-inserting keys on access/update to preserve recency, while evicting the oldest key via map.keys().next().value.
**Action:** Always enforce a maximum size limit (e.g., maxSize: 500) and implement an eviction policy for custom memory caches dealing with unbounded user input.
