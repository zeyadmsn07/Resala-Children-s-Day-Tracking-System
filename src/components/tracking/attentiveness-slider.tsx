"use client"

import React from "react"
import { Slider } from "@/components/ui/slider"

// 5 Inline SVG facial expressions for attentiveness bands
function FaceIcon({ band }: { band: 0 | 1 | 2 | 3 | 4 | "unset" }) {
  if (band === "unset") {
    return (
      <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0 text-muted-foreground" fill="currentColor">
        <circle cx="18" cy="18" r="16" fill="#E5E7EB" />
        <circle cx="12" cy="14" r="2" fill="#9CA3AF" />
        <circle cx="24" cy="14" r="2" fill="#9CA3AF" />
        <line x1="13" y1="23" x2="23" y2="23" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  }

  // 0: Tired (0-19)
  if (band === 0) {
    return (
      <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0 animate-in zoom-in-75 duration-150" fill="none">
        <circle cx="18" cy="18" r="16" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" />
        {/* Slanted sleepy eyes */}
        <path d="M10 16L15 14" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 16L21 14" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" />
        {/* Droopy mouth */}
        <path d="M13 25C15 22 21 22 23 25" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  // 1: Unhappy (20-39)
  if (band === 1) {
    return (
      <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0 animate-in zoom-in-75 duration-150" fill="none">
        <circle cx="18" cy="18" r="16" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.5" />
        <circle cx="12" cy="14" r="2" fill="#C2410C" />
        <circle cx="24" cy="14" r="2" fill="#C2410C" />
        <path d="M13 24C15 21 21 21 23 24" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  // 2: Neutral (40-59)
  if (band === 2) {
    return (
      <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0 animate-in zoom-in-75 duration-150" fill="none">
        <circle cx="18" cy="18" r="16" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
        <circle cx="12" cy="14" r="2" fill="#B45309" />
        <circle cx="24" cy="14" r="2" fill="#B45309" />
        <line x1="13" y1="23" x2="23" y2="23" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  // 3: Happy (60-79)
  if (band === 3) {
    return (
      <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0 animate-in zoom-in-75 duration-150" fill="none">
        <circle cx="18" cy="18" r="16" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1.5" />
        <circle cx="12" cy="14" r="2" fill="#4338CA" />
        <circle cx="24" cy="14" r="2" fill="#4338CA" />
        <path d="M12 21C14 25 22 25 24 21" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  // 4: Delighted (80-100)
  return (
    <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0 animate-in zoom-in-75 duration-150" fill="none">
      <circle cx="18" cy="18" r="16" fill="#D1FAE5" stroke="#10B981" strokeWidth="1.5" />
      {/* Smiling curved eyes */}
      <path d="M10 14C11 12 14 12 15 14" stroke="#047857" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M21 14C22 12 25 12 26 14" stroke="#047857" strokeWidth="2.2" strokeLinecap="round" />
      {/* Big open smile */}
      <path d="M11 21C13 27 23 27 25 21Z" fill="#047857" />
    </svg>
  )
}

type AttentivenessSliderProps = {
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function AttentivenessSlider({
  value,
  onChange,
  disabled = false,
  className = "",
}: AttentivenessSliderProps) {
  let band: 0 | 1 | 2 | 3 | 4 | "unset" = "unset"
  if (value !== null) {
    if (value < 20) band = 0
    else if (value < 40) band = 1
    else if (value < 60) band = 2
    else if (value < 80) band = 3
    else band = 4
  }

  const currentValue = value ?? 50

  return (
    <div className={`space-y-2 select-none ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaceIcon band={band} />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Attentiveness
            </label>
            <span className="text-xs text-muted-foreground">
              Rate from 0% to 100%
            </span>
          </div>
        </div>

        <div className="text-right">
          {value !== null ? (
            <span className="text-2xl font-black text-primary tabular-nums">
              {value}%
            </span>
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">
              Not rated
            </span>
          )}
        </div>
      </div>

      {/* Slider with touch-action: pan-y to prevent locking vertical scroll */}
      <div className="py-2.5 touch-pan-y">
        <Slider
          value={[currentValue]}
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          onValueChange={(vals) => {
            const num = Array.isArray(vals) ? vals[0] : vals
            if (typeof num === "number") {
              onChange(num)
            }
          }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-medium text-muted-foreground px-1">
        <span>Needs attention</span>
        <span>Excellent</span>
      </div>
    </div>
  )
}
