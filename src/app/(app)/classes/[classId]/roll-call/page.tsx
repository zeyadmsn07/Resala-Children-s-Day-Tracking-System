"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getClass } from "@/lib/data/classes"
import { getStudentsByClass, Student } from "@/lib/data/students"
import { getModules, getSessionSlots, upsertSession } from "@/lib/data/sessions"
import { StudentAvatar } from "@/components/student/avatar"
import { AttendanceControl, AttendanceValue } from "@/components/tracking/attendance-control"
import { BehaviorCounter } from "@/components/tracking/behavior-counter"
import { AttentivenessSlider } from "@/components/tracking/attentiveness-slider"
import { SaveStatus, SaveState } from "@/components/tracking/save-status"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Time02Icon,
  FilterIcon,
  Copy01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

type StudentSessionState = {
  attendance: AttendanceValue
  attentiveness: number | null
  behaviorPoints: number
}

export default function RollCallPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [classInfo, setClassInfo] = useState<{ id: string; name: string; track: "English" | "Project" } | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [modules, setModules] = useState<{ id: string; module_number: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  // Current session context
  const [activeModuleNumber, setActiveModuleNumber] = useState(1)
  const [activeDayNumber, setActiveDayNumber] = useState(1)
  const [activeSessionNumber, setActiveSessionNumber] = useState(1)

  // Map of studentId -> SessionState
  const [sessionStates, setSessionStates] = useState<Record<string, StudentSessionState>>({})
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)
  const [showUnmarkedOnly, setShowUnmarkedOnly] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveState>("saved")

  async function loadData() {
    try {
      const cls = await getClass(classId)
      if (cls) {
        setClassInfo(cls)
        const [stds, mods] = await Promise.all([
          getStudentsByClass(cls.id, cls.track),
          getModules(),
        ])
        setStudents(stds)
        setModules(mods)

        // If Skills class, session is 2, 3 or 4
        if (cls.track === "Project") {
          setActiveSessionNumber(2)
        } else {
          setActiveSessionNumber(1)
        }
      }
    } catch (err) {
      console.error("Failed to load roll call data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [classId])

  const activeModule = modules.find((m) => m.module_number === activeModuleNumber) || modules[0]

  // Counts
  const { presentCount, absentCount, excusedCount, unmarkedCount } = useMemo(() => {
    let p = 0
    let a = 0
    let e = 0
    let u = 0
    for (const student of students) {
      const state = sessionStates[student.id]?.attendance
      if (state === "Present") p++
      else if (state === "Absent") a++
      else if (state === "Excused") e++
      else u++
    }
    return { presentCount: p, absentCount: a, excusedCount: e, unmarkedCount: u }
  }, [students, sessionStates])

  const totalMarked = presentCount + absentCount + excusedCount

  async function saveStudentRow(studentId: string, state: StudentSessionState) {
    if (!activeModule) return
    setSaveStatus("saving")
    try {
      await upsertSession({
        student_id: studentId,
        module_id: activeModule.id,
        day_number: activeDayNumber,
        session_number: activeSessionNumber,
        attendance_status: state.attendance,
        attentiveness_percentage: state.attentiveness,
        behavior_points: state.behaviorPoints,
      })
      setSaveStatus("saved")
    } catch (err) {
      console.error("Failed to save roll call session:", err)
      setSaveStatus("failed")
    }
  }

  function handleUpdateStudent(studentId: string, changes: Partial<StudentSessionState>) {
    setSessionStates((prev) => {
      const current = prev[studentId] || {
        attendance: null,
        attentiveness: null,
        behaviorPoints: 0,
      }
      const updated = { ...current, ...changes }
      saveStudentRow(studentId, updated)
      return { ...prev, [studentId]: updated }
    })
  }

  function handleMarkAllPresent() {
    if (!activeModule) return
    let markedCount = 0

    const updated = { ...sessionStates }
    for (const student of students) {
      if (!updated[student.id]?.attendance) {
        updated[student.id] = {
          attendance: "Present",
          attentiveness: updated[student.id]?.attentiveness ?? 80,
          behaviorPoints: updated[student.id]?.behaviorPoints ?? 0,
        }
        saveStudentRow(student.id, updated[student.id])
        markedCount++
      }
    }
    setSessionStates(updated)
    toast.add({
      title: "Marked all present",
      description: `${markedCount} unmarked students marked Present.`,
      type: "success",
    })
  }

  const displayedStudents = useMemo(() => {
    if (!showUnmarkedOnly) return students
    return students.filter((s) => !sessionStates[s.id]?.attendance)
  }, [students, showUnmarkedOnly, sessionStates])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading roll call…</span>
      </div>
    )
  }

  if (!classInfo) {
    return (
      <div className="p-8 text-center space-y-4">
        <p>Class not found.</p>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    )
  }

  const isEnglish = classInfo.track === "English"

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-28">
      {/* Top Bar with Back and Save Status */}
      <div className="flex items-center justify-between">
        <Link
          href={`/classes/${classId}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors py-1 px-2 -ml-2 rounded-xl hover:bg-secondary"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          <span>{classInfo.name}</span>
        </Link>
        <SaveStatus status={saveStatus} />
      </div>

      {/* Session Title & Pills (Section 5.1) */}
      <div className="p-4 rounded-3xl bg-white border border-border/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-black text-foreground">
              Module {activeModuleNumber} · Day {activeDayNumber}
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {isEnglish ? "Session 1 · English Class" : "Skills Class Sessions"}
            </p>
          </div>

          {/* Session Pills for Skills Track */}
          {!isEnglish && (
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl">
              {[
                { num: 2, label: "S2 Skills" },
                { num: 3, label: "S3 Skills" },
                { num: 4, label: "S4 Fun Day" },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setActiveSessionNumber(s.num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSessionNumber === s.num
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tinted Summary Count Tiles (Section 5.1) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3 rounded-2xl bg-[oklch(0.96_0.05_150)] border border-[oklch(0.72_0.19_150)]/30 text-center">
            <span className="block text-xs font-bold text-[oklch(0.40_0.15_150)] uppercase">
              Present
            </span>
            <span className="text-2xl font-black text-[oklch(0.35_0.15_150)] tabular-nums">
              {presentCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[oklch(0.95_0.04_25)] border border-[oklch(0.64_0.22_25)]/30 text-center">
            <span className="block text-xs font-bold text-[oklch(0.50_0.19_25)] uppercase">
              Absent
            </span>
            <span className="text-2xl font-black text-[oklch(0.45_0.19_25)] tabular-nums">
              {absentCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[oklch(0.97_0.05_90)] border border-[oklch(0.80_0.16_85)]/30 text-center">
            <span className="block text-xs font-bold text-[oklch(0.45_0.12_75)] uppercase">
              Excused
            </span>
            <span className="text-2xl font-black text-[oklch(0.40_0.12_75)] tabular-nums">
              {excusedCount}
            </span>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>
              {totalMarked} of {students.length} marked
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden flex">
            <div
              className="bg-[oklch(0.72_0.19_150)] transition-all duration-300"
              style={{
                width: `${students.length ? (presentCount / students.length) * 100 : 0}%`,
              }}
            />
            <div
              className="bg-[oklch(0.64_0.22_25)] transition-all duration-300"
              style={{
                width: `${students.length ? (absentCount / students.length) * 100 : 0}%`,
              }}
            />
            <div
              className="bg-[oklch(0.80_0.16_85)] transition-all duration-300"
              style={{
                width: `${students.length ? (excusedCount / students.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Fast Entry Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllPresent}
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-[oklch(0.72_0.19_150)]" />
            <span>Mark All Unmarked Present</span>
          </Button>

          <Button
            type="button"
            variant={showUnmarkedOnly ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowUnmarkedOnly(!showUnmarkedOnly)}
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <HugeiconsIcon icon={FilterIcon} className="w-4 h-4" />
            <span>{showUnmarkedOnly ? "Show all students" : "Unmarked only"}</span>
          </Button>
        </div>
      </div>

      {/* Student Rows (Section 5.1: 2-tap fast entry) */}
      <div className="space-y-3">
        {displayedStudents.map((s) => {
          const state = sessionStates[s.id] || {
            attendance: null,
            attentiveness: null,
            behaviorPoints: 0,
          }
          const isExpanded = expandedStudentId === s.id

          return (
            <div
              key={s.id}
              className={`p-4 rounded-3xl bg-white border transition-all duration-200 shadow-2xs ${
                isExpanded ? "border-primary/40 ring-1 ring-primary/20 shadow-soft" : "border-border/80"
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <StudentAvatar id={s.id} name={s.name} size={40} />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                      {s.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {s.student_code || `S-${s.id.slice(0, 4).toUpperCase()}`}
                    </p>
                  </div>
                </div>

                {/* Status indicator pill if marked */}
                {state.attendance && (
                  <button
                    type="button"
                    onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}
                    className="text-xs font-bold px-2.5 py-1 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {isExpanded ? "Collapse" : "Details"}
                  </button>
                )}
              </div>

              {/* Attendance Segmented Control */}
              <AttendanceControl
                value={state.attendance}
                onChange={(attendance) => {
                  handleUpdateStudent(s.id, { attendance })
                  // Auto expand row when attendance is chosen
                  if (attendance) {
                    setExpandedStudentId(s.id)
                  }
                }}
              />

              {/* Expanded details: Quick Attentiveness Chips & Behavior */}
              {isExpanded && (
                <div className="pt-4 mt-3 border-t border-border/50 space-y-4 animate-in fade-in-0 duration-150">
                  {/* Quick Attentiveness Chips (Section 5.1: Low 30, Okay 60, Great 90) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Attentiveness
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {state.attentiveness !== null ? `${state.attentiveness}%` : "Not rated"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Low (30%)", val: 30 },
                        { label: "Okay (60%)", val: 60 },
                        { label: "Great (90%)", val: 90 },
                      ].map((chip) => (
                        <button
                          key={chip.val}
                          type="button"
                          onClick={() => handleUpdateStudent(s.id, { attentiveness: chip.val })}
                          className={`py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                            state.attentiveness === chip.val
                              ? "bg-primary text-white shadow-xs"
                              : "bg-muted/70 text-foreground hover:bg-secondary"
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Behavior Buttons */}
                  <BehaviorCounter
                    positiveCount={Math.max(0, state.behaviorPoints)}
                    negativeCount={Math.max(0, -state.behaviorPoints)}
                    onChange={({ net }) =>
                      handleUpdateStudent(s.id, { behaviorPoints: net })
                    }
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky Bottom Footer (Section 5.1: Done bar) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-soft-raised">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs sm:text-sm font-bold text-foreground">
            <span className="text-[oklch(0.50_0.15_150)]">{presentCount} present</span>
            {" · "}
            <span className="text-[oklch(0.50_0.19_25)]">{absentCount} absent</span>
            {unmarkedCount > 0 && (
              <>
                {" · "}
                <span className="text-muted-foreground">{unmarkedCount} unmarked</span>
              </>
            )}
          </div>

          <Button
            type="button"
            onClick={() => {
              if (unmarkedCount > 0) {
                toast.add({
                  title: "Session Saved",
                  description: `${totalMarked} students logged. ${unmarkedCount} remain unmarked.`,
                  type: "info",
                })
              } else {
                toast.add({
                  title: "Roll Call Complete",
                  description: "All students have been logged.",
                  type: "success",
                })
              }
              router.push(`/classes/${classId}`)
            }}
            className="h-12 px-8 rounded-2xl font-bold bg-primary text-white shadow-soft active:scale-98"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
