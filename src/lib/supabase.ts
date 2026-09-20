import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser-side Supabase client using @supabase/ssr.
 * Automatically reads and writes session cookies so requests
 * carry the authenticated user's credentials to satisfy Row-Level Security (RLS).
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)