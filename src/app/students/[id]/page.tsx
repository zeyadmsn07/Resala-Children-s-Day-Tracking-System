"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { supabase } from "@/lib/supabase"

type ClassRow = {
  id: string
  name: string
  track: string
}

type Student = {
  id: string
  name: string
  age: number | null
  mother_phone_number: string | null
  internet_access: boolean
  phone_access: boolean
  photo_url: string | null
  english_class_id: string | null
  project_class_id: string | null
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function fetchStudent() {
    const [studentRes, classesRes] = await Promise.all([
      supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single(),
      supabase.from("classes").select("id, name, track"),
    ])

    if (studentRes.data) {
      setStudent(studentRes.data)
    }
    setClasses(classesRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchStudent()
  }, [studentId])

  async function updateField(field: string, value: unknown) {
    const { error } = await supabase
      .from("students")
      .update({ [field]: value })
      .eq("id", studentId)

    if (error) {
      toast.add({
        title: "Update failed",
        description: error.message,
        type: "error",
      })
    } else {
      setStudent((prev) => (prev ? { ...prev, [field]: value } : prev))
    }
  }

  async function handleDelete() {
    setDeleting(true)

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId)

    if (error) {
      toast.add({
        title: "Delete failed",
        description: error.message,
        type: "error",
      })
      setDeleting(false)
    } else {
      toast.add({
        title: "Student Removed",
        description: `${student?.name} has been removed and all related records have been cleared.`,
        type: "success",
      })
      router.push("/")
    }
  }

  const englishClasses = classes.filter((c) => c.track === "English")
  const projectClasses = classes.filter((c) => c.track === "Project")

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-muted-foreground">Loading student…</p>
        </div>
      </main>
    )
  }

  if (!student) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">
                Student Not Found
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Header with Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {student.photo_url && (
              <AvatarImage src={student.photo_url} alt={student.name} />
            )}
            <AvatarFallback className="text-lg">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              {student.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {student.age ? `Age ${student.age}` : "Age not set"}
              {student.mother_phone_number &&
                ` · ${student.mother_phone_number}`}
            </p>
          </div>
        </div>

        {/* Access Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Access Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="internet-access">Internet Access</Label>
              <Switch
                id="internet-access"
                checked={student.internet_access}
                onCheckedChange={(checked) =>
                  updateField("internet_access", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="phone-access">Phone Access</Label>
              <Switch
                id="phone-access"
                checked={student.phone_access}
                onCheckedChange={(checked) =>
                  updateField("phone_access", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Class Reassignment */}
        <Card>
          <CardHeader>
            <CardTitle>Class Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>English Class</Label>
              <Select
                value={student.english_class_id ?? ""}
                onValueChange={(value) =>
                  updateField("english_class_id", value || null)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No English class assigned" />
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
                value={student.project_class_id ?? ""}
                onValueChange={(value) =>
                  updateField("project_class_id", value || null)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No Project class assigned" />
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
          </CardContent>
        </Card>

        {/* Remove Student */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger
                render={<Button variant="destructive" className="w-full" />}
              >
                Remove Student
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Student</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove{" "}
                    <strong>{student.name}</strong>? This will permanently delete
                    all their grades, session records, and module data. This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Removing…" : "Yes, Remove Student"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
