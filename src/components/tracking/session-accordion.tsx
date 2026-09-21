"use client"

import React, { useState } from "react"
import { AttendanceControl, AttendanceValue } from "./attendance-control"
import { AttentivenessSlider } from "./attentiveness-slider"
import { BehaviorCounter } from "./behavior-counter"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowUp01Icon, CheckmarkCircle02Icon, Cancel01Icon, Time02Icon } from "@hugeicons/core-free-icons"

export type SessionData = {
  attendance: AttendanceValue
  attentiveness: number | null
  behaviorPoints: number
  positivePoints?: number
  negativePoints?: number
  // Fun Day questions
  funDayFollowedInstructions?: boolean | null
  funDayPlayedWellWithOthers?: boolean | null
  funDayStayedEngaged?: boolean | null
}

export type SlotInfo = {
  sessionNumber: number
  track: "English" | "Project"
  title: string
}

type SessionAccordionProps = {
  slots?: SlotInfo[]
  sessionsData: Record<number, SessionData>
  onChangeSession: (sessionNumber: number, data: Partial<SessionData>) => void
  hasEnglishClass?: boolean
  hasProjectClass?: boolean
  onAssignClassPrompt?: (track: "English" | "Project") => void
  className?: string
}

const DEFAULT_SLOTS: SlotInfo[] = [
  { sessionNumber: 1, track: "English", title: "English Class" },
  { sessionNumber: 2, track: "Project", title: "Skills Class" },
  { sessionNumber: 3, track: "Project", title: "Skills Class" },
  { sessionNumber: 4, track: "Project", title: "Fun Day" },
]

