import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定されていません");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export const DEFAULT_TEACHER_ID = "00000000-0000-0000-0000-000000000001";
