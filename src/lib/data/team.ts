import { supabase } from "@/lib/supabase"
import { mapPostgresError } from "@/lib/errors"

export type StaffMember = {
  email: string
  role: "director" | "head" | "member"
  added_by?: string | null
  added_by_name?: string | null
  signed_up?: boolean
  created_at?: string
}

export async function getTeamOverview(): Promise<StaffMember[]> {
  // First attempt reading team_overview view
  const { data: viewData, error: viewError } = await supabase
    .from("team_overview")
    .select("*")

  if (!viewError && viewData) {
    return viewData as StaffMember[]
  }

  // Fallback: Query staff_directory and profiles
  const [staffRes, profilesRes] = await Promise.all([
    supabase.from("staff_directory").select("*"),
    supabase.from("profiles").select("id, email, role"),
  ])

  if (staffRes.error || !staffRes.data) return []

  const registeredEmails = new Set(
    (profilesRes.data ?? []).map((p: any) => p.email?.toLowerCase())
  )

  return staffRes.data.map((s: any) => ({
    email: s.email,
    role: s.role,
    added_by: s.added_by,
    signed_up: registeredEmails.has(s.email?.toLowerCase()),
  }))
}

export async function addToWhitelist(email: string, role: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const { error } = await supabase
    .from("staff_directory")
    .insert({ email: normalizedEmail, role })

  if (error) {
    return { ok: false as const, message: mapPostgresError(error) }
  }
  return { ok: true as const }
}
