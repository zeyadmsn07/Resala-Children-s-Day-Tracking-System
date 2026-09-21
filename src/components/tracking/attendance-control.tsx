"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Cancel01Icon, Time02Icon } from "@hugeicons/core-free-icons"

export type AttendanceValue = "Present" | "Absent" | "Excused" | null

type AttendanceControlProps = {
  value: AttendanceValue
  onChange: (value: AttendanceValue) => void
  disabled?: boolean
  className?: string
}

export function AttendanceControl({
  value,
  onChange,
  disabled = false,
  className = "",
}: AttendanceControlProps) {
  const options: { id: "Present" | "Absent" | "Excused"; label: string; icon: any }[] = [
    { id: "Present", label: "Present", icon: CheckmarkCircle02Icon },
    { id: "Absent", label: "Absent", icon: Cancel01Icon },
    { id: "Excused", label: "Excused", icon: Time02Icon },
  ]

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Attendance
        </label>
        <span className="text-xs font-medium text-muted-foreground">
          {value ? value : "Not marked"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border/80 h-13">
        {options.map((opt) => {
          const isSelected = value === opt.id

          let activeStyle = ""
          if (isSelected) {
            if (opt.id === "Present") {
              activeStyle = "bg-[oklch(0.72_0.19_150)] text-white shadow-xs font-bold"
            } else if (opt.id === "Absent") {
              activeStyle = "bg-[oklch(0.64_0.22_25)] text-white shadow-xs font-bold"
            } else if (opt.id === "Excused") {
              activeStyle = "bg-[oklch(0.80_0.16_85)] text-[oklch(0.25_0.10_75)] shadow-xs font-bold"
            }
          } else {
            activeStyle = "bg-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={`flex items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${activeStyle}`}
            >
              <HugeiconsIcon icon={opt.icon} className="w-4 h-4 shrink-0" strokeWidth={2.2} />
              <span className="truncate">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
