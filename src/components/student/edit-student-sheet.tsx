"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { updateStudent, removeStudent, Student } from "@/lib/data/students"

type ClassOption = {
  id: string
  name: string
  track: "English" | "Project"
}

type EditStudentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student
  classes: ClassOption[]
  onUpdated: () => void
  onRemoved: () => void
}

export function EditStudentSheet({
  open,
  onOpenChange,
  student,
  classes,
  onUpdated,
  onRemoved,
}: EditStudentSheetProps) {
  const [name, setName] = useState(student.name)
  const [age, setAge] = useState(student.age ? String(student.age) : "")
  const [phone, setPhone] = useState(student.mother_phone_number || "")
  const [englishClassId, setEnglishClassId] = useState(student.english_class_id || "")
  const [projectClassId, setProjectClassId] = useState(student.project_class_id || "")
  const [saving, setSaving] = useState(false)

  // Remove student confirmation state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [confirmName, setConfirmName] = useState("")
  const [removing, setRemoving] = useState(false)

  const firstName = student.name.trim().split(" ")[0] || ""
  const isMatch = confirmName.trim().toLowerCase() === firstName.toLowerCase()

  const englishClasses = classes.filter((c) => c.track === "English")
  const projectClasses = classes.filter((c) => c.track === "Project")

  // Base UI's <Select.Value> renders the raw value string (the class id)
  // unless it's told how to map that value to a label. These two helpers
  // do that lookup against the classes list, falling back to a sensible
  // placeholder if the id isn't found (e.g. classes hasn't loaded yet).
  function englishClassLabel(value: unknown) {
    if (!value) return "Select English class"
    const match = englishClasses.find((c) => c.id === value)
    return match ? match.name : "Select English class"
  }

  function projectClassLabel(value: unknown) {
    if (!value) return "Select Skills class"
    const match = projectClasses.find((c) => c.id === value)
    return match ? match.name : "Select Skills class"
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    const res = await updateStudent(student.id, {
      name: name.trim(),
      age: age ? parseInt(age, 10) : null,
      mother_phone_number: phone.trim() || null,
      english_class_id: englishClassId || null,
      project_class_id: projectClassId || null,
    })
    setSaving(false)

    if (!res.ok) {
      toast.add({
        title: "Update failed",
        description: res.message,
        type: "error",
      })
      return
    }

    toast.add({
      title: "Changes saved",
      description: "Student details have been updated.",
      type: "success",
    })
    onUpdated()
    onOpenChange(false)
  }

  async function handleRemove() {
    if (!isMatch) return
    setRemoving(true)

    const res = await removeStudent(student.id)
    setRemoving(false)

    if (!res.ok) {
      toast.add({
        title: "Removal failed",
        description: res.message,
        type: "error",
      })
      return
    }

    toast.add({
      title: "Student removed",
      description: `${firstName} was removed.`,
      type: "success",
    })
    setConfirmDeleteOpen(false)
    onOpenChange(false)
    onRemoved()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              Edit Student
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base rounded-2xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-age" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Age
                </Label>
                <Input
                  id="edit-age"
                  type="number"
                  min={3}
                  max={18}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="h-12 text-base rounded-2xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mother&apos;s Phone
                </Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 text-base rounded-2xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  English Class
                </Label>
                <Select
                  value={englishClassId}
                  onValueChange={(val) => setEnglishClassId(val ?? "")}
                >
                  <SelectTrigger className="w-full h-12 text-sm rounded-2xl">
                    <SelectValue placeholder="Select English class">
                      {englishClassLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not assigned</SelectItem>
                    {englishClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Skills Class
                </Label>
                <Select
                  value={projectClassId}
                  onValueChange={(val) => setProjectClassId(val ?? "")}
                >
                  <SelectTrigger className="w-full h-12 text-sm rounded-2xl">
                    <SelectValue placeholder="Select Skills class">
                      {projectClassLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not assigned</SelectItem>
                    {projectClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-12 rounded-2xl font-bold bg-primary text-white active:scale-98"
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>

            {/* Danger Zone: Remove Student */}
            <div className="pt-4 border-t border-destructive/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">
                Remove this student
              </h4>
              <p className="text-xs text-muted-foreground">
                Permanently delete Ahmed and all associated academic records.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirmDeleteOpen(true)}
                className="w-full h-11 rounded-2xl font-semibold active:scale-98"
              >
                Remove Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog (Section 4.6: Type first name to confirm) */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive">
              Remove {student.name}?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              This permanently deletes {student.name}&apos;s profile and every attendance,
              attentiveness, behavior, and grade record for all modules. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-2">
            <Label htmlFor="confirm-first-name" className="text-xs font-semibold text-foreground">
              Type the student&apos;s first name (<span className="font-bold">{firstName}</span>) to confirm:
            </Label>
            <Input
              id="confirm-first-name"
              placeholder={firstName}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="h-11 rounded-2xl text-base"
              autoFocus
            />
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
              className="w-full sm:w-auto h-11 rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!isMatch || removing}
              onClick={handleRemove}
              className="w-full sm:w-auto h-11 rounded-2xl font-bold disabled:opacity-40"
            >
              {removing ? "Removing…" : "Remove Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}