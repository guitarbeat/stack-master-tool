// Supabase client configuration
import {
  createSupabaseConnectionManager,
  type ConnectionState,
  type ExecuteOptions as SupabaseRequestOptions,
  isSupabaseConnectionError,
  SupabaseOfflineError,
  SupabaseTimeoutError,
} from "./connection-manager";

const SUPABASE_URL = "https://jectngcrpikxwnjdwana.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplY3RuZ2NycGlreHduamR3YW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNTI3NTYsImV4cCI6MjA3MzgyODc1Nn0.MsBmQukMgikZxHCqJIjtXxB62Bf9CbEaaOumFEMYYuo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

const connectionManager = createSupabaseConnectionManager({
  url: SUPABASE_URL,
  key: SUPABASE_PUBLISHABLE_KEY,
  options: {
    auth: {
      storage: typeof window === "undefined" ? undefined : localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl:
        typeof window !== "undefined" && !("Capacitor" in window),
    },
  },
});

export const supabase = connectionManager.getClient();

export const executeSupabase = async <T>(
  operation: (client: typeof supabase) => Promise<T>,
  options?: SupabaseRequestOptions,
): Promise<T> => connectionManager.execute(operation, options);

export const getSupabaseConnectionState = (): ConnectionState =>
  connectionManager.getState();

export const onSupabaseConnectionStateChange = (
  listener: (state: ConnectionState) => void,
): (() => void) => connectionManager.onStateChange(listener);

export const retrySupabaseConnection = (): Promise<boolean> =>
  connectionManager.retryConnection();

export const getSupabaseConnectionError = (): Error | undefined =>
  connectionManager.getLastError();

export type { ConnectionState, SupabaseRequestOptions };
export { isSupabaseConnectionError, SupabaseOfflineError, SupabaseTimeoutError };
