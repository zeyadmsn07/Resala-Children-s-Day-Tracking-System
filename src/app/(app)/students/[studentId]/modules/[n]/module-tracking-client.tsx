"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Student } from "@/lib/data/students"
import {
  ModuleInfo,
  SlotInfo,
  upsertSession,
  updateOverallModuleGrade,
} from "@/lib/data/sessions"
import { StudentAvatar } from "@/components/student/avatar"
import { DayChips, DayStatus } from "@/components/tracking/day-chips"
import { SessionAccordion, SessionData } from "@/components/tracking/session-accordion"
import { SaveStatus, SaveState } from "@/components/tracking/save-status"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

type ModuleTrackingClientProps = {
  student: Student
  modules: ModuleInfo[]
  slots: SlotInfo[]
  moduleNumber: number
  fromClassId: string | null
  initialDay: number
  initialSessions: Record<number, Record<number, SessionData>>
  initialAssignmentScores: Record<number, number | null>
  initialOverallGrade: number | null
}

export default function ModuleTrackingClient({
  student,
  modules,
  slots,
  moduleNumber,
  fromClassId,
  initialDay,
  initialSessions,
  initialAssignmentScores,
  initialOverallGrade,
}: ModuleTrackingClientProps) {
  const router = useRouter()

  const studentId = student.id

  // Active day selection (1 to 4)
  const [activeDay, setActiveDay] = useState<number>(initialDay)

  // State maps: [dayNumber][sessionNumber] -> SessionData
  const [allDaysSessions, setAllDaysSessions] = useState<
    Record<number, Record<number, SessionData>>
  >(initialSessions)

  // Daily assignment scores: [dayNumber] -> score
  const [dailyAssignmentScores, setDailyAssignmentScores] = useState<Record<number, number | null>>(
    initialAssignmentScores
  )

  // Overall module grade
  const [overallGrade, setOverallGrade] = useState<number | null>(initialOverallGrade)
  const [saveStatus, setSaveStatus] = useState<SaveState>("saved")

  const currentModule = modules.find((m) => m.module_number === moduleNumber)

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

    // Compute the next value from state read here, not from inside the
    // setState updater. Firing a network call from inside a functional
    // updater is unsafe: React (in Strict Mode, which Next.js enables by
    // default in dev) intentionally invokes updater functions twice to
    // surface exactly this kind of side effect, which was doubling every
    // autosave request.
    const current = currentDaySessions[sessionNumber] || {
      attendance: null,
      attentiveness: null,
      behaviorPoints: 0,
    }
    const updated = { ...current, ...changes }

    setAllDaysSessions((prev) => ({
      ...prev,
      [activeDay]: { ...prev[activeDay], [sessionNumber]: updated },
    }))

    setSaveStatus("saving")
    try {
      await upsertSession({
        student_id: studentId,
        module_id: currentModule.id,
        day_number: activeDay,
        session_number: sessionNumber,
        attendance_status: updated.attendance,
        attentiveness_percentage: updated.attentiveness,
        behavior_points: updated.behaviorPoints,
        daily_assignment_score: dailyAssignmentScores[activeDay],
        fun_day_followed_instructions: updated.funDayFollowedInstructions ?? null,
        fun_day_played_well_with_others: updated.funDayPlayedWellWithOthers ?? null,
        fun_day_stayed_engaged: updated.funDayStayedEngaged ?? null,
      })
      setSaveStatus("saved")
    } catch (err) {
      console.error("Session autosave error:", err instanceof Error ? err.message : err)
      setSaveStatus("failed")
    }
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