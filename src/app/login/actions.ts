"use server"

import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function signUpAction(email: string, password: string) {
  // Use the admin client (service role) to check staff_directory,
  // since the user isn't authenticated yet and RLS would block anon reads.
  const admin = createSupabaseAdmin()

  const { data: staffRow, error: lookupError } = await admin
    .from("staff_directory")
    .select("email, role")
    .eq("email", email)
    .single()

  if (lookupError || !staffRow) {
    return {
      error: "Invalidated email. Please contact the directors to grant you access.",
    }
  }

  // Email is whitelisted — proceed with sign-up
  const supabase = await createSupabaseServer()

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  redirect("/")
}

export async function loginAction(email: string, password: string) {
  const supabase = await createSupabaseServer()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/")
}
