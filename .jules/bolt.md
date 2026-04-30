## 2024-04-30 - Crypto.subtle hash is unnecessary for in-memory cache keys
**Learning:** The `hashCacheKey` function in `src/lib/cache.ts` uses an async SHA-256 hash to create keys. This is slow and unnecessary for an in-memory cache since string keys work just fine in JavaScript Maps and are orders of magnitude faster.
**Action:** Use a plain string formatter like `query.toLowerCase().trim()` for cache keys instead of heavy crypto hashing when dealing with simple, non-sensitive strings like queries.
