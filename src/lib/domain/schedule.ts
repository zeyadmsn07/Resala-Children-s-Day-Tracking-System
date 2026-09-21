export type ModuleDay = {
  module_number: number
  day_number: number
  session_date: string // "YYYY-MM-DD"
}

/**
 * Returns current date formatted as YYYY-MM-DD in the Africa/Cairo timezone.
 */
export function todayInCairo(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/**
 * Cairo time-based greeting (morning, afternoon, evening) as required by Section 4.2.
 */
export function getGreeting(): string {
  const hour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Cairo",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
    10
  )
  if (hour < 12) return "Good morning,"
  if (hour < 17) return "Good afternoon,"
  return "Good evening,"
}

/**
 * Determines the active day conforming to UI_SPEC-2 section 8.5.
 */
export function getActiveDay(days: ModuleDay[]): ModuleDay | null {
  if (!days || days.length === 0) return null
  const today = todayInCairo()
  const sorted = [...days].sort((a, b) => a.session_date.localeCompare(b.session_date))
  return (
    sorted.find((d) => d.session_date === today) ??
    [...sorted].reverse().find((d) => d.session_date < today) ??
    sorted[0] ??
    null
  )
}
