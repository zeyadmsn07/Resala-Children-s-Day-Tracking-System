import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase admin client using the service-role key.
 * Bypasses RLS — use only for privileged server-side operations
 * like checking staff_directory during sign-up.
 */
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
