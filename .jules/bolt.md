## 2026-06-30 - Unbounded memory growth in high-frequency Next.js routes
**Learning:** In-memory caching with simple Maps in Node.js backend routes can lead to OOM crashes on high-frequency endpoints like autocomplete. Map insertion order allows for an efficient LRU implementation without external dependencies.
**Action:** Always wrap Maps used for caching with a maximum size limit or an LRU eviction policy by deleting and re-inserting keys on access.
