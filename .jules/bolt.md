## 2024-05-05 - Avoid async crypto API for simple caching
**Learning:** Using `crypto.subtle.digest` to hash cache keys is extremely slow compared to synchronous operations for small strings, making the perceived performance of caching slightly degraded due to async overhead for operations that could just be synchronous (like taking a string key).
**Action:** Replace `crypto.subtle.digest` with simple string keys or fast synchronous hashing functions for lightweight in-memory caches.
