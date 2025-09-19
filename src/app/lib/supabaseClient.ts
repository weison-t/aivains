// src/app/lib/supabaseClient.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (client) return client;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration missing at runtime.");
  }
  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
};