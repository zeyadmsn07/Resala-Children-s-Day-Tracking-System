"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Loading03Icon, CloudOffIcon, Alert02Icon } from "@hugeicons/core-free-icons"

export type SaveState = "saved" | "saving" | "offline" | "failed"

type SaveStatusProps = {
  status: SaveState
  onRetry?: () => void
  className?: string
}

export function SaveStatus({ status, onRetry, className = "" }: SaveStatusProps) {
  return (
    <div
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${className} ${
        status === "saved"
          ? "bg-muted text-muted-foreground"
          : status === "saving"
          ? "bg-primary/10 text-primary"
          : status === "offline"
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-700 cursor-pointer hover:bg-red-200"
      }`}
      onClick={status === "failed" ? onRetry : undefined}
      role={status === "failed" ? "button" : undefined}
    >
      {status === "saved" && (
        <>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Saved</span>
        </>
      )}

      {status === "saving" && (
        <>
          <HugeiconsIcon icon={Loading03Icon} className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
          <span>Saving</span>
        </>
      )}

      {status === "offline" && (
        <>
          <HugeiconsIcon icon={CloudOffIcon} className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Offline, will sync</span>
        </>
      )}

      {status === "failed" && (
        <>
          <HugeiconsIcon icon={Alert02Icon} className="w-3.5 h-3.5 text-destructive" strokeWidth={2} />
          <span>Not saved. Tap to retry</span>
        </>
      )}
    </div>
  )
}
