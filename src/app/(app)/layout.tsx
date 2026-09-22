import { createSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { StaffProvider, StaffUser } from "@/lib/hooks/use-staff"
import { AppShell } from "@/components/shell/app-shell"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServer()

  // src/middleware.ts already calls supabase.auth.getUser() on every request
  // and forwards the verified id via the x-user-id header, so we read that
  // instead of paying for a second getUser() round-trip here. If the header
  // is missing for any reason (e.g. middleware didn't run on this path),
  // fall back to calling getUser() directly so auth is never skipped.
  const headerList = await headers()
  const forwardedUserId = headerList.get("x-user-id")

  let userId: string | null = forwardedUserId
  let userEmail: string | null = null
  let userMetadataFullName: string | undefined

  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    userId = user.id
    userEmail = user.email ?? null
    userMetadataFullName = user.user_metadata?.full_name
  }

  if (!userId) {
    redirect("/login")
  }

  // Fetch caller's profile once on the server (Section 3.3).
  // This is the only Supabase round-trip this layout needs to make now.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, full_name")
    .eq("id", userId)
    .maybeSingle()

  const role = (profile?.role || "member") as "director" | "head" | "member"
  const fullName =
    profile?.full_name ||
    userMetadataFullName ||
    (profile?.email || userEmail)?.split("@")[0] ||
    "Staff Member"

  const staffUser: StaffUser = {
    id: userId,
    email: profile?.email || userEmail || "",
    fullName,
    role,
    canManageTeam: role === "director" || role === "head",
  }

  return (
    <StaffProvider value={staffUser}>
      <AppShell>{children}</AppShell>
    </StaffProvider>
  )
}