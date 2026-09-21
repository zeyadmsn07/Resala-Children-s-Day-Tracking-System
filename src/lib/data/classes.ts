import { supabase } from "@/lib/supabase"

export type ClassOverview = {
  id: string
  name: string
  track: "English" | "Project"
  student_count: number
}

export async function getClassOverview(): Promise<ClassOverview[]> {
  // First try class_overview view (if migration was run)
  const { data: viewData, error: viewError } = await supabase
    .from("class_overview")
    .select("id, name, track, student_count")
    .order("name")

  if (!viewError && viewData) {
    return (viewData as ClassOverview[]).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    )
  }

  // Fallback: Query classes directly and compute student_count
  const [classesRes, studentsRes] = await Promise.all([
    supabase.from("classes").select("id, name, track"),
    supabase.from("students").select("english_class_id, project_class_id"),
  ])

  if (classesRes.error || !classesRes.data) {
    return []
  }

  const students = studentsRes.data ?? []

  const counts: Record<string, number> = {}
  for (const s of students) {
    if (s.english_class_id) {
      counts[s.english_class_id] = (counts[s.english_class_id] || 0) + 1
    }
    if (s.project_class_id) {
      counts[s.project_class_id] = (counts[s.project_class_id] || 0) + 1
    }
  }

  const result: ClassOverview[] = classesRes.data.map((c: any) => ({
    id: c.id,
    name: c.name,
    track: c.track as "English" | "Project",
    student_count: counts[c.id] || 0,
  }))

  return result.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })
  )
}

export async function getClass(classId: string) {
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, track")
    .eq("id", classId)
    .single()

  if (error || !data) return null
  return data as { id: string; name: string; track: "English" | "Project" }
}
