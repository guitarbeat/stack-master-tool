// Supabase client configuration with environment variable support
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Environment variables with fallbacks for production
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://jectngcrpikxwnjdwana.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplY3RuZ2NycGlreHduamR3YW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNTI3NTYsImV4cCI6MjA3MzgyODc1Nn0.MsBmQukMgikZxHCqJIjtXxB62Bf9CbEaaOumFEMYYuo";

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
