export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string }

export function mapPostgresError(error: any): string {
  if (!error) return "An unexpected error occurred."
  const code = error.code || ""
  const msg = error.message || ""

  if (code === "23505") {
    if (msg.includes("staff_directory_pkey") || msg.includes("email")) {
      return "This email is already on the whitelist."
    }
    return "A duplicate record already exists."
  }
  if (code === "42501") {
    return "You don't have permission to do that."
  }
  if (code === "23503") {
    return "Referenced record could not be found."
  }
  if (code === "PGRST116") {
    return "Record not found."
  }
  if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")) {
    return "You're offline. Your changes will sync when you're back."
  }
  return msg || "Something went wrong. Please try again."
}
