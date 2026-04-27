## 2025-02-28 - Next.js Route Cache Key Generation
**Learning:** Using `crypto.subtle.digest` via the WebCrypto API in a standard Node.js Next.js route is significantly slower than using the native `crypto.createHash` module (approx 1.2ms vs 0.04ms). Furthermore, native `crypto` is synchronous, removing an unnecessary `await` and reducing promise overhead.
**Action:** When working in standard Node.js runtimes (not edge), prefer the native `crypto` module for high-frequency hashing like cache keys instead of WebCrypto.
