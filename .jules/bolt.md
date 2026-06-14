## 2024-06-14 - Prevent OOM with LRU Cache
**Learning:** When implementing in-memory caching for Next.js API routes handling user-generated input (like autocomplete), it is critical to enforce a maximum size limit using an LRU map pattern. Without this, unbounded memory growth will cause Out-of-Memory (OOM) leaks.
**Action:** Always enforce a maximum size limit with a mechanism like `if (cache.size > MAX) cache.delete(oldest)` when handling dynamically generated keys.
