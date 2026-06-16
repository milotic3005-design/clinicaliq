// In-memory TTL cache for ClinicalIQ

interface CacheEntry<T> {
  value: T;
  created_at: number;
  ttl_ms: number;
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SAFETY_TTL_MS = 6 * 60 * 60 * 1000;   // 6 hours for FAERS/enforcement

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    }

    this.store.set(key, {
      value,
      created_at: Date.now(),
      ttl_ms: ttlMs,
    });

    if (this.store.size > this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }
  }

  get<T>(key: string): { value: T; age_ms: number } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.created_at;
    if (age > entry.ttl_ms) {
      this.store.delete(key);
      return null;
    }

    // Refresh recency in LRU
    this.store.delete(key);
    this.store.set(key, entry);

    return { value: entry.value as T, age_ms: age };
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Singleton instance
export const cache = new MemoryCache();
export { DEFAULT_TTL_MS, SAFETY_TTL_MS };

export async function hashCacheKey(query: string): Promise<string> {
  const normalized = query.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
