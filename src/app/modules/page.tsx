import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const modules = [
  { id: 1, title: "Module 1" },
  { id: 2, title: "Module 2" },
  { id: 3, title: "Module 3" },
  { id: 4, title: "Module 4" },
]

export default function ModulesPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Modules
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a module to view and track its sessions.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {modules.map((module) => (
            <Link key={module.id} href={`/modules/${module.id}`}>
              <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <CardTitle>{module.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View module sessions and child progress.
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}