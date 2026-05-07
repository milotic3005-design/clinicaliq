## 2024-05-07 - In-Memory Map Keys using Cryptographic Hashing

**Learning:** Generating SHA-256 hashes for simple in-memory Map cache keys is a severe performance anti-pattern. While cryptographic hashing is useful for distributed caching systems (like Redis) or when dealing with highly sensitive data to prevent key collisions in massive datasets, using `crypto.subtle.digest` for an in-memory application cache introduces unnecessary asynchronous overhead and computational cost. Converting the input to lower case and trimming it is entirely sufficient and orders of magnitude faster.

**Action:** Whenever implementing or reviewing an in-memory caching solution, ensure that cache keys are generated using simple string normalization rather than expensive cryptographic hashing operations unless strictly necessary for security or external system constraints.
