"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon, CloudIcon } from "@hugeicons/core-free-icons"

type BehaviorCounterProps = {
  positiveCount?: number
  negativeCount?: number
  // or net points:
  netPoints?: number
  onChange: (counts: { positive: number; negative: number; net: number }) => void
  disabled?: boolean
  className?: string
}

export function BehaviorCounter({
  positiveCount = 0,
  negativeCount = 0,
  netPoints,
  onChange,
  disabled = false,
  className = "",
}: BehaviorCounterProps) {
  // If netPoints was provided and separate counts aren't tracking, infer
  const pos = positiveCount
  const neg = negativeCount

  const [animatingPlus, setAnimatingPlus] = useState(false)
  const [animatingMinus, setAnimatingMinus] = useState(false)

  function handleIncrement() {
    if (disabled) return
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10)
      } catch {
        // Safe ignore
      }
    }
    setAnimatingPlus(true)
    setTimeout(() => setAnimatingPlus(false), 600)

    const nextPos = pos + 1
    onChange({
      positive: nextPos,
      negative: neg,
      net: nextPos - neg,
    })
  }

  function handleDecrement() {
    if (disabled) return
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(20)
      } catch {
        // Safe ignore
      }
    }
    setAnimatingMinus(true)
    setTimeout(() => setAnimatingMinus(false), 500)

    const nextNeg = neg + 1
    onChange({
      positive: pos,
      negative: nextNeg,
      net: pos - nextNeg,
    })
  }

  function handleUndoPositive(e: React.MouseEvent) {
    e.stopPropagation()
    if (pos <= 0 || disabled) return
    const nextPos = pos - 1
    onChange({
      positive: nextPos,
      negative: neg,
      net: nextPos - neg,
    })
  }

  function handleUndoNegative(e: React.MouseEvent) {
    e.stopPropagation()
    if (neg <= 0 || disabled) return
    const nextNeg = neg - 1
    onChange({
      positive: pos,
      negative: nextNeg,
      net: pos - nextNeg,
    })
  }

  return (
    <div className={`space-y-2 select-none ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Behavior Points
        </label>
        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <span>Net:</span>
          <span className={`font-black font-mono text-sm ${
            pos - neg > 0 ? "text-[oklch(0.50_0.15_150)]" : pos - neg < 0 ? "text-[oklch(0.50_0.19_25)]" : "text-muted-foreground"
          }`}>
            {pos - neg > 0 ? `+${pos - neg}` : pos - neg}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* +1 Button (Section 7.8: filled green with white star) */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={handleIncrement}
            className={`w-full min-h-[96px] rounded-2xl p-3 flex flex-col justify-between items-start bg-[oklch(0.72_0.19_150)] text-white shadow-soft transition-all duration-200 active:scale-92 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              animatingPlus ? "scale-95" : ""
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <HugeiconsIcon icon={StarIcon} className="w-6 h-6 text-white" strokeWidth={2.2} />
              <span className="text-xs font-black bg-white/25 px-2 py-0.5 rounded-full backdrop-blur-xs">
                x{pos}
              </span>
            </div>

            <div className="mt-1">
              <span className="block text-2xl font-black tracking-tight leading-none">
                +1
              </span>
              <span className="block text-[11px] font-semibold text-white/90 mt-0.5">
                Great work
              </span>
            </div>
          </button>

          {/* Floating reward animation */}
          {animatingPlus && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none z-20">
              <span className="flex items-center gap-1 text-base font-black text-amber-300 drop-shadow-md animate-float-up bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                <HugeiconsIcon icon={StarIcon} className="w-4 h-4 fill-amber-300" />
                <span>+1</span>
              </span>
            </div>
          )}

          {pos > 0 && (
            <button
              type="button"
              onClick={handleUndoPositive}
              className="mt-1 text-[11px] text-muted-foreground hover:text-foreground underline block w-full text-center py-0.5"
            >
              Undo +1
            </button>
          )}
        </div>

        {/* -1 Button (Section 7.8: soft red with cloud) */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={handleDecrement}
            className={`w-full min-h-[96px] rounded-2xl p-3 flex flex-col justify-between items-start bg-[oklch(0.95_0.04_25)] border-2 border-[oklch(0.64_0.22_25)] text-[oklch(0.50_0.19_25)] shadow-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              animatingMinus ? "translate-x-1" : ""
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <HugeiconsIcon icon={CloudIcon} className="w-6 h-6 text-[oklch(0.50_0.19_25)]" strokeWidth={2.2} />
              <span className="text-xs font-black bg-[oklch(0.64_0.22_25)]/15 px-2 py-0.5 rounded-full">
                x{neg}
              </span>
            </div>

            <div className="mt-1">
              <span className="block text-2xl font-black tracking-tight leading-none text-[oklch(0.50_0.19_25)]">
                -1
              </span>
              <span className="block text-[11px] font-semibold text-[oklch(0.50_0.19_25)]/85 mt-0.5">
                Needs a talk
              </span>
            </div>
          </button>

          {/* Floating minus animation */}
          {animatingMinus && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-20">
              <span className="text-lg font-black text-red-500 drop-shadow-md animate-float-down inline-block">
                -1
              </span>
            </div>
          )}

          {neg > 0 && (
            <button
              type="button"
              onClick={handleUndoNegative}
              className="mt-1 text-[11px] text-muted-foreground hover:text-foreground underline block w-full text-center py-0.5"
            >
              Undo -1
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
