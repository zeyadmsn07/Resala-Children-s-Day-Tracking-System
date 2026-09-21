"use server"

import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function signUpAction(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail || !password) {
    return { error: "Please provide both email and password." }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." }
  }

  // Use the admin client to verify staff_directory
  const admin = createSupabaseAdmin()

  const { data: staffRow, error: lookupError } = await admin
    .from("staff_directory")
    .select("email, role")
    .eq("email", normalizedEmail)
    .maybeSingle()

  if (lookupError || !staffRow) {
    // Exact spec error message from Section 4.1 & 11
    return {
      error: "Invalidated email. Please contact the directors to grant you access.",
    }
  }

  // Email is whitelisted. Create user.
  const { error: createError } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
  })

  if (createError) {
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
          error: "Email or password is incorrect.",
        }
      }

      redirect("/")
    }

    return { error: createError.message }
  }

  // Sign in immediately to establish session cookies
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
    // Section 4.1: Do not reveal whether email or password was wrong
    return { error: "Email or password is incorrect." }
  }

  redirect("/")
}
