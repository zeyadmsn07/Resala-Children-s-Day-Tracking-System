"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { supabase } from "@/lib/supabase"

type ClassRow = {
  id: string
  name: string
  track: string
}

type StudentRow = {
  id: string
  name: string
  age: number | null
  mother_phone_number: string | null
  english_class_id: string | null
  project_class_id: string | null
  english_class: ClassRow | null
  project_class: ClassRow | null
}

export default function DashboardPage() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // New student form state
  const [newName, setNewName] = useState("")
  const [newAge, setNewAge] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newEnglishClassId, setNewEnglishClassId] = useState("")
  const [newProjectClassId, setNewProjectClassId] = useState("")

  async function fetchData() {
    const [studentsRes, classesRes] = await Promise.all([
      supabase
        .from("students")
        .select(
          "id, name, age, mother_phone_number, english_class_id, project_class_id, english_class:classes!english_class_id(id, name, track), project_class:classes!project_class_id(id, name, track)"
        ),
      supabase.from("classes").select("id, name, track"),
    ])

    setStudents((studentsRes.data as unknown as StudentRow[]) ?? [])
    setClasses(classesRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const englishClasses = classes.filter((c) => c.track === "English")
  const projectClasses = classes.filter((c) => c.track === "Project")

  const englishStudents = students.filter((s) => s.english_class_id)
  const projectStudents = students.filter((s) => s.project_class_id)

  function resetForm() {
    setNewName("")
    setNewAge("")
    setNewPhone("")
    setNewEnglishClassId("")
    setNewProjectClassId("")
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault()

    if (!newName.trim()) {
      toast.add({
        title: "Missing name",
        description: "Please enter the student's name.",
        type: "error",
      })
      return
    }

    setSubmitting(true)

    const { error } = await supabase.from("students").insert({
      name: newName.trim(),
      age: newAge ? parseInt(newAge, 10) : null,
      mother_phone_number: newPhone || null,
      english_class_id: newEnglishClassId || null,
      project_class_id: newProjectClassId || null,
    })

    if (error) {
      toast.add({
        title: "Error",
        description: error.message,
        type: "error",
      })
    } else {
      toast.add({
        title: "Student Added",
        description: `${newName} has been added successfully.`,
        type: "success",
      })
      resetForm()
      setDialogOpen(false)
      await fetchData()
    }

    setSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your assigned students across tracks.
            </p>
          </div>

          {/* Add Student Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="h-11 sm:h-10 w-full sm:w-auto text-base sm:text-sm font-semibold shadow-xs active:scale-95" />
              }
            >
              + Add New Student
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Fill in the student details below.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="student-name" className="text-sm font-medium">Name</Label>
                  <Input
                    id="student-name"
                    placeholder="Student name"
                    className="h-11 sm:h-10 text-base"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="student-age" className="text-sm font-medium">Age</Label>
                  <Input
                    id="student-age"
                    type="number"
                    placeholder="Age"
                    className="h-11 sm:h-10 text-base"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="student-phone" className="text-sm font-medium">
                    Mother&apos;s Phone Number
                  </Label>
                  <Input
                    id="student-phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="h-11 sm:h-10 text-base"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">English Class</Label>
                  <Select
                    value={newEnglishClassId}
                    onValueChange={(value) => setNewEnglishClassId(value ?? "")}
                  >
                    <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
                      <SelectValue placeholder="Select English class" />
                    </SelectTrigger>
                    <SelectContent>
                      {englishClasses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Project Class</Label>
                  <Select
                    value={newProjectClassId}
                    onValueChange={(value) => setNewProjectClassId(value ?? "")}
                  >
                    <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
                      <SelectValue placeholder="Select Project class" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectClasses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                  <DialogClose render={<Button variant="outline" className="w-full sm:w-auto h-11 sm:h-10" />}>
                    Cancel
                  </DialogClose>
                  <Button type="submit" className="w-full sm:w-auto h-11 sm:h-10" disabled={submitting}>
                    {submitting ? "Adding…" : "Add Student"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Student Tabs */}
        <Tabs defaultValue="english">
          <TabsList className="grid w-full grid-cols-2 h-11 sm:h-10">
            <TabsTrigger value="english" className="text-sm font-semibold py-2">
              English Tracks
            </TabsTrigger>
            <TabsTrigger value="project" className="text-sm font-semibold py-2">
              Project Tracks
            </TabsTrigger>
          </TabsList>

          {/* English Tab */}
          <TabsContent value="english" className="mt-5">
            {loading ? (
              <p className="text-muted-foreground py-6 text-center">Loading students…</p>
            ) : englishStudents.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">
                    No students enrolled in English tracks yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {englishStudents.map((student) => (
                  <Link key={student.id} href={`/students/${student.id}`}>
                    <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] border-border/80">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold">
                            {student.name}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">→</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm font-medium text-primary">
                          {student.english_class?.name ?? "No class assigned"}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {student.age && <span>Age: {student.age}</span>}
                          {student.mother_phone_number && (
                            <span className="text-foreground">
                              📞 {student.mother_phone_number}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Project Tab */}
          <TabsContent value="project" className="mt-5">
            {loading ? (
              <p className="text-muted-foreground py-6 text-center">Loading students…</p>
            ) : projectStudents.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">
                    No students enrolled in Project tracks yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {projectStudents.map((student) => (
                  <Link key={student.id} href={`/students/${student.id}`}>
                    <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] border-border/80">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold">
                            {student.name}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">→</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm font-medium text-primary">
                          {student.project_class?.name ?? "No class assigned"}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {student.age && <span>Age: {student.age}</span>}
                          {student.mother_phone_number && (
                            <span className="text-foreground">
                              📞 {student.mother_phone_number}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
