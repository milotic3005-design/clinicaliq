## 2024-05-19 - In-memory Map Cache Key Hashing
**Learning:** For an in-memory `Map` cache, using an async SHA-256 hash (via `crypto.subtle.digest`) for the cache key adds significant, unnecessary async overhead per request. Map objects natively support string keys of arbitrary length efficiently.
**Action:** Always prefer normalized plain strings over cryptographic hashes for local, in-memory cache keys to avoid breaking synchronous flows and wasting computation time.
