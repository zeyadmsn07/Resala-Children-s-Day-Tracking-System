"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Wifi01Icon, SmartPhone01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

type BubbleToggleProps = {
  type: "internet" | "phone"
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function BubbleToggle({
  type,
  checked,
  onChange,
  disabled = false,
  className = "",
}: BubbleToggleProps) {
  const isInternet = type === "internet"
  const label = isInternet ? "Internet access" : "Phone access"
  const onText = isInternet ? "Has internet access" : "Has phone access"
  const offText = isInternet ? "No internet access" : "No phone access"

  function handleToggle() {
    if (disabled) return
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15)
      } catch {
        // Safe ignore
      }
    }
    onChange(!checked)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={handleToggle}
      className={`relative min-h-[96px] w-full rounded-2xl p-4 flex items-center gap-3.5 text-left border-2 transition-all duration-300 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-primary/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
        checked
          ? "bg-[oklch(0.96_0.05_150)] border-[oklch(0.72_0.19_150)]"
          : "bg-[oklch(0.95_0.04_25)] border-[oklch(0.64_0.22_25)]"
      } ${className}`}
    >
      {/* Indicator Disc */}
      <div
        className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs ${
          checked ? "bg-[oklch(0.72_0.19_150)]" : "bg-[oklch(0.64_0.22_25)]"
        }`}
      >
        {checked ? (
          <HugeiconsIcon
            icon={isInternet ? Wifi01Icon : SmartPhone01Icon}
            className="w-7 h-7 text-white"
            strokeWidth={2.5}
          />
        ) : (
          <HugeiconsIcon
            icon={Cancel01Icon}
            className="w-7 h-7 text-white"
            strokeWidth={2.5}
          />
        )}
      </div>

      {/* Label and State Text */}
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={`block text-base font-bold mt-0.5 transition-colors ${
            checked
              ? "text-[oklch(0.40_0.15_150)]"
              : "text-[oklch(0.48_0.19_25)]"
          }`}
        >
          {checked ? onText : offText}
        </span>
      </div>
    </button>
  )
}
