# SecSky

Zero-knowledge, client-side encrypted file storage application.

## Strict Security Model
- **Zero Knowledge**: Plantext files are NEVER sent to the backend. Encryption happens entirely in the browser using the Web Crypto API (AES-256-GCM).
- **Master Keys**: The user's master key is derived via PBKDF2 (100k iterations) on login/registration and stored ONLY in memory. It is never transmitted.
- **Double Wrapping**: Optional file-specific passwords wrap the AES key an additional time for a second layer of defense.
- **Metadata**: Backend (FastAPI + MongoDB) only stores encrypted metadata, IVs, and securely wrapped keys.
- **Storage**: Encrypted blob bytes are piped securely to local disk storage using UUIDs.
