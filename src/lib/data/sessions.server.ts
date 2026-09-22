import { createSupabaseServer } from "@/lib/supabase-server"
import { SlotInfo } from "@/components/tracking/session-accordion"
import { FALLBACK_SLOTS, ModuleInfo } from "@/lib/data/sessions"

export async function getModulesServer(): Promise<ModuleInfo[]> {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from("modules")
    .select("id, module_number, name")
    .order("module_number")

  if (error || !data || data.length === 0) {
    return [
      { id: "1", module_number: 1, name: "Module 1" },
      { id: "2", module_number: 2, name: "Module 2" },
      { id: "3", module_number: 3, name: "Module 3" },
      { id: "4", module_number: 4, name: "Module 4" },
    ]
  }
  return data as ModuleInfo[]
}

export async function getSessionSlotsServer(): Promise<SlotInfo[]> {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from("session_slots")
    .select("session_number, track, title")
    .order("session_number")

  if (error || !data || data.length === 0) {
    return FALLBACK_SLOTS
  }
  return data.map((d: any) => ({
    sessionNumber: d.session_number,
    track: d.track as "English" | "Project",
    title: d.title || (d.track === "English" ? "English Class" : "Skills Class"),
  }))
}

export async function getStudentModuleDataServer(studentId: string, moduleId: string) {
  const supabase = await createSupabaseServer()
  const [sessionsRes, gradeRes] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("student_id", studentId)
      .eq("module_id", moduleId),
    supabase
      .from("student_modules")
      .select("overall_project_grade")
      .eq("student_id", studentId)
      .eq("module_id", moduleId)
      .maybeSingle(),
  ])

  return {
    sessions: sessionsRes.data ?? [],
    overallProjectGrade: gradeRes.data?.overall_project_grade ?? null,
  }
}