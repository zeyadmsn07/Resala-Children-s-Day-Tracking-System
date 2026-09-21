"use client"

import React from "react"

export type DayStatus = "empty" | "half" | "full"

type DayChipsProps = {
  activeDay: number
  onSelectDay: (day: number) => void
  dayDates?: Record<number, string> // e.g. { 1: "26 Sep", 2: "3 Oct" }
  todayDayNumber?: number | null
  dayStatuses?: Record<number, DayStatus>
  className?: string
}

export function DayChips({
  activeDay,
  onSelectDay,
  dayDates = {},
  todayDayNumber,
  dayStatuses = {},
  className = "",
}: DayChipsProps) {
  const days = [1, 2, 3, 4]

  return (
    <div className={`grid grid-cols-4 gap-2 w-full select-none ${className}`}>
      {days.map((day) => {
        const isActive = activeDay === day
        const isToday = todayDayNumber === day
        const status = dayStatuses[day] ?? "empty"
        const dateStr = dayDates[day]

        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDay(day)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-95 ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                : "bg-card text-foreground border-border/80 hover:bg-secondary hover:text-primary"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold">Day {day}</span>
              {/* Status Dot */}
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive
                    ? "bg-white"
                    : status === "full"
                    ? "bg-[oklch(0.72_0.19_150)]"
                    : status === "half"
                    ? "bg-[oklch(0.80_0.16_85)]"
                    : "bg-muted-foreground/30"
                }`}
              />
            </div>

            {dateStr && (
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {dateStr}
              </span>
            )}

            {isToday && (
              <span
                className={`text-[9px] uppercase tracking-wider font-extrabold px-1 rounded-full mt-0.5 ${
                  isActive
                    ? "bg-white text-primary"
                    : "bg-primary/10 text-primary"
                }`}
              >
                Today
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
