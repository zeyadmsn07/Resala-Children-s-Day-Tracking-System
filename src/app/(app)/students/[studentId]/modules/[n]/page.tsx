import { notFound } from "next/navigation"
import { getStudentServer } from "@/lib/data/students.server"
import {
  getModulesServer,
  getSessionSlotsServer,
  getStudentModuleDataServer,
} from "@/lib/data/sessions.server"
import { SessionData } from "@/components/tracking/session-accordion"
import ModuleTrackingClient from "./module-tracking-client"

export default async function ModuleTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string; n: string }>
  searchParams: Promise<{ from?: string; day?: string }>
}) {
  const { studentId, n } = await params
  const { from, day } = await searchParams
  const moduleNumber = Number(n)

  const [student, modules, slots] = await Promise.all([
    getStudentServer(studentId),
    getModulesServer(),
    getSessionSlotsServer(),
  ])

  if (!student) {
    notFound()
  }

  const currentModule = modules.find((m) => m.module_number === moduleNumber)

  // Populate initial session state map the same way the old client-side
  // loadData() did, but here on the server so the page arrives with data
  // already filled in instead of rendering empty state first.
  const initialSessions: Record<number, Record<number, SessionData>> = {
    1: {},
    2: {},
    3: {},
    4: {},
  }
  const initialAssignmentScores: Record<number, number | null> = {
    1: null,
    2: null,
    3: null,
    4: null,
  }
  let initialOverallGrade: number | null = null

  if (currentModule) {
    const { sessions, overallProjectGrade } = await getStudentModuleDataServer(
      studentId,
      currentModule.id
    )
    initialOverallGrade = overallProjectGrade

    for (const row of sessions) {
      const d = row.day_number
      const s = row.session_number
      if (!initialSessions[d]) initialSessions[d] = {}

      initialSessions[d][s] = {
        attendance: row.attendance_status as any,
        attentiveness: row.attentiveness_percentage,
        behaviorPoints: row.behavior_points ?? 0,
        positivePoints: Math.max(0, row.behavior_points ?? 0),
        negativePoints: Math.max(0, -(row.behavior_points ?? 0)),
        funDayFollowedInstructions: row.fun_day_followed_instructions ?? null,
        funDayPlayedWellWithOthers: row.fun_day_played_well_with_others ?? null,
        funDayStayedEngaged: row.fun_day_stayed_engaged ?? null,
      }

      if (row.daily_assignment_score !== null && row.daily_assignment_score !== undefined) {
        initialAssignmentScores[d] = row.daily_assignment_score
      }
    }
  }

  return (
    <ModuleTrackingClient
      student={student}
      modules={modules}
      slots={slots}
      moduleNumber={moduleNumber}
      fromClassId={from ?? null}
      initialDay={day ? Number(day) : 1}
      initialSessions={initialSessions}
      initialAssignmentScores={initialAssignmentScores}
      initialOverallGrade={initialOverallGrade}
    />
  )
}