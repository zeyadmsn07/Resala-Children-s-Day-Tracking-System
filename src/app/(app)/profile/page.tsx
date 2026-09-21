"use client"

import React, { useEffect, useState } from "react"
import { useStaff } from "@/lib/hooks/use-staff"
import { getProfile, updateProfile } from "@/lib/data/profile"
import { getTeamOverview, addToWhitelist, StaffMember } from "@/lib/data/team"
import { StudentAvatar } from "@/components/student/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserAdd01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Logout01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

export default function ProfilePage() {
  const staff = useStaff()
  const router = useRouter()

  // Profile editing state
  const [fullName, setFullName] = useState(staff.fullName)
  const [bio, setBio] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [hasProfileChanges, setHasProfileChanges] = useState(false)

  // Team access state
  const [teamList, setTeamList] = useState<StaffMember[]>([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<"head" | "member">("member")
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [addingStaff, setAddingStaff] = useState(false)

  // Password state
  const [newPassword, setNewPassword] = useState("")
  const [passwordUpdating, setPasswordUpdating] = useState(false)

  useEffect(() => {
    async function init() {
      const p = await getProfile(staff.id)
      if (p) {
        if (p.full_name) setFullName(p.full_name)
        if (p.bio) setBio(p.bio)
      }

      if (staff.canManageTeam) {
        setTeamLoading(true)
        const list = await getTeamOverview()
        setTeamList(list)
        setTeamLoading(false)
      }
    }
    init()
  }, [staff.id, staff.canManageTeam])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    const res = await updateProfile(staff.id, {
      full_name: fullName.trim(),
      bio: bio.trim(),
    })
    setProfileSaving(false)

    if (!res.ok) {
      toast.add({
        title: "Update failed",
        description: res.message,
        type: "error",
      })
    } else {
      toast.add({
        title: "Profile updated",
        description: "Your name and bio have been saved.",
        type: "success",
      })
      setHasProfileChanges(false)
    }
  }

  async function handleConfirmAddStaff() {
    setAddingStaff(true)
    const res = await addToWhitelist(newEmail, newRole)
    setAddingStaff(false)

    if (!res.ok) {
      toast.add({
        title: "Could not add staff",
        description: res.message,
        type: "error",
      })
    } else {
      toast.add({
        title: "Staff Whitelisted",
        description: `${newEmail} can now sign up as ${newRole}.`,
        type: "success",
      })
      setNewEmail("")
      setConfirmModalOpen(false)
      const list = await getTeamOverview()
      setTeamList(list)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      toast.add({
        title: "Password too short",
        description: "Please enter at least 8 characters.",
        type: "error",
      })
      return
    }

    setPasswordUpdating(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordUpdating(false)

    if (error) {
      toast.add({
        title: "Password update failed",
        description: error.message,
        type: "error",
      })
    } else {
      toast.add({
        title: "Password changed",
        description: "Your new password is now active.",
        type: "success",
      })
      setNewPassword("")
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Account details and settings
        </p>
      </div>

      {/* Identity Card (Section 4.9) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border/80 shadow-soft space-y-5">
        <div className="flex items-center gap-4">
          <StudentAvatar
            id={staff.id}
            name={fullName}
            size={64}
            role={staff.role}
          />
          <div>
            <h2 className="text-xl font-black text-foreground">{fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {staff.role}
              </span>
              <span className="text-xs text-muted-foreground">{staff.email}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="full-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name
            </Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                setHasProfileChanges(true)
              }}
              className="h-12 text-base rounded-2xl"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bio
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {bio.length}/200
              </span>
            </div>
            <textarea
              id="bio"
              maxLength={200}
              rows={3}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value)
                setHasProfileChanges(true)
              }}
              placeholder="A few words about your role at Resala Children's Day…"
              className="w-full p-3 text-sm rounded-2xl bg-input/30 border border-input outline-hidden focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>

          {hasProfileChanges && (
            <Button
              type="submit"
              disabled={profileSaving}
              className="h-11 px-6 rounded-2xl font-bold bg-primary text-white active:scale-98"
            >
              {profileSaving ? "Saving…" : "Save Profile"}
            </Button>
          )}
        </form>
      </div>

      {/* Team Access Section (Section 4.9: Director and Head ONLY) */}
      {staff.canManageTeam && (
        <div id="team" className="p-5 sm:p-6 rounded-3xl bg-white border border-border/80 shadow-soft space-y-6">
          <div>
            <h3 className="text-lg font-black text-foreground">Team Access</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Whitelist new staff members so they can register
            </p>
          </div>

          {/* Add Team Member Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!newEmail.trim()) return
              setConfirmModalOpen(true)
            }}
            className="space-y-3 p-4 rounded-2xl bg-muted/40 border border-border/60"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-staff-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="new-staff-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="h-11 text-sm rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role
                </Label>
                {staff.role === "director" ? (
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full h-11 px-3 text-sm rounded-xl bg-white border border-input outline-hidden"
                  >
                    <option value="member">Member</option>
                    <option value="head">Head</option>
                  </select>
                ) : (
                  <div className="h-11 px-3 flex items-center bg-muted border rounded-xl text-sm font-bold text-muted-foreground">
                    Member
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 px-5 rounded-xl font-bold bg-primary text-white gap-2 mt-1 active:scale-98"
            >
              <HugeiconsIcon icon={UserAdd01Icon} className="w-4 h-4" />
              <span>Whitelist Staff Member</span>
            </Button>
          </form>

          {/* Team Roster List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Whitelisted Team ({teamList.length})
            </h4>

            {teamLoading ? (
              <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                <HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 animate-spin" />
                <span>Loading team list…</span>
              </div>
            ) : (
              <div className="space-y-2">
                {teamList.map((m) => (
                  <div
                    key={m.email}
                    className="p-3 rounded-2xl bg-white border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-foreground block truncate">
                        {m.email}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                        {m.role}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {m.signed_up ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[oklch(0.96_0.05_150)] text-[oklch(0.40_0.15_150)] font-bold text-[11px]">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3.5 h-3.5" />
                          Signed up
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[oklch(0.97_0.05_90)] text-[oklch(0.45_0.12_75)] font-bold text-[11px]">
                          <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5" />
                          Waiting to sign up
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Review Modal (Section 4.9) */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Confirm Staff Access
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Add <strong className="text-foreground">{newEmail.trim().toLowerCase()}</strong> as{" "}
              <strong className="text-foreground">{newRole}</strong>? They will be able to create an account
              using this exact email address.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              className="h-11 rounded-2xl"
            >
              Edit
            </Button>
            <Button
              type="button"
              disabled={addingStaff}
              onClick={handleConfirmAddStaff}
              className="h-11 rounded-2xl font-bold bg-primary text-white"
            >
              {addingStaff ? "Adding…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Security Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border/80 shadow-soft space-y-4">
        <h3 className="text-lg font-black text-foreground">Security & Account</h3>

        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="change-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Change Password
            </Label>
            <Input
              id="change-password"
              type="password"
              placeholder="New password (min 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 text-base rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={passwordUpdating || !newPassword}
            variant="outline"
            className="h-11 rounded-xl font-bold text-xs"
          >
            {passwordUpdating ? "Updating…" : "Update Password"}
          </Button>
        </form>

        <div className="pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="destructive"
            onClick={handleSignOut}
            className="h-11 px-5 rounded-xl font-bold gap-2 active:scale-98"
          >
            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
