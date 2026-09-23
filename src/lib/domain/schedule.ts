export type ModuleDay = {
  module_number: number
  day_number: number
  session_date: string // "YYYY-MM-DD"
}


export function todayInCairo(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}


export function getUpcomingSaturday(now = new Date()): string {
  const d = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }))
  const day = d.getDay()
  const diff = day === 6 ? 0 : 6 - day
  d.setDate(d.getDate() + diff)
  return todayInCairo(d)
}

/**
 * Calculates the exact date of the previous Saturday
 */
export function getPreviousSaturday(now = new Date()): string {
  const d = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }))
  const day = d.getDay()
  const diff = day === 6 ? 7 : day + 1 
  d.setDate(d.getDate() - diff)
  return todayInCairo(d)
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