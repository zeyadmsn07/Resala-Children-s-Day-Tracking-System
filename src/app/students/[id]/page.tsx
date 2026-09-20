"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
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
    <main className="min-h-screen bg-background px-4 py-6 sm:py-8 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-5">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-secondary active:bg-secondary"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Header with Avatar */}
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 sm:p-5 shadow-xs">
          <Avatar className="h-16 w-16 shrink-0 ring-2 ring-primary/20">
            {student.photo_url && (
              <AvatarImage src={student.photo_url} alt={student.name} />
            )}
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {student.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {student.age ? `Age ${student.age}` : "Age not set"}
            </p>
            {student.mother_phone_number && (
              <a
                href={`tel:${student.mother_phone_number}`}
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                📞 {student.mother_phone_number}
              </a>
            )}
          </div>
        </div>

        {/* Access Flags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Access Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl p-3 bg-muted/40 transition-colors">
              <div>
                <Label htmlFor="internet-access" className="text-sm font-medium cursor-pointer block">
                  Internet Access
                </Label>
                <p className="text-xs text-muted-foreground">
                  Can access online materials
                </p>
              </div>
              <Switch
                id="internet-access"
                checked={student.internet_access}
                onCheckedChange={(checked) =>
                  updateField("internet_access", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl p-3 bg-muted/40 transition-colors">
              <div>
                <Label htmlFor="phone-access" className="text-sm font-medium cursor-pointer block">
                  Phone Access
                </Label>
                <p className="text-xs text-muted-foreground">
                  Has mobile device available
                </p>
              </div>
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Class Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">English Class</Label>
              <Select
                value={student.english_class_id ?? ""}
                onValueChange={(value) =>
                  updateField("english_class_id", value || null)
                }
              >
                <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
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

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Project Class</Label>
              <Select
                value={student.project_class_id ?? ""}
                onValueChange={(value) =>
                  updateField("project_class_id", value || null)
                }
              >
                <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="destructive" className="w-full h-11 sm:h-10 text-base sm:text-sm font-semibold active:scale-98" />
                }
              >
                Remove Student
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Remove Student</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove{" "}
                    <strong>{student.name}</strong>? This will permanently delete
                    all their grades, session records, and module data. This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                  <DialogClose render={<Button variant="outline" className="w-full sm:w-auto h-11 sm:h-10" />}>
                    Cancel
                  </DialogClose>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto h-11 sm:h-10 font-semibold"
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
