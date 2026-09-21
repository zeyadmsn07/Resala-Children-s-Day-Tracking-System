"use client"

import React, { useEffect, useState, useMemo } from "react"
import { getClassOverview, ClassOverview } from "@/lib/data/classes"
import { getAllStudents, Student } from "@/lib/data/students"
import { supabase } from "@/lib/supabase"
import { StudentAvatar } from "@/components/student/avatar"
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FilterIcon,
  StarIcon,
  Alert02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function AnalyticsPage() {
  const [classes, setClasses] = useState<ClassOverview[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [studentModules, setStudentModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [selectedModule, setSelectedModule] = useState<string>("all")
  const [selectedDay, setSelectedDay] = useState<string>("all")

  async function loadData() {
    try {
      const [cls, stds, sessRes, modsRes] = await Promise.all([
        getClassOverview(),
        getAllStudents(),
        supabase.from("sessions").select("*"),
        supabase.from("student_modules").select("*"),
      ])
      setClasses(cls)
      setStudents(stds)
      setSessions(sessRes.data ?? [])
      setStudentModules(modsRes.data ?? [])
    } catch (err) {
      console.error("Failed to load analytics data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filter students in scope
  const scopedStudents = useMemo(() => {
    if (selectedClassId === "all") return students
    return students.filter(
      (s) => s.english_class_id === selectedClassId || s.project_class_id === selectedClassId
    )
  }, [students, selectedClassId])

  const scopedStudentIds = useMemo(() => {
    return new Set(scopedStudents.map((s) => s.id))
  }, [scopedStudents])

  // Filter sessions in scope
  const scopedSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (!scopedStudentIds.has(s.student_id)) return false
      if (selectedDay !== "all" && s.day_number !== Number(selectedDay)) return false
      return true
    })
  }, [sessions, scopedStudentIds, selectedDay])

  // Summary Metrics (Section 6.2)
  const metrics = useMemo(() => {
    let present = 0
    let absent = 0
    let excused = 0
    const attnValues: number[] = []
    let netBehavior = 0
    const assignmentScores: number[] = []

    for (const s of scopedSessions) {
      if (s.attendance_status === "Present") {
        present++
        if (s.attentiveness_percentage !== null && s.attentiveness_percentage !== undefined) {
          attnValues.push(s.attentiveness_percentage)
        }
      } else if (s.attendance_status === "Absent") {
        absent++
      } else if (s.attendance_status === "Excused") {
        excused++
      }

      if (s.behavior_points) netBehavior += s.behavior_points
      if (s.daily_assignment_score !== null && s.daily_assignment_score !== undefined) {
        assignmentScores.push(s.daily_assignment_score)
      }
    }

    const attendanceRate =
      present + absent > 0 ? Math.round((present / (present + absent)) * 100) : null

    const avgAttentiveness =
      attnValues.length > 0
        ? Math.round(attnValues.reduce((a, b) => a + b, 0) / attnValues.length)
        : null

    const avgAssignment =
      assignmentScores.length > 0
        ? Math.round(assignmentScores.reduce((a, b) => a + b, 0) / assignmentScores.length)
        : null

    // Project grades for students in scope
    const grades = studentModules
      .filter((sm) => scopedStudentIds.has(sm.student_id) && sm.overall_project_grade !== null)
      .map((sm) => sm.overall_project_grade as number)

    const avgGrade =
      grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null

    return {
      studentsInView: scopedStudents.length,
      attendanceRate,
      avgAttentiveness,
      netBehavior,
      avgAssignment,
      avgGrade,
      totalSessions: scopedSessions.length,
    }
  }, [scopedSessions, scopedStudents, studentModules, scopedStudentIds])

  // Chart 1: Attentiveness by Session (1 to 4)
  const sessionTrend = useMemo(() => {
    return [1, 2, 3, 4].map((sessNum) => {
      const vals = scopedSessions
        .filter((s) => s.session_number === sessNum && s.attendance_status === "Present" && s.attentiveness_percentage !== null)
        .map((s) => s.attentiveness_percentage as number)

      return {
        session: `S${sessNum} ${sessNum === 1 ? "(English)" : "(Skills)"}`,
        attentiveness:
          vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null,
      }
    })
  }, [scopedSessions])

  // Chart 2: Daily Assignment Average (Day 1 to 4)
  const dailyTrend = useMemo(() => {
    return [1, 2, 3, 4].map((d) => {
      const scores = scopedSessions
        .filter((s) => s.day_number === d && s.daily_assignment_score !== null && s.daily_assignment_score !== undefined)
        .map((s) => s.daily_assignment_score as number)

      return {
        day: `Day ${d}`,
        average:
          scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      }
    })
  }, [scopedSessions])

  // Chart 3: Attendance Breakdown
  const attendanceBreakdown = useMemo(() => {
    return [1, 2, 3, 4].map((d) => {
      const daySess = scopedSessions.filter((s) => s.day_number === d)
      const p = daySess.filter((s) => s.attendance_status === "Present").length
      const a = daySess.filter((s) => s.attendance_status === "Absent").length
      const e = daySess.filter((s) => s.attendance_status === "Excused").length
      return { day: `Day ${d}`, Present: p, Absent: a, Excused: e }
    })
  }, [scopedSessions])

  // Shining Stars (Top 5 Behavior)
  const shiningStars = useMemo(() => {
    const studentPoints: Record<string, number> = {}
    for (const s of scopedSessions) {
      studentPoints[s.student_id] = (studentPoints[s.student_id] || 0) + (s.behavior_points || 0)
    }

    return Object.entries(studentPoints)
      .map(([id, points]) => ({
        student: scopedStudents.find((st) => st.id === id),
        points,
      }))
      .filter((item): item is { student: Student; points: number } => Boolean(item.student && item.points > 0))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
  }, [scopedSessions, scopedStudents])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Computing analytics…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header & Sticky Filter Bar (Section 6.1) */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Analytics Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Holistic academic performance and engagement tracking
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-white border border-border/80 shadow-2xs text-xs">
          <span className="text-muted-foreground font-bold flex items-center gap-1 pl-1">
            <HugeiconsIcon icon={FilterIcon} className="w-3.5 h-3.5" /> Filter:
          </span>

          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="h-9 px-3 rounded-xl bg-muted/50 border border-input text-foreground font-semibold outline-hidden cursor-pointer"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.track})
              </option>
            ))}
          </select>

          {/* Day Filter */}
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="h-9 px-3 rounded-xl bg-muted/50 border border-input text-foreground font-semibold outline-hidden cursor-pointer"
          >
            <option value="all">All Days</option>
            <option value="1">Day 1</option>
            <option value="2">Day 2</option>
            <option value="3">Day 3</option>
            <option value="4">Day 4</option>
          </select>

          {selectedClassId !== "all" || selectedDay !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setSelectedClassId("all")
                setSelectedDay("all")
              }}
              className="text-xs font-bold text-destructive underline px-2 cursor-pointer ml-auto"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {/* Summary Tiles (Section 6.3: 2 x 3 Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-3xl bg-white border border-border shadow-soft text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Students
          </span>
          <span className="text-2xl font-black text-foreground mt-1 block">
            {metrics.studentsInView}
          </span>
        </div>

        <div className="p-3.5 rounded-3xl bg-[oklch(0.96_0.05_150)] border border-[oklch(0.72_0.19_150)]/30 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.40_0.15_150)] block">
            Attendance
          </span>
          <span className="text-2xl font-black text-[oklch(0.35_0.15_150)] mt-1 block">
            {metrics.attendanceRate !== null ? `${metrics.attendanceRate}%` : "—"}
          </span>
        </div>

        <div className="p-3.5 rounded-3xl bg-[oklch(0.96_0.02_255)] border border-primary/20 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
            Avg Focus
          </span>
          <span className="text-2xl font-black text-primary mt-1 block">
            {metrics.avgAttentiveness !== null ? `${metrics.avgAttentiveness}%` : "—"}
          </span>
        </div>

        <div className="p-3.5 rounded-3xl bg-[oklch(0.96_0.05_60)] border border-[oklch(0.68_0.20_55)]/20 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.68_0.20_55)] block">
            Net Behavior
          </span>
          <span className="text-2xl font-black text-[oklch(0.68_0.20_55)] mt-1 block">
            {metrics.netBehavior > 0 ? `+${metrics.netBehavior}` : metrics.netBehavior}
          </span>
        </div>

        <div className="p-3.5 rounded-3xl bg-white border border-border shadow-soft text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Avg Assign.
          </span>
          <span className="text-2xl font-black text-foreground mt-1 block">
            {metrics.avgAssignment !== null ? metrics.avgAssignment : "—"}
          </span>
        </div>

        <div className="p-3.5 rounded-3xl bg-white border border-border shadow-soft text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Avg Grade
          </span>
          <span className="text-2xl font-black text-foreground mt-1 block">
            {metrics.avgGrade !== null ? metrics.avgGrade : "—"}
          </span>
        </div>
      </div>

      {/* Charts (Priority 1: Section 6.3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Attentiveness by Session */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-border shadow-soft space-y-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Average Attentiveness by Session
            </h3>
            <p className="text-xs text-muted-foreground">
              Sessions 1 (English) through 4 (Skills / Fun Day)
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(val: any) => [`${val}%`, "Attentiveness"]} />
                <Line
                  type="monotone"
                  dataKey="attentiveness"
                  stroke="#253487"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#253487" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily Assignment Average */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-border shadow-soft space-y-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Daily Assignment Average
            </h3>
            <p className="text-xs text-muted-foreground">Days 1 through 4</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [val, "Average Score"]} />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#F59E0B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Attendance Breakdown */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-border shadow-soft space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Daily Attendance Distribution
          </h3>
          <p className="text-xs text-muted-foreground">
            Logged student records per day
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Present" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Absent" fill="#EF4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Excused" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shining Stars (Top Behavior) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-border shadow-soft space-y-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={StarIcon} className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
          <h3 className="text-base font-bold text-foreground">
            Shining Stars (Highest Net Behavior)
          </h3>
        </div>

        {shiningStars.length === 0 ? (
          <p className="text-xs text-muted-foreground">No positive behavior logged yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {shiningStars.map(({ student, points }) => (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                className="p-3 rounded-2xl bg-muted/40 hover:bg-secondary border border-border/70 flex items-center gap-3 transition-colors"
              >
                <StudentAvatar id={student.id} name={student.name} size={32} />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-foreground truncate block">
                    {student.name}
                  </span>
                  <span className="text-[11px] font-black text-[oklch(0.50_0.15_150)]">
                    +{points} pts
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
