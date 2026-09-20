"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { updateSession } from "../actions/update-session"

type SessionState = {
  attendance: string
  attentiveness: number
  behaviorPoints: number
}

const attendanceOptions = [
  "Present",
  "Absent",
  "Late",
]

const createInitialSessions = () => {
  const sessions: Record<string, SessionState> = {}

  for (let day = 1; day <= 4; day++) {
    for (let session = 1; session <= 4; session++) {
      sessions[`${day}-${session}`] = {
        attendance: "Present",
        attentiveness: 70,
        behaviorPoints: 0,
      }
    }
  }

  return sessions
}

export default function ModuleTrackingPage() {
  const params = useParams()
  const moduleId = Number(params.moduleId)

  const [sessions, setSessions] = useState(createInitialSessions)
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout)
    }
  }, [])

  function scheduleSave(
    day: number,
    sessionNumber: number,
    state: SessionState
  ) {
    const key = `${day}-${sessionNumber}`

    if (timers.current[key]) {
      clearTimeout(timers.current[key])
    }

    timers.current[key] = setTimeout(async () => {
      try {
        await updateSession({
          moduleId,
          day,
          sessionNumber,
          attendance: state.attendance,
          attentiveness: state.attentiveness,
          behaviorPoints: state.behaviorPoints,
        })
      } catch (error) {
        console.error("Failed to save session:", error)
      }
    }, 600)
  }

  function updateSessionState(
    day: number,
    sessionNumber: number,
    changes: Partial<SessionState>
  ) {
    const key = `${day}-${sessionNumber}`

    setSessions((current) => {
      const updatedState = {
        ...current[key],
        ...changes,
      }

      const updated = {
        ...current,
        [key]: updatedState,
      }

      scheduleSave(day, sessionNumber, updatedState)

      return updated
    })
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/modules"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-secondary active:bg-secondary"
          >
            ← All Modules
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Academic Modules
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Module {moduleId}
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Track attendance, attentiveness, and behavior across all sessions.
          </p>
        </div>

        <Tabs defaultValue="day-1">
          <TabsList className="grid w-full grid-cols-4 h-11 sm:h-10">
            {[1, 2, 3, 4].map((day) => (
              <TabsTrigger key={day} value={`day-${day}`} className="text-sm font-semibold py-2">
                Day {day}
              </TabsTrigger>
            ))}
          </TabsList>

          {[1, 2, 3, 4].map((day) => (
            <TabsContent
              key={day}
              value={`day-${day}`}
              className="mt-5 space-y-4"
            >
              {[
                1,
                2,
                3,
                4,
              ].map((sessionNumber) => {
                const key = `${day}-${sessionNumber}`
                const session = sessions[key]

                return (
                  <Card key={key} className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base sm:text-lg font-semibold">
                          Session {sessionNumber}
                        </CardTitle>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                          Day {day}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">

                      {/* Attendance */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">
                          Attendance
                        </label>

                        <Select
                          value={session.attendance}
                          onValueChange={(value) =>
                            updateSessionState(day, sessionNumber, {
                              attendance: value ?? "Present",
                            })
                          }
                        >
                          <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
                            <SelectValue placeholder="Select attendance" />
                          </SelectTrigger>

                          <SelectContent>
                            {attendanceOptions.map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Attentiveness */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Attentiveness
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Rate from 0 to 100
                            </p>
                          </div>

                          <span className="text-2xl font-bold text-primary font-mono">
                            {session.attentiveness}%
                          </span>
                        </div>

                        <div className="py-2">
                          <Slider
                            value={[session.attentiveness]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => {
                              const newValue = Array.isArray(value)
                                ? value[0]
                                : value

                              if (typeof newValue === "number") {
                                updateSessionState(
                                  day,
                                  sessionNumber,
                                  {
                                    attentiveness: newValue,
                                  }
                                )
                              }
                            }}
                          />
                        </div>

                        <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                          <span>Needs attention</span>
                          <span>Excellent</span>
                        </div>
                      </div>

                      {/* Behavior */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Behavior Points
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Positive and negative behavior
                            </p>
                          </div>

                          <span className="text-2xl font-bold text-primary font-mono">
                            {session.behaviorPoints > 0 ? `+${session.behaviorPoints}` : session.behaviorPoints}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            className="behavior-point h-12 text-lg font-bold shadow-xs active:scale-95"
                            onClick={() =>
                              updateSessionState(
                                day,
                                sessionNumber,
                                {
                                  behaviorPoints:
                                    session.behaviorPoints + 1,
                                }
                              )
                            }
                          >
                            +1
                          </Button>

                          <Button
                            type="button"
                            className="behavior-point h-12 text-lg font-bold shadow-xs active:scale-95"
                            onClick={() =>
                              updateSessionState(
                                day,
                                sessionNumber,
                                {
                                  behaviorPoints:
                                    session.behaviorPoints - 1,
                                }
                              )
                            }
                          >
                            -1
                          </Button>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  )
}