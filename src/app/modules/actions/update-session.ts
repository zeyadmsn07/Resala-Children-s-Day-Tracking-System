"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

type SessionUpdate = {
  moduleId: number
  day: number
  sessionNumber: number
  attendance: string
  attentiveness: number
  behaviorPoints: number
}

export async function updateSession(data: SessionUpdate) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to update a session.")
  }

  const { error } = await supabase
    .from("sessions")
    .upsert(
      {
        module_id: data.moduleId,
        day: data.day,
        session_number: data.sessionNumber,
        attendance: data.attendance,
        attentiveness: data.attentiveness,
        behavior_points: data.behaviorPoints,
      },
      {
        onConflict: "module_id,day,session_number",
      }
    )

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}