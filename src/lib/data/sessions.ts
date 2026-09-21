import { supabase } from "@/lib/supabase"
import { SlotInfo } from "@/components/tracking/session-accordion"

export type { SlotInfo }

export type ModuleInfo = {
  id: string
  module_number: number
  name: string
}

export const FALLBACK_SLOTS: SlotInfo[] = [
  { sessionNumber: 1, track: "English", title: "English Class" },
  { sessionNumber: 2, track: "Project", title: "Skills Class" },
  { sessionNumber: 3, track: "Project", title: "Skills Class" },
  { sessionNumber: 4, track: "Project", title: "Fun Day" },
]

export async function getModules(): Promise<ModuleInfo[]> {
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

export async function getSessionSlots(): Promise<SlotInfo[]> {
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

export async function getStudentModuleData(studentId: string, moduleId: string) {
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

export async function upsertSession(payload: {
  student_id: string
  module_id: string
  day_number: number
  session_number: number
  attendance_status?: string | null
  attentiveness_percentage?: number | null
  behavior_points?: number
  daily_assignment_score?: number | null
}) {
  const { data: existing } = await supabase
    .from("sessions")
    .select("id")
    .eq("student_id", payload.student_id)
    .eq("module_id", payload.module_id)
    .eq("day_number", payload.day_number)
    .eq("session_number", payload.session_number)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from("sessions")
      .update(payload)
      .eq("id", existing.id)
    if (error) throw error
    return { ok: true }
  } else {
    const { error } = await supabase.from("sessions").insert(payload)
    if (error) throw error
    return { ok: true }
  }
}

export async function updateOverallModuleGrade(
  studentId: string,
  moduleId: string,
  grade: number | null
) {
  const { data: existing } = await supabase
    .from("student_modules")
    .select("id")
    .eq("student_id", studentId)
    .eq("module_id", moduleId)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from("student_modules")
      .update({ overall_project_grade: grade })
      .eq("id", existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("student_modules").insert({
      student_id: studentId,
      module_id: moduleId,
      overall_project_grade: grade,
    })
    if (error) throw error
  }
}
