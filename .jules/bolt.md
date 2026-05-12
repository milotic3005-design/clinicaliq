## 2024-05-12 - Prevent Cache OOM with LRU Pattern
**Learning:** Next.js API routes handling user input with an unbounded in-memory cache (like a simple Map) can lead to memory leaks and Out-of-Memory (OOM) errors. Map maintains insertion order, which can be leveraged for an LRU cache without extra libraries.
**Action:** When implementing an in-memory cache, always use a max size limit and implement an LRU eviction strategy by taking advantage of `Map`'s ordered keys property to evict the oldest entry when capacity is reached.
