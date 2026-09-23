"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getStudent, updateStudent, Student } from "@/lib/data/students"
import { getClassOverview, ClassOverview } from "@/lib/data/classes"
import { getModules, getStudentTotalBehaviorPoints, ModuleInfo } from "@/lib/data/sessions"
import { supabase } from "@/lib/supabase"
import { StudentAvatar } from "@/components/student/avatar"
import { BubbleToggle } from "@/components/access/bubble-toggle"
import { EditStudentSheet } from "@/components/student/edit-student-sheet"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Edit01Icon,
  Call02Icon,
  Copy01Icon,
  ArrowRight01Icon,
  Loading03Icon,
  StarIcon,
} from "@hugeicons/core-free-icons"

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = params.studentId as string
  const fromClassId = searchParams.get("from")

  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<ClassOverview[]>([])
  const [modules, setModules] = useState<ModuleInfo[]>([])
  const [moduleStats, setModuleStats] = useState<
    Record<number, { daysLogged: number; avgAttentiveness: number | null; grade: number | null }>
  >({})
  const [totalBehaviorPoints, setTotalBehaviorPoints] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [editSheetOpen, setEditSheetOpen] = useState(false)

  async function loadData() {
    try {
      const [std, cls, mods, totalPoints] = await Promise.all([
        getStudent(studentId),
        getClassOverview(),
        getModules(),
        getStudentTotalBehaviorPoints(studentId),
      ])

      setTotalBehaviorPoints(totalPoints)

      if (std) {
        setStudent(std)
        setClasses(cls)
        setModules(mods)

        // Fetch session data to compute module cards
        const [sessionsRes, gradesRes] = await Promise.all([
          supabase.from("sessions").select("module_id, day_number, attentiveness_percentage, attendance_status").eq("student_id", studentId),
          supabase.from("student_modules").select("module_id, overall_project_grade").eq("student_id", studentId),
        ])

        const sessions = sessionsRes.data ?? []
        const grades = gradesRes.data ?? []

        const stats: Record<number, { daysLogged: number; avgAttentiveness: number | null; grade: number | null }> = {}

        for (const mod of mods) {
          const modSessions = sessions.filter((s: any) => s.module_id === mod.id)
          const daysSet = new Set(modSessions.map((s: any) => s.day_number))

          const validAttn = modSessions
            .filter((s: any) => s.attendance_status === "Present" && s.attentiveness_percentage !== null)
            .map((s: any) => s.attentiveness_percentage as number)

          const avg =
            validAttn.length > 0
              ? Math.round(validAttn.reduce((a: number, b: number) => a + b, 0) / validAttn.length)
              : null

          const gradeRow = grades.find((g: any) => g.module_id === mod.id)

          stats[mod.module_number] = {
            daysLogged: daysSet.size,
            avgAttentiveness: avg,
            grade: gradeRow?.overall_project_grade ?? null,
          }
        }

        setModuleStats(stats)
      }
    } catch (err) {
      console.error("Failed to load student profile:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [studentId])

  async function handleToggleAccess(field: "internet_access" | "phone_access", value: boolean) {
    if (!student) return
    const prev = student[field]
    setStudent({ ...student, [field]: value })

    const res = await updateStudent(student.id, { [field]: value })
    if (!res.ok) {
      setStudent({ ...student, [field]: prev })
      toast.add({
        title: "Update failed",
        description: res.message,
        type: "error",
      })
    }
  }

  function handleCopyPhone() {
    if (!student?.mother_phone_number) return
    navigator.clipboard.writeText(student.mother_phone_number)
    toast.add({
      title: "Phone Copied",
      description: "Mother's phone number copied to clipboard.",
      type: "info",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading student profile…</span>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground font-medium">Student not found.</p>
        <Button onClick={() => router.push("/students")}>Back to Students</Button>
      </div>
    )
  }

  const displayCode = student.student_code || `S-${student.id.slice(0, 4).toUpperCase()}`

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb Context */}
      <div className="flex items-center justify-between">
        <Link
          href={fromClassId ? `/classes/${fromClassId}` : "/students"}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground hover:text-primary transition-colors py-1 px-2 -ml-2 rounded-xl hover:bg-secondary"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          <span>{fromClassId ? "Back to Class Roster" : "Back to All Students"}</span>
        </Link>
      </div>

      {/* Details Block (Section 4.4) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border/80 shadow-soft space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <StudentAvatar id={student.id} name={student.name} size={64} photoUrl={student.photo_url} />
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-foreground tracking-tight truncate">
                {student.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {student.age ? `Age ${student.age}` : "Age —"} · {displayCode}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditSheetOpen(true)}
            className="p-2.5 rounded-2xl bg-muted/60 hover:bg-secondary text-muted-foreground hover:text-primary transition-colors active:scale-95 cursor-pointer"
            aria-label="Edit student"
            title="Edit student"
          >
            <HugeiconsIcon icon={Edit01Icon} className="w-5 h-5" strokeWidth={2.2} />
          </button>
        </div>

        {/* Class Chips (Section 4.4: Dynamic Class Reassignment) */}
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[oklch(0.96_0.02_255)] border border-primary/20 text-xs font-bold text-primary">
            <span>English:</span>
            <span>{student.english_class?.name || "Not assigned"}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[oklch(0.96_0.05_60)] border border-[oklch(0.68_0.20_55)]/20 text-xs font-bold text-[oklch(0.68_0.20_55)]">
            <span>Skills:</span>
            <span>{student.project_class?.name || "Not assigned"}</span>
          </div>

          {/* Total Behavior Points Chip — net across every module, day, and session */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${
              totalBehaviorPoints > 0
                ? "bg-[oklch(0.96_0.05_150)] border-[oklch(0.72_0.19_150)]/30 text-[oklch(0.40_0.15_150)]"
                : totalBehaviorPoints < 0
                ? "bg-[oklch(0.95_0.04_25)] border-[oklch(0.64_0.22_25)]/30 text-[oklch(0.50_0.19_25)]"
                : "bg-muted/60 border-border text-muted-foreground"
            }`}
            title="Total behavior points across all modules, days, and sessions"
          >
            <HugeiconsIcon icon={StarIcon} className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Total Behavior:</span>
            <span className="font-mono">
              {totalBehaviorPoints > 0 ? `+${totalBehaviorPoints}` : totalBehaviorPoints}
            </span>
          </div>
        </div>

        {/* Mother Phone Contact */}
        {student.mother_phone_number && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
            <div className="text-xs font-semibold text-foreground">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                Mother&apos;s Phone
              </span>
              <span>{student.mother_phone_number}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${student.mother_phone_number}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <HugeiconsIcon icon={Call02Icon} className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-border text-foreground text-xs font-bold hover:bg-secondary active:scale-95 transition-all cursor-pointer"
              >
                <HugeiconsIcon icon={Copy01Icon} className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        )}

        {/* Bubble Toggles for Internet and Phone (Section 7.5) */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Home Technology Access
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BubbleToggle
              type="internet"
              checked={student.internet_access ?? false}
              onChange={(val) => handleToggleAccess("internet_access", val)}
            />
            <BubbleToggle
              type="phone"
              checked={student.phone_access ?? false}
              onChange={(val) => handleToggleAccess("phone_access", val)}
            />
          </div>
        </div>
      </div>

      {/* Modules Section (Section 4.4: 4 Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">
            Academic Modules
          </h2>

          {/* Total Behavior Points Summary Card */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-border/80 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Behavior
            </span>
            <span
              className={`text-sm font-black font-mono tabular-nums ${
                totalBehaviorPoints > 0
                  ? "text-[oklch(0.50_0.15_150)]"
                  : totalBehaviorPoints < 0
                  ? "text-[oklch(0.50_0.19_25)]"
                  : "text-muted-foreground"
              }`}
            >
              {totalBehaviorPoints > 0 ? `+${totalBehaviorPoints}` : totalBehaviorPoints}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {modules.map((mod) => {
            const stat = moduleStats[mod.module_number] || {
              daysLogged: 0,
              avgAttentiveness: null,
              grade: null,
            }

            return (
              <Link
                key={mod.id}
                href={`/students/${studentId}/modules/${mod.module_number}${fromClassId ? `?from=${fromClassId}` : ""}`}
                className="group p-4 rounded-3xl bg-white border border-border/80 hover:border-primary/50 shadow-soft hover:shadow-soft-raised transition-all duration-200 flex flex-col justify-between min-h-[140px] cursor-pointer active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {mod.name}
                    </h3>
                    {mod.module_number === 1 && (
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-primary text-white">
                        Now
                      </span>
                    )}
                  </div>

                  {/* Progress Ring / Ratio */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-[oklch(0.68_0.20_55)] bg-[oklch(0.96_0.05_60)] flex items-center justify-center text-[10px] font-black text-[oklch(0.68_0.20_55)]">
                      {stat.daysLogged}/4
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {stat.daysLogged} of 4 days
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Focus</span>
                    <span className="font-bold text-primary">
                      {stat.avgAttentiveness !== null ? `${stat.avgAttentiveness}%` : "—"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px]">Grade</span>
                    <span className="font-bold text-foreground">
                      {stat.grade !== null ? stat.grade : "—"}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Edit Student Sheet */}
      <EditStudentSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        student={student}
        classes={classes}
        onUpdated={loadData}
        onRemoved={() => router.push("/students")}
      />
    </div>
  )
}