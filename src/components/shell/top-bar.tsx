"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { StudentAvatar } from "@/components/student/avatar"
import { useStaff } from "@/lib/hooks/use-staff"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

type TopBarProps = {
  title?: string
  showBack?: boolean
  backHref?: string
}

export function TopBar({ title, showBack, backHref }: TopBarProps) {
  const staff = useStaff()
  const router = useRouter()
  const pathname = usePathname()

  // Determine title from pathname if not provided
  let displayTitle = title
  if (!displayTitle) {
    if (pathname === "/") displayTitle = "Home"
    else if (pathname.startsWith("/students") && pathname !== "/students") displayTitle = "Student Profile"
    else if (pathname === "/students") displayTitle = "Students"
    else if (pathname.startsWith("/classes")) displayTitle = "Class Roster"
    else if (pathname === "/analytics") displayTitle = "Analytics"
    else if (pathname === "/profile") displayTitle = "Profile"
    else displayTitle = "Children's Day"
  }

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-md border-b border-border/70 px-4 flex items-center justify-between md:hidden">
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack ? (
          <button
            type="button"
            onClick={() => (backHref ? router.push(backHref) : router.back())}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground hover:bg-secondary active:scale-95 transition-colors -ml-1 cursor-pointer"
            aria-label="Go back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" strokeWidth={2.2} />
          </button>
        ) : (
          <Link href="/" className="shrink-0 flex items-center">
            <img
              src="/resala-logo.png"
              alt="Resala"
              className="h-8 w-auto object-contain"
            />
          </Link>
        )}

        <h1 className="text-base font-bold text-foreground truncate">
          {displayTitle}
        </h1>
      </div>

      {/* User avatar on right -> opens /profile */}
      <Link
        href="/profile"
        className="shrink-0 rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="My Profile"
      >
        <StudentAvatar
          id={staff.id}
          name={staff.fullName}
          size={32}
          role={staff.role}
        />
      </Link>
    </header>
  )
}
