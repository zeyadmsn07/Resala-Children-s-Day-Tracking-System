/**
 * Search normalization conforming to UI_SPEC-2 section 8.6.
 * Ignores case, accents, apostrophes, hyphens, and whitespace variations.
 */
export function normalizeName(s: string): string {
  if (!s) return ""
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/['\u2019-]/g, "") // apostrophes and hyphens
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

export function matchesCode(query: string, code: string): boolean {
  if (!code || !query) return false
  const strip = (v: string) =>
    v
      .toLowerCase()
      .replace(/^s-?/, "")
      .replace(/^0+/, "")
      .trim()
  const q = strip(query)
  return q.length > 0 && strip(code).includes(q)
}

export function matchesStudent(
  query: string,
  student: { name: string; student_code?: string | null; id?: string }
): boolean {
  const q = query.trim()
  if (!q) return true
  const normQ = normalizeName(q)
  const normName = normalizeName(student.name)
  if (normName.includes(normQ)) return true

  const code = student.student_code || (student.id ? `S-${student.id.slice(0, 4)}` : "")
  return matchesCode(q, code)
}
