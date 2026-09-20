"use client"

import { useEffect, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

type PerformanceRow = {
  day: number | null
  session_number: number | null
  overall_grade: number | null
  attentiveness: number | null
  total_behavior_points: number | null
}

export default function AnalyticsPage() {
  const [students, setStudents] = useState<PerformanceRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPerformance() {
      const { data } = await supabase
        .from("student_performance_summary")
        .select(
          "day, session_number, overall_grade, attentiveness, total_behavior_points"
        )

      setStudents(data ?? [])
      setLoading(false)
    }

    fetchPerformance()
  }, [])

  const sessionTrend = [1, 2, 3, 4].map((session) => {
    const values = students
      .filter((student) => student.session_number === session)
      .map((student) => student.attentiveness)
      .filter((value): value is number => value !== null)

    return {
      session: `Session ${session}`,
      attentiveness:
        values.length > 0
          ? values.reduce((sum, value) => sum + value, 0) /
            values.length
          : 0,
    }
  })

  const dailyTrend = [1, 2, 3, 4].map((day) => {
    const values = students
      .filter((student) => student.day === day)
      .map((student) => student.overall_grade)
      .filter((value): value is number => value !== null)

    return {
      day: `Day ${day}`,
      average:
        values.length > 0
          ? values.reduce((sum, value) => sum + value, 0) /
            values.length
          : 0,
    }
  })

  const grades = students
    .map((student) => student.overall_grade)
    .filter((value): value is number => value !== null)

  const attentiveness = students
    .map((student) => student.attentiveness)
    .filter((value): value is number => value !== null)

  const highestOverallGrade =
    grades.length > 0 ? Math.max(...grades) : null

  const lowestAttentiveness =
    attentiveness.length > 0
      ? Math.min(...attentiveness)
      : null

  const programAverage =
    grades.length > 0
      ? grades.reduce((sum, grade) => sum + grade, 0) /
        grades.length
      : null

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">

        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Program performance and student tracking metrics.
          </p>
        </div>

        {/* Top-Level Metrics */}
        <div className="mb-6 grid gap-5 sm:grid-cols-3">

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Highest Overall Grade
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {loading
                  ? "..."
                  : highestOverallGrade !== null
                    ? highestOverallGrade.toFixed(1)
                    : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lowest Attentiveness
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {loading
                  ? "..."
                  : lowestAttentiveness !== null
                    ? lowestAttentiveness.toFixed(1)
                    : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Program Average
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {loading
                  ? "..."
                  : programAverage !== null
                    ? programAverage.toFixed(1)
                    : "—"}
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Within-Day Trend */}
        <Card className="mb-6 border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Average Attentiveness by Session
            </CardTitle>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Sessions 1 through 4
            </p>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-[260px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="session" tick={{ fontSize: 11 }} />

                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `${value}%`}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(1)}%`,
                      "Attentiveness",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="attentiveness"
                    stroke="#253487"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Week-over-Week Trend */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Daily Assignment Averages
            </CardTitle>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Days 1 through 4
            </p>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-[260px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />

                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `${value}`}
                  />

                  <Tooltip
                    formatter={(value) => [
                      Number(value).toFixed(1),
                      "Daily Average",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#253487"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}