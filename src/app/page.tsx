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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <DialogTrigger render={<Button />}>
              Add New Student
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Fill in the student details below.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Name</Label>
                  <Input
                    id="student-name"
                    placeholder="Student name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-age">Age</Label>
                  <Input
                    id="student-age"
                    type="number"
                    placeholder="Age"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-phone">
                    Mother&apos;s Phone Number
                  </Label>
                  <Input
                    id="student-phone"
                    placeholder="01XXXXXXXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>English Class</Label>
                  <Select
                    value={newEnglishClassId}
                    onValueChange={(value) => setNewEnglishClassId(value ?? "")}
                  >
                    <SelectTrigger className="w-full">
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

                <div className="space-y-2">
                  <Label>Project Class</Label>
                  <Select
                    value={newProjectClassId}
                    onValueChange={(value) => setNewProjectClassId(value ?? "")}
                  >
                    <SelectTrigger className="w-full">
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

                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Adding…" : "Add Student"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Student Tabs */}
        <Tabs defaultValue="english">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="english">English Tracks</TabsTrigger>
            <TabsTrigger value="project">Project Tracks</TabsTrigger>
          </TabsList>

          {/* English Tab */}
          <TabsContent value="english" className="mt-6">
            {loading ? (
              <p className="text-muted-foreground">Loading students…</p>
            ) : englishStudents.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">
                    No students enrolled in English tracks yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {englishStudents.map((student) => (
                  <Link key={student.id} href={`/students/${student.id}`}>
                    <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="text-base">
                          {student.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {student.english_class?.name ?? "No class assigned"}
                        </p>
                        {student.age && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Age: {student.age}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Project Tab */}
          <TabsContent value="project" className="mt-6">
            {loading ? (
              <p className="text-muted-foreground">Loading students…</p>
            ) : projectStudents.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">
                    No students enrolled in Project tracks yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projectStudents.map((student) => (
                  <Link key={student.id} href={`/students/${student.id}`}>
                    <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="text-base">
                          {student.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {student.project_class?.name ?? "No class assigned"}
                        </p>
                        {student.age && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Age: {student.age}
                          </p>
                        )}
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
