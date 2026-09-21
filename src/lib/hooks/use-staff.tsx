"use client"

import React, { createContext, useContext } from "react"

export type StaffUser = {
  id: string
  email: string
  fullName: string
  role: "director" | "head" | "member"
  canManageTeam: boolean
}

const StaffContext = createContext<StaffUser | null>(null)

export function StaffProvider({
  value,
  children,
}: {
  value: StaffUser
  children: React.ReactNode
}) {
  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
}

export function useStaff(): StaffUser {
  const context = useContext(StaffContext)
  if (!context) {
    throw new Error("useStaff must be used within a StaffProvider")
  }
  return context
}
