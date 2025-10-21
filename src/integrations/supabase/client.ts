// Supabase client configuration with environment variable support
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Environment variables must be provided via the environment (e.g. .env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
  throw new Error("Missing required environment variable: VITE_SUPABASE_URL");
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing required environment variable: VITE_SUPABASE_ANON_KEY"
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      // Detect if we're in a mobile/capacitor environment
      detectSessionInUrl:
        typeof window !== "undefined" && !('Capacitor' in window),
    },
  }
);
