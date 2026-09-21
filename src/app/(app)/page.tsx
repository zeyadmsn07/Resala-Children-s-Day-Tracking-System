"use client"

import React, { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useStaff } from "@/lib/hooks/use-staff"
import { getClassOverview, ClassOverview } from "@/lib/data/classes"
import { getAllStudents, Student } from "@/lib/data/students"
import { getGreeting, todayInCairo } from "@/lib/domain/schedule"
import { matchesStudent } from "@/lib/domain/search"
import { StudentAvatar } from "@/components/student/avatar"
import { AddStudentSheet } from "@/components/student/add-student-sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  ArrowRight01Icon,
  PlusSignIcon,
  Book02Icon,
  BulbIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

export default function HomePage() {
  const staff = useStaff()
  const router = useRouter()

  const [classes, setClasses] = useState<ClassOverview[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Recent students
  const [recentStudentIds, setRecentStudentIds] = useState<string[]>([])

  // Add student sheet
  const [addSheetOpen, setAddSheetOpen] = useState(false)

  const greeting = getGreeting()
  const firstName = staff.fullName.split(" ")[0] || "there"

  // Cairo date format: "Saturday, 26 Sep"
  const formattedToday = useMemo(() => {
    try {
      const now = new Date()
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Cairo",
        weekday: "long",
        day: "numeric",
        month: "short",
      }).format(now)
    } catch {
      return todayInCairo()
    }
  }, [])

  async function loadData() {
    try {
      const [cls, std] = await Promise.all([getClassOverview(), getAllStudents()])
      setClasses(cls)
      setStudents(std)
    } catch (err) {
      console.error("Failed to load home data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Read recent students from localStorage
    try {
      const stored = localStorage.getItem("recent-students")
      if (stored) {
        setRecentStudentIds(JSON.parse(stored))
      }
    } catch {
      // Safe fallback
    }
  }, [])

  // Filter search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return students
      .filter((s) => matchesStudent(searchQuery, s))
      .slice(0, 8)
  }, [students, searchQuery])

  // Recent students objects
  const recentStudents = useMemo(() => {
    return recentStudentIds
      .map((id) => students.find((s) => s.id === id))
      .filter((s): s is Student => Boolean(s))
      .slice(0, 5)
  }, [students, recentStudentIds])

  // Separate tracks
  const englishClasses = classes.filter((c) => c.track === "English")
  const skillsClasses = classes.filter((c) => c.track === "Project")

  function handleSelectStudent(studentId: string) {
    // Update recent students
    try {
      const updated = [studentId, ...recentStudentIds.filter((id) => id !== studentId)].slice(0, 5)
      setRecentStudentIds(updated)
      localStorage.setItem("recent-students", JSON.stringify(updated))
    } catch {
      // Safe ignore
    }
    router.push(`/students/${studentId}`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Greeting Banner (Section 4.2) */}
      <div className="pt-1 sm:pt-2">
        <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-primary mt-0.5">
          {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground/80 mt-1 italic">
          Every child. Every session. Every step forward.
        </p>
      </div>

      {/* Today Banner */}
      <div className="p-4 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary block">
            Cairo Time
          </span>
          <span className="text-sm font-semibold text-foreground">
            {formattedToday}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[oklch(0.72_0.19_150)] animate-pulse" />
          <span className="text-xs font-semibold text-muted-foreground">Active Session</span>
        </div>
      </div>

      {/* Global Search Input (Section 4.2) */}
      <div className="relative">
        <div className="relative flex items-center">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none"
            strokeWidth={2.2}
          />
          <input
            type="text"
            placeholder="Find a student by name or ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full h-13 pl-12 pr-4 rounded-2xl bg-white border border-border/80 shadow-soft text-base focus:border-primary focus:ring-3 focus:ring-primary/20 outline-hidden transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchFocused && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-border shadow-soft-raised z-50 overflow-hidden max-h-80 overflow-y-auto">
            {searchResults.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={() => handleSelectStudent(s.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-secondary text-left transition-colors border-b last:border-b-0 border-border/50 cursor-pointer"
              >
                <StudentAvatar id={s.id} name={s.name} size={40} />
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-foreground truncate">
                    {s.name}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {s.age ? `Age ${s.age}` : "Age —"} · {s.student_code || `S-${s.id.slice(0, 4).toUpperCase()}`}
                  </span>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent Students Chips */}
      {recentStudents.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Recently Opened
          </span>
          <div className="flex flex-wrap gap-2.5">
            {recentStudents.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectStudent(s.id)}
                className="inline-flex items-center gap-2.5 px-3.5 min-h-[44px] rounded-full bg-white border border-border/90 hover:border-primary text-xs font-bold text-foreground shadow-2xs hover:shadow-soft transition-all active:scale-95 cursor-pointer"
              >
                <StudentAvatar id={s.id} name={s.name} size={32} />
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading classes…</span>
        </div>
      ) : (
        <>
          {/* English Classes Section (Section 4.2: English first!) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <HugeiconsIcon icon={Book02Icon} className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <h2 className="text-lg font-black text-foreground">
                  English Classes
                </h2>
              </div>
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                {englishClasses.length} {englishClasses.length === 1 ? "class" : "classes"}
              </span>
            </div>

            {englishClasses.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  No English classes yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {englishClasses.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/classes/${cls.id}`}
                    className="group relative block p-4 sm:p-5 rounded-3xl bg-white border border-border/80 hover:border-primary/50 transition-all duration-200 shadow-soft hover:shadow-soft-raised active:scale-[0.98] min-h-[84px]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                            English
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {cls.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          {cls.student_count} {cls.student_count === 1 ? "student" : "students"} enrolled
                        </p>
                      </div>
                      <div className="w-10 h-10 shrink-0 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-2xs group-hover:bg-primary group-hover:text-white transition-all">
                        <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Skills Classes Section (Section 4.2: Skills directly below!) */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[oklch(0.96_0.05_60)] flex items-center justify-center text-[oklch(0.68_0.20_55)]">
                  <HugeiconsIcon icon={BulbIcon} className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <h2 className="text-lg font-black text-foreground">
                  Skills Classes
                </h2>
              </div>
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                {skillsClasses.length} {skillsClasses.length === 1 ? "class" : "classes"}
              </span>
            </div>

            {skillsClasses.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  No Skills classes yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {skillsClasses.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/classes/${cls.id}`}
                    className="group relative block p-4 sm:p-5 rounded-3xl bg-white border border-border/80 hover:border-[oklch(0.68_0.20_55)]/50 transition-all duration-200 shadow-soft hover:shadow-soft-raised active:scale-[0.98] min-h-[84px]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-[oklch(0.68_0.20_55)]" />
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[oklch(0.68_0.20_55)]">
                            Skills & Project
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground group-hover:text-[oklch(0.68_0.20_55)] transition-colors truncate">
                          {cls.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          {cls.student_count} {cls.student_count === 1 ? "student" : "students"} enrolled
                        </p>
                      </div>
                      <div className="w-10 h-10 shrink-0 rounded-2xl bg-[oklch(0.96_0.05_60)] flex items-center justify-center text-[oklch(0.68_0.20_55)] shadow-2xs group-hover:bg-[oklch(0.68_0.20_55)] group-hover:text-white transition-all">
                        <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Floating Add Student Button (FAB, Section 4.7: 56px circular "+") */}
      <button
        type="button"
        onClick={() => setAddSheetOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-5 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-soft-raised hover:scale-105 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
        aria-label="Add student"
        title="Add student"
      >
        <HugeiconsIcon icon={PlusSignIcon} className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* Add Student Dialog */}
      <AddStudentSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        classes={classes}
        onSuccess={loadData}
      />
    </div>
  )
}
