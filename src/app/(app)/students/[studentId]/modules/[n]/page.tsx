"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getStudent, Student } from "@/lib/data/students"
import {
  getModules,
  getSessionSlots,
  getStudentModuleData,
  upsertSession,
  updateOverallModuleGrade,
  ModuleInfo,
  SlotInfo,
} from "@/lib/data/sessions"
import { StudentAvatar } from "@/components/student/avatar"
import { DayChips, DayStatus } from "@/components/tracking/day-chips"
import { SessionAccordion, SessionData } from "@/components/tracking/session-accordion"
import { SaveStatus, SaveState } from "@/components/tracking/save-status"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

export default function ModuleTrackingView() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const studentId = params.studentId as string
  const moduleNumber = Number(params.n)
  const fromClassId = searchParams.get("from")

  const [student, setStudent] = useState<Student | null>(null)
  const [modules, setModules] = useState<ModuleInfo[]>([])
  const [slots, setSlots] = useState<SlotInfo[]>([])
  const [loading, setLoading] = useState(true)

  // Active day selection (1 to 4)
  const [activeDay, setActiveDay] = useState<number>(() => {
    const dayParam = searchParams.get("day")
    return dayParam ? Number(dayParam) : 1
  })

  // State maps: [dayNumber][sessionNumber] -> SessionData
  const [allDaysSessions, setAllDaysSessions] = useState<
    Record<number, Record<number, SessionData>>
  >({ 1: {}, 2: {}, 3: {}, 4: {} })

  // Daily assignment scores: [dayNumber] -> score
  const [dailyAssignmentScores, setDailyAssignmentScores] = useState<Record<number, number | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  })

  // Overall module grade
  const [overallGrade, setOverallGrade] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveState>("saved")

  const currentModule = modules.find((m) => m.module_number === moduleNumber)

  async function loadData() {
    try {
      const [std, mods, slts] = await Promise.all([
        getStudent(studentId),
        getModules(),
        getSessionSlots(),
      ])

      setStudent(std)
      setModules(mods)
      setSlots(slts)

      const mod = mods.find((m) => m.module_number === moduleNumber)
      if (mod) {
        const { sessions, overallProjectGrade } = await getStudentModuleData(studentId, mod.id)
        setOverallGrade(overallProjectGrade)

        // Populate session state map
        const stateMap: Record<number, Record<number, SessionData>> = { 1: {}, 2: {}, 3: {}, 4: {} }
        const assignmentMap: Record<number, number | null> = { 1: null, 2: null, 3: null, 4: null }

        for (const row of sessions) {
          const d = row.day_number
          const s = row.session_number
          if (!stateMap[d]) stateMap[d] = {}

          stateMap[d][s] = {
            attendance: row.attendance_status as any,
            attentiveness: row.attentiveness_percentage,
            behaviorPoints: row.behavior_points ?? 0,
            positivePoints: Math.max(0, row.behavior_points ?? 0),
            negativePoints: Math.max(0, -(row.behavior_points ?? 0)),
          }

          if (row.daily_assignment_score !== null && row.daily_assignment_score !== undefined) {
            assignmentMap[d] = row.daily_assignment_score
          }
        }

        setAllDaysSessions(stateMap)
        setDailyAssignmentScores(assignmentMap)
      }
    } catch (err) {
      console.error("Failed to load module view:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [studentId, moduleNumber])

  // Current day's sessions
  const currentDaySessions = allDaysSessions[activeDay] || {}

  // Calculate day summary metrics
  const daySummary = useMemo(() => {
    let p = 0
    let a = 0
    let e = 0
    const attnValues: number[] = []

    for (let s = 1; s <= 4; s++) {
      const sess = currentDaySessions[s]
      if (sess?.attendance === "Present") {
        p++
        if (sess.attentiveness !== null) attnValues.push(sess.attentiveness)
      } else if (sess?.attendance === "Absent") {
        a++
      } else if (sess?.attendance === "Excused") {
        e++
      }
    }

    const avgAttn =
      attnValues.length > 0
        ? Math.round(attnValues.reduce((sum, v) => sum + v, 0) / attnValues.length)
        : null

    return { present: p, absent: a, excused: e, avgAttentiveness: avgAttn }
  }, [currentDaySessions])

  // Calculate overall module attentiveness
  const overallModuleAttentiveness = useMemo(() => {
    const allAttn: number[] = []
    for (let d = 1; d <= 4; d++) {
      const daySess = allDaysSessions[d] || {}
      for (let s = 1; s <= 4; s++) {
        const sess = daySess[s]
        if (sess?.attendance === "Present" && sess.attentiveness !== null) {
          allAttn.push(sess.attentiveness)
        }
      }
    }
    return allAttn.length > 0
      ? Math.round(allAttn.reduce((sum, v) => sum + v, 0) / allAttn.length)
      : null
  }, [allDaysSessions])

  // Compute status dots for day chips
  const dayStatuses: Record<number, DayStatus> = useMemo(() => {
    const statuses: Record<number, DayStatus> = {}
    for (let d = 1; d <= 4; d++) {
      const sess = allDaysSessions[d] || {}
      const markedCount = [1, 2, 3, 4].filter((s) => sess[s]?.attendance).length
      if (markedCount === 0) statuses[d] = "empty"
      else if (markedCount === 4) statuses[d] = "full"
      else statuses[d] = "half"
    }
    return statuses
  }, [allDaysSessions])

  async function handleSessionChange(sessionNumber: number, changes: Partial<SessionData>) {
    if (!currentModule) return

    setAllDaysSessions((prev) => {
      const dayData = { ...prev[activeDay] }
      const current = dayData[sessionNumber] || {
        attendance: null,
        attentiveness: null,
        behaviorPoints: 0,
      }
      const updated = { ...current, ...changes }
      dayData[sessionNumber] = updated

      // Autosave this session
      setSaveStatus("saving")
      upsertSession({
        student_id: studentId,
        module_id: currentModule.id,
        day_number: activeDay,
        session_number: sessionNumber,
        attendance_status: updated.attendance,
        attentiveness_percentage: updated.attentiveness,
        behavior_points: updated.behaviorPoints,
        daily_assignment_score: dailyAssignmentScores[activeDay],
      })
        .then(() => setSaveStatus("saved"))
        .catch((err) => {
          console.error("Session autosave error:", err)
          setSaveStatus("failed")
        })

      return { ...prev, [activeDay]: dayData }
    })
  }

  async function handleAssignmentScoreBlur(score: number | null) {
    if (!currentModule) return
    setDailyAssignmentScores((prev) => ({ ...prev, [activeDay]: score }))

    // Save to session 1 of that day
    setSaveStatus("saving")
    try {
      await upsertSession({
        student_id: studentId,
        module_id: currentModule.id,
        day_number: activeDay,
        session_number: 1,
        daily_assignment_score: score,
      })
      setSaveStatus("saved")
    } catch {
      setSaveStatus("failed")
    }
  }

  async function handleOverallGradeBlur(grade: number | null) {
    if (!currentModule) return
    setOverallGrade(grade)
    setSaveStatus("saving")
    try {
      await updateOverallModuleGrade(studentId, currentModule.id, grade)
      setSaveStatus("saved")
    } catch {
      setSaveStatus("failed")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading module tracking…</span>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="p-8 text-center space-y-4">
        <p>Student not found.</p>
        <Button onClick={() => router.push("/students")}>Back to Students</Button>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-16">
      {/* Sticky Header (Section 4.5: Avatar, Student Name, Module Title, Save Pill) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-border/80 shadow-soft flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={`/students/${studentId}${fromClassId ? `?from=${fromClassId}` : ""}`}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground hover:bg-secondary active:scale-95 transition-colors -ml-1 cursor-pointer"
            aria-label="Back to student profile"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" strokeWidth={2.2} />
          </Link>

          <StudentAvatar id={student.id} name={student.name} size={32} photoUrl={student.photo_url} />

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black text-foreground truncate">
              {student.name}
            </h2>
            <p className="text-xs text-primary font-bold">
              Module {moduleNumber}
            </p>
          </div>
        </div>

        <SaveStatus status={saveStatus} />
      </div>

      {/* Day Chips (Section 4.5: 4 equal width pills) */}
      <DayChips
        activeDay={activeDay}
        onSelectDay={(day) => {
          setActiveDay(day)
          router.replace(`?day=${day}${fromClassId ? `&from=${fromClassId}` : ""}`)
        }}
        dayStatuses={dayStatuses}
      />

      {/* Day Panel (Section 4.5) */}
      <div className="space-y-4">
        {/* Daily Assignment Score Card */}
        <div className="p-4 rounded-3xl bg-white border border-border/80 shadow-soft flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="daily-score" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Day {activeDay} Assignment Score
            </Label>
            <span className="text-xs text-muted-foreground">
              Score from 0 to 100
            </span>
          </div>

          <div className="w-24">
            <Input
              id="daily-score"
              type="number"
              min={0}
              max={100}
              placeholder="—"
              value={dailyAssignmentScores[activeDay] ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : Number(e.target.value)
                setDailyAssignmentScores((prev) => ({ ...prev, [activeDay]: val }))
              }}
              onBlur={(e) => {
                const val = e.target.value === "" ? null : Number(e.target.value)
                handleAssignmentScoreBlur(val)
              }}
              className="h-11 text-center font-black text-lg text-primary rounded-2xl"
            />
          </div>
        </div>

        {/* Day Summary Tiles */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-[oklch(0.96_0.05_150)] border border-[oklch(0.72_0.19_150)]/30">
            <span className="text-[10px] font-bold text-[oklch(0.40_0.15_150)] uppercase block">
              Present
            </span>
            <span className="text-lg font-black text-[oklch(0.35_0.15_150)] tabular-nums">
              {daySummary.present}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[oklch(0.95_0.04_25)] border border-[oklch(0.64_0.22_25)]/30">
            <span className="text-[10px] font-bold text-[oklch(0.50_0.19_25)] uppercase block">
              Absent
            </span>
            <span className="text-lg font-black text-[oklch(0.45_0.19_25)] tabular-nums">
              {daySummary.absent}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[oklch(0.97_0.05_90)] border border-[oklch(0.80_0.16_85)]/30">
            <span className="text-[10px] font-bold text-[oklch(0.45_0.12_75)] uppercase block">
              Excused
            </span>
            <span className="text-lg font-black text-[oklch(0.40_0.12_75)] tabular-nums">
              {daySummary.excused}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-muted/60 border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase block">
              Avg Focus
            </span>
            <span className="text-lg font-black text-primary tabular-nums">
              {daySummary.avgAttentiveness !== null ? `${daySummary.avgAttentiveness}%` : "—"}
            </span>
          </div>
        </div>

        {/* Session Accordion */}
        <SessionAccordion
          slots={slots}
          sessionsData={currentDaySessions}
          onChangeSession={handleSessionChange}
          hasEnglishClass={Boolean(student.english_class_id)}
          hasProjectClass={Boolean(student.project_class_id)}
        />
      </div>

      {/* Module Footer Card (Section 4.5: Auto-calculated metrics) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-border/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Overall Module 1–4 Attentiveness
          </span>
          <span className="text-2xl font-black text-primary">
            {overallModuleAttentiveness !== null ? `${overallModuleAttentiveness}%` : "—"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Label htmlFor="overall-grade" className="text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            Overall Module Skills Grade:
          </Label>
          <div className="w-24">
            <Input
              id="overall-grade"
              type="number"
              min={0}
              max={100}
              placeholder="0–100"
              value={overallGrade ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : Number(e.target.value)
                setOverallGrade(val)
              }}
              onBlur={(e) => {
                const val = e.target.value === "" ? null : Number(e.target.value)
                handleOverallGradeBlur(val)
              }}
              className="h-11 text-center font-black text-lg text-foreground rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
