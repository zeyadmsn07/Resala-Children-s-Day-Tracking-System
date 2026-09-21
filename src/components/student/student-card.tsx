"use client"

import React from "react"
import Link from "next/link"
import { StudentAvatar } from "./avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Wifi01Icon, SmartPhone01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

export type StudentCardProps = {
  id: string
  name: string
  age?: number | null
  studentCode?: string | null
  photoUrl?: string | null
  internetAccess?: boolean | null
  phoneAccess?: boolean | null
  englishClassName?: string | null
  projectClassName?: string | null
  href?: string
  onClick?: () => void
}

export function StudentCard({
  id,
  name,
  age,
  studentCode,
  photoUrl,
  internetAccess,
  phoneAccess,
  englishClassName,
  projectClassName,
  href,
  onClick,
}: StudentCardProps) {
  const displayCode = studentCode || `S-${id.slice(0, 4).toUpperCase()}`

  const content = (
    <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-3xl bg-white border border-border/80 hover:border-primary/60 transition-all duration-200 shadow-soft hover:shadow-soft-raised active:scale-[0.98] min-h-[76px] cursor-pointer select-none">
      {/* Avatar 56px */}
      <StudentAvatar id={id} name={name} photoUrl={photoUrl} size={56} />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-foreground truncate">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {age ? `Age ${age}` : "Age —"} · {displayCode}
        </p>
        {(englishClassName || projectClassName) && (
          <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
            {[englishClassName, projectClassName].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* Right Indicator Bubbles (indicators only, not controls) */}
      <div className="flex flex-col gap-1.5 shrink-0">
        {/* Wifi indicator */}
        <div
          title={internetAccess ? "Has Internet" : "No Internet"}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            internetAccess === true
              ? "bg-[oklch(0.92_0.08_150)] text-[oklch(0.40_0.15_150)]"
              : "bg-[oklch(0.93_0.06_25)] text-[oklch(0.50_0.19_25)]"
          }`}
        >
          <HugeiconsIcon
            icon={internetAccess === true ? Wifi01Icon : Cancel01Icon}
            className="w-4 h-4"
            strokeWidth={2.2}
          />
        </div>

        {/* Phone indicator */}
        <div
          title={phoneAccess ? "Has Phone" : "No Phone"}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            phoneAccess === true
              ? "bg-[oklch(0.92_0.08_150)] text-[oklch(0.40_0.15_150)]"
              : "bg-[oklch(0.93_0.06_25)] text-[oklch(0.50_0.19_25)]"
          }`}
        >
          <HugeiconsIcon
            icon={phoneAccess === true ? SmartPhone01Icon : Cancel01Icon}
            className="w-4 h-4"
            strokeWidth={2.2}
          />
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    )
  }

  return (
    <div onClick={onClick} role={onClick ? "button" : undefined}>
      {content}
    </div>
  )
}
