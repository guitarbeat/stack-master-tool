## 2026-01-19 - Hardcoded Supabase Credentials
**Vulnerability:** Hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Hardcoding secrets, even "safe" ones like anon keys, complicates environment management and violates the "Store config in the environment" factor of 12-Factor App. It also risks exposing keys if they are committed to public repositories.
**Prevention:** Use `import.meta.env` for all configuration variables. Implement runtime checks to fail fast if required environment variables are missing.

## 2026-05-24 - Weak Random Number Generation in Meeting Codes
**Vulnerability:** Use of `Math.random()` for generating meeting codes in both Supabase and P2P services.
**Learning:** `Math.random()` is not cryptographically secure and can be predictable. Meeting codes act as access tokens, so predictability allows potential unauthorized access (zoombombing). Even for short, temporary codes, using `crypto.getRandomValues()` is a low-cost, high-value security practice.
**Prevention:** Always use `crypto.getRandomValues()` (or a wrapper like `generateSecureRandomString`) for any value that grants access or requires unpredictability, not just "secrets".
