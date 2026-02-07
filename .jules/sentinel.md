## 2026-01-19 - Hardcoded Supabase Credentials
**Vulnerability:** Hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Hardcoding secrets, even "safe" ones like anon keys, complicates environment management and violates the "Store config in the environment" factor of 12-Factor App. It also risks exposing keys if they are committed to public repositories.
**Prevention:** Use `import.meta.env` for all configuration variables. Implement runtime checks to fail fast if required environment variables are missing.

## 2026-05-26 - Missing Input Validation in Service Layer
**Vulnerability:** `SupabaseMeetingService` methods accepted raw strings without validation, relying on potential frontend checks or database constraints.
**Learning:** Service layers must treat all inputs as untrusted. Relying on frontend validation is insufficient as API calls can bypass it. Database constraints (like length limits) catch issues too late and provide poor user feedback.
**Prevention:** Implement strict input validation using schemas (e.g., Zod) at the entry point of all service methods. This ensures data integrity and prevents invalid data from reaching the database or causing downstream errors.
