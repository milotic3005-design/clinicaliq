
## 2024-05-18 - Autocomplete Caching & LRU Eviction Logic
**Learning:** JS Map insertion order is not updated on Map.set if the key already exists. This means standard map logic fails for LRU caches. Additionally, unbounded in-memory caches in Next.js APIs handling user input (like autocomplete) can cause memory leaks. High frequency autocomplete API routes must have caching and bounding logic, otherwise parallel network requests heavily degrade performance.
**Action:** When creating an LRU cache using Map, always explicitly delete the key before calling set (both on reads and writes) to refresh insertion order. When adding caching to user-facing API routes, always use a max-size mechanism to prevent OOM errors.
