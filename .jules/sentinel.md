## 2026-01-19 - Hardcoded Supabase Credentials
**Vulnerability:** Hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Hardcoding secrets, even "safe" ones like anon keys, complicates environment management and violates the "Store config in the environment" factor of 12-Factor App. It also risks exposing keys if they are committed to public repositories.
**Prevention:** Use `import.meta.env` for all configuration variables. Implement runtime checks to fail fast if required environment variables are missing.
