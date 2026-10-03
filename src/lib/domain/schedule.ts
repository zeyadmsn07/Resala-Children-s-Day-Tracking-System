export type ModuleDay = {
  module_number: number
  day_number: number
  session_date: string // "YYYY-MM-DD"
}

export type ActiveContext = ModuleDay & {
  /** true when the date is not an assigned session day (snapshot mode) */
  isReadOnly: boolean
}

/**
 * Fixed anchor for the default schedule. Module 1 Day 1 was Saturday 19 Sep 2026,
 * so Day 2 = 26 Sep and Day 3 = 3 Oct. Every Saturday after that advances one day.
 * Real rows in the module_days table always take priority over this default.
 */
export const MODULE_1_DAY_1_DATE = "2026-09-19"
export const DAYS_PER_MODULE = 4
export const TOTAL_MODULES = 4

/** Adds whole days to a "YYYY-MM-DD" string without any timezone drift. */
function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/** 0 = Sunday ... 6 = Saturday, for a "YYYY-MM-DD" string. */
function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function todayInCairo(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/** The Saturday on or after today (Cairo time). */
export function getUpcomingSaturday(now = new Date()): string {
  const today = todayInCairo(now)
  const diff = (6 - weekdayOf(today) + 7) % 7
  return addDays(today, diff)
}

/** The Saturday strictly before today (Cairo time). */
export function getPreviousSaturday(now = new Date()): string {
  const today = todayInCairo(now)
  const wd = weekdayOf(today)
  const diff = wd === 6 ? 7 : wd + 1
  return addDays(today, -diff)
}

/**
 * Default weekly schedule built from the fixed anchor:
 * 4 days per module, one Saturday per day, for TOTAL_MODULES modules.
 */
export function buildDefaultSchedule(): ModuleDay[] {
  const days: ModuleDay[] = []
  for (let i = 0; i < DAYS_PER_MODULE * TOTAL_MODULES; i++) {
    days.push({
      module_number: Math.floor(i / DAYS_PER_MODULE) + 1,
      day_number: (i % DAYS_PER_MODULE) + 1,
      session_date: addDays(MODULE_1_DAY_1_DATE, i * 7),
    })
  }
  return days
}

/**
 * Merges the database schedule with the default one. Database rows win.
 * A default row is dropped if the database already has the same module/day
 * or already uses the same date.
 */
export function mergeSchedules(fromDb: ModuleDay[], fallback: ModuleDay[]): ModuleDay[] {
  const keys = new Set(fromDb.map((d) => `${d.module_number}-${d.day_number}`))
  const dates = new Set(fromDb.map((d) => d.session_date))
  const extra = fallback.filter(
    (d) => !keys.has(`${d.module_number}-${d.day_number}`) && !dates.has(d.session_date)
  )
  return [...fromDb, ...extra].sort((a, b) => a.session_date.localeCompare(b.session_date))
}

/**
 * Decides which module/day the roll call shows for a given date.
 * - Today is an assigned day: that day, editable.
 * - Otherwise: the most recent assigned day before today, read-only snapshot.
 */
export function resolveActiveContext(
  days: ModuleDay[],
  today: string = todayInCairo()
): ActiveContext | null {
  if (!days || days.length === 0) return null
  const sorted = [...days].sort((a, b) => a.session_date.localeCompare(b.session_date))

  const assigned = sorted.find((d) => d.session_date === today)
  if (assigned) return { ...assigned, isReadOnly: false }

  const previous = [...sorted].reverse().find((d) => d.session_date < today)
  return { ...(previous ?? sorted[0]), isReadOnly: true }
}

export function getActiveDay(days: ModuleDay[], today: string = todayInCairo()): ModuleDay | null {
  const ctx = resolveActiveContext(days, today)
  if (!ctx) return null
  return {
    module_number: ctx.module_number,
    day_number: ctx.day_number,
    session_date: ctx.session_date,
  }
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
