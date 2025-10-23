// Supabase client configuration with environment variable support
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Environment variables must be provided via the environment (e.g. .env)
const sanitizeSupabaseUrl = (url: string): string => {
  const withProtocol = /^https?:\/\//i.test(url)
    ? url
    : `https://${url}`;

  return withProtocol.replace(/\/+$/, "");
};

const requireEnv = (value: string | undefined, name: string): string => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return trimmedValue;
};

const SUPABASE_URL = sanitizeSupabaseUrl(
  requireEnv(import.meta.env.VITE_SUPABASE_URL, "VITE_SUPABASE_URL")
);
const SUPABASE_PUBLISHABLE_KEY = requireEnv(
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  "VITE_SUPABASE_ANON_KEY"
);

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
