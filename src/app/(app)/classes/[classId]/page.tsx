"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getClass, getClassOverview, ClassOverview } from "@/lib/data/classes"
import { getStudentsByClass, Student } from "@/lib/data/students"
import { matchesStudent } from "@/lib/domain/search"
import { StudentCard } from "@/components/student/student-card"
import { AddStudentSheet } from "@/components/student/add-student-sheet"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Search01Icon,
  PlusSignIcon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

export default function ClassRosterPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [classInfo, setClassInfo] = useState<{ id: string; name: string; track: "English" | "Project" } | null>(null)
  const [allClasses, setAllClasses] = useState<ClassOverview[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [addSheetOpen, setAddSheetOpen] = useState(false)

  async function loadData() {
    try {
      const cls = await getClass(classId)
      if (cls) {
        setClassInfo(cls)
        const [stds, allCls] = await Promise.all([
          getStudentsByClass(cls.id, cls.track),
          getClassOverview(),
        ])
        setStudents(stds)
        setAllClasses(allCls)
      }
    } catch (err) {
      console.error("Failed to load class roster:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [classId])

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students
    return students.filter((s) => matchesStudent(searchQuery, s))
  }, [students, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading class roster…</span>
      </div>
    )
  }

  if (!classInfo) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Class not found</h2>
        <Button onClick={() => router.push("/")} variant="outline">
          Back to Home
        </Button>
      </div>
    )
  }

  const isEnglish = classInfo.track === "English"

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12">
      {/* Header with Back button and Track Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-muted/60 text-foreground hover:bg-secondary active:scale-95 transition-colors -ml-1 cursor-pointer"
            aria-label="Back to classes"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" strokeWidth={2.2} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {classInfo.name}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isEnglish
                    ? "bg-[oklch(0.96_0.02_255)] text-primary border border-primary/20"
                    : "bg-[oklch(0.96_0.05_60)] text-[oklch(0.68_0.20_55)] border border-[oklch(0.68_0.20_55)]/20"
                }`}
              >
                {isEnglish ? "English Track" : "Skills Track"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {students.length} {students.length === 1 ? "student" : "students"} enrolled
            </p>
          </div>
        </div>

        {/* Take Attendance Button (Opens Roll Call, Section 5.1) */}
        <Link
          href={`/classes/${classId}/roll-call`}
          className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-2xl bg-primary text-white font-bold text-sm shadow-soft hover:bg-primary/90 active:scale-98 transition-all"
        >
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5" strokeWidth={2.2} />
          <span>Take Attendance</span>
        </Link>
      </div>

      {/* Sticky Search Field (Section 4.3) */}
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
          strokeWidth={2.2}
        />
        <input
          type="text"
          placeholder="Search by name or ID…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-border/80 shadow-2xs text-sm focus:border-primary focus:ring-3 focus:ring-primary/20 outline-hidden transition-all"
        />
      </div>

      {searchQuery.trim() && (
        <p className="text-xs text-muted-foreground font-medium px-1">
          {filteredStudents.length} of {students.length} students
        </p>
      )}

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="p-8 rounded-3xl bg-muted/30 border border-dashed border-border text-center space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {searchQuery ? "No student found matching your search." : "No students in this class yet."}
          </p>
          <Button
            type="button"
            onClick={() => setAddSheetOpen(true)}
            className="rounded-2xl font-bold"
          >
            + Add student to this class
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStudents.map((s) => (
            <StudentCard
              key={s.id}
              id={s.id}
              name={s.name}
              age={s.age}
              studentCode={s.student_code}
              photoUrl={s.photo_url}
              internetAccess={s.internet_access}
              phoneAccess={s.phone_access}
              href={`/students/${s.id}?from=${classId}`}
            />
          ))}
        </div>
      )}

      {/* Floating Add Student Button */}
      <button
        type="button"
        onClick={() => setAddSheetOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-5 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-soft-raised hover:scale-105 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
        aria-label="Add student to class"
        title="Add student"
      >
        <HugeiconsIcon icon={PlusSignIcon} className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* Add Student Sheet prefilled for this class */}
      <AddStudentSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        classes={allClasses}
        preselectedClassId={classId}
        preselectedTrack={classInfo.track}
        onSuccess={loadData}
      />
    </div>
  )
}
