import { createSupabaseServer } from "@/lib/supabase-server"
import { Student } from "@/lib/data/students"

export async function getStudentServer(studentId: string): Promise<Student | null> {
  const supabase = await createSupabaseServer()
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