import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/**
 * Creates a Supabase client bound to the current user's session cookies.
 * Use in Server Actions and Server Components.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll can throw in Server Components (read-only context).
            // Safe to ignore — the middleware handles the refresh.
          }
        },
      },
    }
  )
}

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
