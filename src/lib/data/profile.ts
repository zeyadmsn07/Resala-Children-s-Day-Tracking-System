import { supabase } from "@/lib/supabase"
import { mapPostgresError } from "@/lib/errors"

export type ProfileData = {
  id: string
  email: string
  role: "director" | "head" | "member"
  full_name?: string | null
  bio?: string | null
  created_at?: string
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error || !data) return null
  return data as ProfileData
}

export async function updateProfile(
  userId: string,
  updates: { full_name?: string; bio?: string }
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("id")

  if (error) {
    return { ok: false as const, message: mapPostgresError(error) }
  }
  return { ok: true as const }
}
