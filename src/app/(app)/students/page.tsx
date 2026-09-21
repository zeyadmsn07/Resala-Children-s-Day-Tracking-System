"use client"

import React, { useEffect, useState, useMemo } from "react"
import { getAllStudents, Student } from "@/lib/data/students"
import { getClassOverview, ClassOverview } from "@/lib/data/classes"
import { matchesStudent } from "@/lib/domain/search"
import { StudentCard } from "@/components/student/student-card"
import { AddStudentSheet } from "@/components/student/add-student-sheet"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  PlusSignIcon,
  FilterIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

export default function AllStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<ClassOverview[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEnglishClass, setSelectedEnglishClass] = useState<string>("all")
  const [selectedSkillsClass, setSelectedSkillsClass] = useState<string>("all")
  const [filterNoClass, setFilterNoClass] = useState(false)
  const [filterNoInternet, setFilterNoInternet] = useState(false)
  const [filterNoPhone, setFilterNoPhone] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "code">("name")

  const [addSheetOpen, setAddSheetOpen] = useState(false)

  async function loadData() {
    try {
      const [stds, cls] = await Promise.all([getAllStudents(), getClassOverview()])
      setStudents(stds)
      setClasses(cls)
    } catch (err) {
      console.error("Failed to load students:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const englishClasses = classes.filter((c) => c.track === "English")
  const skillsClasses = classes.filter((c) => c.track === "Project")

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (!matchesStudent(searchQuery, s)) return false
        if (selectedEnglishClass !== "all" && s.english_class_id !== selectedEnglishClass) return false
        if (selectedSkillsClass !== "all" && s.project_class_id !== selectedSkillsClass) return false
        if (filterNoClass && (s.english_class_id || s.project_class_id)) return false
        if (filterNoInternet && s.internet_access === true) return false
        if (filterNoPhone && s.phone_access === true) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === "code") {
          const codeA = a.student_code || a.id
          const codeB = b.student_code || b.id
          return codeA.localeCompare(codeB)
        }
        return a.name.localeCompare(b.name)
      })
  }, [
    students,
    searchQuery,
    selectedEnglishClass,
    selectedSkillsClass,
    filterNoClass,
    filterNoInternet,
    filterNoPhone,
    sortBy,
  ])

  function clearFilters() {
    setSelectedEnglishClass("all")
    setSelectedSkillsClass("all")
    setFilterNoClass(false)
    setFilterNoInternet(false)
    setFilterNoPhone(false)
    setSearchQuery("")
  }

  const hasActiveFilters =
    selectedEnglishClass !== "all" ||
    selectedSkillsClass !== "all" ||
    filterNoClass ||
    filterNoInternet ||
    filterNoPhone

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            All Students
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {students.length} students enrolled in the program
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setAddSheetOpen(true)}
          className="hidden sm:inline-flex rounded-2xl h-11 px-5 font-bold gap-2"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="w-5 h-5" strokeWidth={2.5} />
          <span>Add Student</span>
        </Button>
      </div>

      {/* Search Field */}
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

      {/* Filter Chips (Section 4.8) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        <span className="text-muted-foreground shrink-0 flex items-center gap-1 font-semibold">
          <HugeiconsIcon icon={FilterIcon} className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* English Class select */}
        <select
          value={selectedEnglishClass}
          onChange={(e) => setSelectedEnglishClass(e.target.value)}
          className="h-9 px-3 rounded-full border border-border bg-white text-foreground outline-hidden cursor-pointer"
        >
          <option value="all">All English Classes</option>
          {englishClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Skills Class select */}
        <select
          value={selectedSkillsClass}
          onChange={(e) => setSelectedSkillsClass(e.target.value)}
          className="h-9 px-3 rounded-full border border-border bg-white text-foreground outline-hidden cursor-pointer"
        >
          <option value="all">All Skills Classes</option>
          {skillsClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Toggle chips */}
        <button
          type="button"
          onClick={() => setFilterNoClass(!filterNoClass)}
          className={`h-9 px-3.5 rounded-full border transition-colors shrink-0 cursor-pointer ${
            filterNoClass
              ? "bg-primary text-white border-primary font-bold"
              : "bg-white text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          No class assigned
        </button>

        <button
          type="button"
          onClick={() => setFilterNoInternet(!filterNoInternet)}
          className={`h-9 px-3.5 rounded-full border transition-colors shrink-0 cursor-pointer ${
            filterNoInternet
              ? "bg-[oklch(0.64_0.22_25)] text-white border-[oklch(0.64_0.22_25)] font-bold"
              : "bg-white text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          No internet
        </button>

        <button
          type="button"
          onClick={() => setFilterNoPhone(!filterNoPhone)}
          className={`h-9 px-3.5 rounded-full border transition-colors shrink-0 cursor-pointer ${
            filterNoPhone
              ? "bg-[oklch(0.64_0.22_25)] text-white border-[oklch(0.64_0.22_25)] font-bold"
              : "bg-white text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          No phone
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-bold text-destructive underline shrink-0 px-2 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Sort Control */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing {filteredStudents.length} of {students.length} students
        </span>
        <div className="flex items-center gap-1.5">
          <span>Sort:</span>
          <button
            type="button"
            onClick={() => setSortBy("name")}
            className={`font-semibold cursor-pointer ${sortBy === "name" ? "text-primary underline" : "text-muted-foreground"}`}
          >
            A–Z
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setSortBy("code")}
            className={`font-semibold cursor-pointer ${sortBy === "code" ? "text-primary underline" : "text-muted-foreground"}`}
          >
            Code
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading database…</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-8 rounded-3xl bg-muted/30 border border-dashed border-border text-center space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            No students match the current filter criteria.
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" className="rounded-2xl">
              Reset Filters
            </Button>
          )}
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
              englishClassName={s.english_class?.name}
              projectClassName={s.project_class?.name}
              href={`/students/${s.id}`}
            />
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        type="button"
        onClick={() => setAddSheetOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-5 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-soft-raised hover:scale-105 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
        aria-label="Add student"
        title="Add student"
      >
        <HugeiconsIcon icon={PlusSignIcon} className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      <AddStudentSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        classes={classes}
        onSuccess={loadData}
      />
    </div>
  )
}