export function SessionAccordion({
  slots = DEFAULT_SLOTS,
  sessionsData,
  onChangeSession,
  hasEnglishClass = true,
  hasProjectClass = true,
  onAssignClassPrompt,
  className = "",
}: SessionAccordionProps) {
  // Default open first session with no data
  const [openSession, setOpenSession] = useState<number>(() => {
    const firstUnmarked = slots.find((s) => !sessionsData[s.sessionNumber]?.attendance)
    return firstUnmarked ? firstUnmarked.sessionNumber : 1
  })

  return (
    <div className={`space-y-3 ${className}`}>
      {slots.map((slot) => {
        const isOpen = openSession === slot.sessionNumber
        const isEnglish = slot.track === "English"
        const hasClass = isEnglish ? hasEnglishClass : hasProjectClass
        const session = sessionsData[slot.sessionNumber] || {
          attendance: null,
          attentiveness: null,
          behaviorPoints: 0,
        }

        const isFunDay = slot.sessionNumber === 4

        // Collapsed Summary
        const isPresent = session.attendance === "Present"
        const isAbsent = session.attendance === "Absent"
        const isExcused = session.attendance === "Excused"

        return (
          <div
            key={slot.sessionNumber}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "bg-card border-primary/30 shadow-soft ring-1 ring-primary/20"
                : "bg-card/70 border-border/80 hover:border-border shadow-2xs"
            }`}
          >
            {/* Header / Accordion trigger */}
            <button
              type="button"
              onClick={() => setOpenSession(isOpen ? 0 : slot.sessionNumber)}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors active:bg-muted/40"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base font-bold text-foreground">
                  Session {slot.sessionNumber}
                </span>

                {/* Track Badge (Section 4.5: blue for English, orange for Skills) */}
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isEnglish
                      ? "bg-[oklch(0.96_0.02_255)] text-primary border border-primary/20"
                      : "bg-[oklch(0.96_0.05_60)] text-[oklch(0.68_0.20_55)] border border-[oklch(0.68_0.20_55)]/20"
                  }`}
                >
                  {slot.title}
                </span>
              </div>

              {/* Collapsed summary status */}
              <div className="flex items-center gap-3 shrink-0">
                {!isOpen && (
                  <div className="flex items-center gap-2 text-xs">
                    {isPresent && (
                      <span className="flex items-center gap-1 text-[oklch(0.50_0.15_150)] font-bold">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3.5 h-3.5" /> Present
                      </span>
                    )}
                    {isAbsent && (
                      <span className="flex items-center gap-1 text-[oklch(0.50_0.19_25)] font-bold">
                        <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" /> Absent
                      </span>
                    )}
                    {isExcused && (
                      <span className="flex items-center gap-1 text-[oklch(0.52_0.12_75)] font-bold">
                        <HugeiconsIcon icon={Time02Icon} className="w-3.5 h-3.5" /> Excused
                      </span>
                    )}
                    {session.attentiveness !== null && (
                      <span className="font-semibold text-primary">
                        {session.attentiveness}%
                      </span>
                    )}
                    {session.behaviorPoints !== 0 && (
                      <span
                        className={`font-bold font-mono ${
                          session.behaviorPoints > 0
                            ? "text-[oklch(0.50_0.15_150)]"
                            : "text-[oklch(0.50_0.19_25)]"
                        }`}
                      >
                        {session.behaviorPoints > 0
                          ? `+${session.behaviorPoints}`
                          : session.behaviorPoints}
                      </span>
                    )}
                  </div>
                )}

                <HugeiconsIcon
                  icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
                  className="w-4 h-4 text-muted-foreground"
                  strokeWidth={2.2}
                />
              </div>
            </button>

            {/* Expanded Body */}
            {isOpen && (
              <div className="px-4 pb-5 pt-1 border-t border-border/50 space-y-6">
                {!hasClass ? (
                  <div className="p-4 rounded-xl bg-muted/60 text-center space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      No {isEnglish ? "English" : "Skills"} class assigned to this student.
                    </p>
                    {onAssignClassPrompt && (
                      <button
                        type="button"
                        onClick={() => onAssignClassPrompt(slot.track)}
                        className="text-xs font-bold text-primary underline"
                      >
                        Assign a class now
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Attendance */}
                    <AttendanceControl
                      value={session.attendance}
                      onChange={(attendance) =>
                        onChangeSession(slot.sessionNumber, { attendance })
                      }
                    />

                    {/* Attentiveness */}
                    <AttentivenessSlider
                      value={session.attentiveness}
                      onChange={(attentiveness) =>
                        onChangeSession(slot.sessionNumber, { attentiveness })
                      }
                    />

                    {/* Behavior */}
                    <BehaviorCounter
                      positiveCount={session.positivePoints ?? Math.max(0, session.behaviorPoints)}
                      negativeCount={session.negativePoints ?? Math.max(0, -session.behaviorPoints)}
                      onChange={({ positive, negative, net }) =>
                        onChangeSession(slot.sessionNumber, {
                          behaviorPoints: net,
                          positivePoints: positive,
                          negativePoints: negative,
                        })
                      }
                    />

                    {/* Fun Day (Session 4) Behavior Questions */}
                    {isFunDay && (
                      <div className="pt-2 border-t border-border/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[oklch(0.68_0.20_55)]">
                            Fun Day Activity Conduct
                          </h4>
                          <span className="text-[11px] text-muted-foreground">
                            Optional observation
                          </span>
                        </div>

                        {[
                          {
                            key: "funDayFollowedInstructions",
                            label: "Followed instructions well",
                            value: session.funDayFollowedInstructions,
                          },
                          {
                            key: "funDayPlayedWellWithOthers",
                            label: "Played well with others",
                            value: session.funDayPlayedWellWithOthers,
                          },
                          {
                            key: "funDayStayedEngaged",
                            label: "Stayed engaged in the activity",
                            value: session.funDayStayedEngaged,
                          },
                        ].map((q) => (
                          <div
                            key={q.key}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/40"
                          >
                            <span className="text-xs sm:text-sm font-medium text-foreground">
                              {q.label}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  onChangeSession(slot.sessionNumber, {
                                    [q.key]: q.value === true ? null : true,
                                  })
                                }
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                                  q.value === true
                                    ? "bg-[oklch(0.72_0.19_150)] text-white"
                                    : "bg-background text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onChangeSession(slot.sessionNumber, {
                                    [q.key]: q.value === false ? null : false,
                                  })
                                }
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                                  q.value === false
                                    ? "bg-[oklch(0.64_0.22_25)] text-white"
                                    : "bg-background text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
