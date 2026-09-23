"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { BubbleToggle } from "@/components/access/bubble-toggle"
import { toast } from "@/components/ui/toast"
import { addStudent } from "@/lib/data/students"

type ClassOption = {
  id: string
  name: string
  track: "English" | "Project"
}

type AddStudentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classes: ClassOption[]
  preselectedClassId?: string
  preselectedTrack?: "English" | "Project"
  onSuccess?: () => void
}

export function AddStudentSheet({
  open,
  onOpenChange,
  classes,
  preselectedClassId,
  preselectedTrack,
  onSuccess,
}: AddStudentSheetProps) {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [phone, setPhone] = useState("")
  const [englishClassId, setEnglishClassId] = useState(() =>
    preselectedTrack === "English" && preselectedClassId ? preselectedClassId : ""
  )
  const [projectClassId, setProjectClassId] = useState(() =>
    preselectedTrack === "Project" && preselectedClassId ? preselectedClassId : ""
  )
  const [internetAccess, setInternetAccess] = useState(false)
  const [phoneAccess, setPhoneAccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

  function resetForm(keepClasses = false) {
    setName("")
    setAge("")
    setPhone("")
    setInternetAccess(false)
    setPhoneAccess(false)
    if (!keepClasses) {
      setEnglishClassId(preselectedTrack === "English" && preselectedClassId ? preselectedClassId : "")
      setProjectClassId(preselectedTrack === "Project" && preselectedClassId ? preselectedClassId : "")
    }
  }

  async function handleSave(keepOpen = false) {
    if (!name.trim() || name.trim().length < 2) {
      toast.add({
        title: "Invalid name",
        description: "Please enter a student name of at least 2 characters.",
        type: "error",
      })
      return
    }

    setSubmitting(true)

    const res = await addStudent({
      name: name.trim(),
      age: age ? parseInt(age, 10) : null,
      mother_phone_number: phone.trim() || null,
      english_class_id: englishClassId || null,
      project_class_id: projectClassId || null,
      internet_access: internetAccess,
      phone_access: phoneAccess,
    })

    setSubmitting(false)

    if (!res.ok) {
      toast.add({
        title: "Error adding student",
        description: res.message,
        type: "error",
      })
      return
    }

    const assignedClass =
      classes.find((c) => c.id === englishClassId) ??
      classes.find((c) => c.id === projectClassId)
    const classLabel = assignedClass?.name ? ` to ${assignedClass.name}` : ""

    toast.add({
      title: "Student Added",
      description: `${name.trim()} added${classLabel}.`,
      type: "success",
    })

    onSuccess?.()

    if (keepOpen) {
      resetForm(true)
    } else {
      resetForm(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Add New Student
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave(false)
          }}
          className="space-y-4 pt-2"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="student-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name *
            </Label>
            <Input
              id="student-name"
              placeholder="e.g. Ahmed Mohamed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base rounded-2xl"
              required
            />
          </div>

          {/* Age & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="student-age" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Age (3–18)
              </Label>
              <Input
                id="student-age"
                type="number"
                min={3}
                max={18}
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="h-12 text-base rounded-2xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mother&apos;s Phone
              </Label>
              <Input
                id="student-phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 text-base rounded-2xl"
              />
            </div>
          </div>

          {/* Classes */}
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

          {/* Tech Access Bubble Toggles */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Technology Access at Home
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BubbleToggle
                type="internet"
                checked={internetAccess}
                onChange={setInternetAccess}
              />
              <BubbleToggle
                type="phone"
                checked={phoneAccess}
                onChange={setPhoneAccess}
              />
            </div>
          </div>

          {/* Action buttons */}
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={submitting}
              className="w-full sm:w-auto h-12 rounded-2xl"
            >
              Save & Add Another
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto h-12 rounded-2xl font-bold bg-primary text-white active:scale-98"
            >
              {submitting ? "Saving…" : "Save Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}