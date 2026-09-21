import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser-side Supabase client using @supabase/ssr.
 * Reads and writes session cookies so requests carry authenticated credentials for RLS.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
