import Link from "next/link"

export default function ModuleStudentNotFound() {
  return (
    <div className="p-8 text-center space-y-4">
      <p>Student not found.</p>
      <Link
        href="/students"
        className="inline-flex items-center justify-center rounded-4xl bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 text-sm font-medium transition-all"
      >
        Back to Students
      </Link>
    </div>
  )
}