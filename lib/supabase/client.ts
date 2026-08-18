"use client";

import { createClient } from "@supabase/supabase-js";

let client:
  ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      throw new Error(
        "Supabase realtime environment variables are not configured.",
      );
    }

    client = createClient(url, key);
  }

  return client;
}
