## 2024-05-06 - In-Memory Cache Optimization
**Learning:** Hashing strings with `crypto.subtle.digest` asynchronously just to generate an in-memory `Map` key adds massive overhead (~1.7ms vs near-instant). JavaScript Maps handle strings natively and efficiently. Using node `crypto` solves the speed issue but limits the code to Node environments.
**Action:** For simple memory caches, use normalized string keys instead of cryptographic hashes unless security/collisions dictate otherwise.
