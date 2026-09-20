"use server"

import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function signUpAction(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail || !password) {
    return { error: "Please provide both email and password." }
  }

  // Use the admin client (service role) to check staff_directory,
  // since the user isn't authenticated yet and RLS would block anon reads.
  const admin = createSupabaseAdmin()

  const { data: staffRow, error: lookupError } = await admin
    .from("staff_directory")
    .select("email, role")
    .ilike("email", normalizedEmail)
    .single()

  if (lookupError || !staffRow) {
    return {
      error: "Invalidated email. Please contact the directors to grant you access.",
    }
  }

  // Email is whitelisted! Create the user with email_confirm: true so they aren't
  // blocked by Supabase's email verification requirement.
  const { error: createError } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
  })

  if (createError) {
    // If already registered, attempt to sign in directly
    if (
      createError.message.toLowerCase().includes("already registered") ||
      createError.message.toLowerCase().includes("already exists")
    ) {
      const supabase = await createSupabaseServer()
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (loginError) {
        return {
          error:
            "An account with this email already exists. Please use the Login tab or check your password.",
        }
      }

      redirect("/")
    }

    return { error: createError.message }
  }

  // Sign in immediately to generate session cookies in the browser
  const supabase = await createSupabaseServer()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  })

  if (signInError) {
    return { error: signInError.message }
  }

  redirect("/")
}

export async function loginAction(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail || !password) {
    return { error: "Please provide both email and password." }
  }

  const supabase = await createSupabaseServer()

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/")
}
