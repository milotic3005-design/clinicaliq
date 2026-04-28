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

  set<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
    this.store.set(key, {
      value,
      created_at: Date.now(),
      ttl_ms: ttlMs,
    });
  }

  get<T>(key: string): { value: T; age_ms: number } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.created_at;
    if (age > entry.ttl_ms) {
      this.store.delete(key);
      return null;
    }

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

export function getCacheKey(query: string): string {
  // Avoid expensive SHA-256 hashing for simple string mapping
  return query.toLowerCase().trim();
}
