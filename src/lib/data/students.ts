import { supabase } from "@/lib/supabase"
import { mapPostgresError } from "@/lib/errors"

export type Student = {
  id: string
  student_code?: string | null
  name: string
  age: number | null
  mother_phone_number: string | null
  internet_access: boolean | null
  phone_access: boolean | null
  photo_url: string | null
  english_class_id: string | null
  project_class_id: string | null
  english_class?: { id: string; name: string } | null
  project_class?: { id: string; name: string } | null
  created_at?: string
}

export async function getStudentsByClass(classId: string, track: "English" | "Project"): Promise<Student[]> {
  const column = track === "English" ? "english_class_id" : "project_class_id"
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, name, age, mother_phone_number, internet_access, phone_access, photo_url, english_class_id, project_class_id"
    )
    .eq(column, classId)
    .order("name")

  if (error || !data) return []
  return data as Student[]
}

export async function getAllStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select(`
      id, name, age, mother_phone_number, internet_access, phone_access, photo_url,
      english_class_id, project_class_id,
      english_class:classes!english_class_id(id, name),
      project_class:classes!project_class_id(id, name)
    `)
    .order("name")

  if (error || !data) return []
  return data as unknown as Student[]
}

export async function getStudent(studentId: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select(`
      id, name, age, mother_phone_number, internet_access, phone_access, photo_url,
      english_class_id, project_class_id,
      english_class:classes!english_class_id(id, name),
      project_class:classes!project_class_id(id, name)
    `)
    .eq("id", studentId)
    .single()

  if (error || !data) return null
  return data as unknown as Student
}

export async function addStudent(params: {
  name: string
  age?: number | null
  mother_phone_number?: string | null
  english_class_id?: string | null
  project_class_id?: string | null
  internet_access?: boolean
  phone_access?: boolean
}) {
  const payload: any = {
    name: params.name.trim(),
    age: params.age ?? null,
    mother_phone_number: params.mother_phone_number?.trim() || null,
    english_class_id: params.english_class_id || null,
    project_class_id: params.project_class_id || null,
  }
  if (params.internet_access !== undefined) payload.internet_access = params.internet_access
  if (params.phone_access !== undefined) payload.phone_access = params.phone_access

  const { data, error } = await supabase.from("students").insert(payload).select().single()
  if (error) {
    return { ok: false as const, message: mapPostgresError(error) }
  }
  return { ok: true as const, data: data as Student }
}

export async function updateStudent(
  studentId: string,
  updates: Partial<Student>
) {
  const { data, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", studentId)
    .select("id")

  if (error) {
    return { ok: false as const, message: mapPostgresError(error) }
  }
  // Section 8.1 rule 6: Treat empty affected rows as permission failure
  if (!data || data.length === 0) {
    return { ok: false as const, message: "You don't have permission to update this student." }
  }
  return { ok: true as const, data }
}

export async function removeStudent(studentId: string) {
  const { data, error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId)
    .select("id")

  if (error) {
    return { ok: false as const, message: mapPostgresError(error) }
  }
  // Section 8.1 rule 6: Treat empty affected rows as permission failure
  if (!data || data.length === 0) {
    return { ok: false as const, message: "You don't have permission to remove this student." }
  }
  return { ok: true as const }
}
