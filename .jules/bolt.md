## 2026-06-22 - LRU Caching for Autocomplete
**Learning:** High-frequency API endpoints like suggest routes cause redundant external calls. Basic Map caches risk unbounded memory growth (OOM leaks) if not size-limited.
**Action:** Implemented LRU eviction using Map insertion order and applied it to the suggest route.
