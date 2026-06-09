## 2024-05-24 - Implement LRU Cache to Prevent OOM
**Learning:** JavaScript's Map preserves insertion order, but Map.prototype.set doesn't update order for existing keys. A max-size LRU cache is critical for Next.js API routes handling user input to prevent memory leaks.
**Action:** Always implement a max-size eviction policy and explicitly delete before re-inserting to refresh LRU recency.
