"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { supabase } from "@/lib/supabase"

export default function StaffPage() {
  const [role, setRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [email, setEmail] = useState("")
  const [assignedRole, setAssignedRole] = useState("")

  useEffect(() => {
    async function loadCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (data) {
        setRole(data.role)
        // Heads can only assign "member"
        if (data.role === "head") {
          setAssignedRole("member")
        }
      }

      setLoading(false)
    }

    loadCurrentUser()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !assignedRole) {
      toast.add({
        title: "Missing fields",
        description: "Please fill in the email and role.",
        type: "error",
      })
      return
    }

    setSubmitting(true)

    const { error } = await supabase.from("staff_directory").insert({
      email,
      role: assignedRole,
      added_by: userId,
    })

    if (error) {
      toast.add({
        title: "Error",
        description: error.message,
        type: "error",
      })
    } else {
      toast.add({
        title: "Staff Whitelisted",
        description: `${email} has been added as "${assignedRole}". They can now sign up.`,
        type: "success",
      })
      setEmail("")
      if (role === "director") {
        setAssignedRole("")
      }
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </main>
    )
  }

  if (role !== "director" && role !== "head") {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <CardDescription>
                You do not have permission to manage staff.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Whitelist new staff members so they can sign up.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Staff</CardTitle>
            <CardDescription>
              {role === "director"
                ? "As a director, you can add heads and members."
                : "As a head, you can add members."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="newstaff@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {role === "director" ? (
                <div className="space-y-2">
                  <Label htmlFor="staff-role">Role</Label>
                  <Select
                    value={assignedRole}
                    onValueChange={(value) => setAssignedRole(value ?? "")}
                  >
                    <SelectTrigger id="staff-role" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head">Head</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value="Member" disabled />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding…" : "Whitelist Staff Member"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
