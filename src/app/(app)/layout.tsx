import { createSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { StaffProvider, StaffUser } from "@/lib/hooks/use-staff"
import { AppShell } from "@/components/shell/app-shell"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch caller's profile once on the server (Section 3.3)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, full_name")
    .eq("id", user.id)
    .maybeSingle()

  const role = (profile?.role || "member") as "director" | "head" | "member"
  const fullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Staff Member"

  const staffUser: StaffUser = {
    id: user.id,
    email: user.email || "",
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
