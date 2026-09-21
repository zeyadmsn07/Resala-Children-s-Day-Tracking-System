"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  UserGroupIcon,
  Analytics01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

export function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { label: "Home", href: "/", icon: Home01Icon, match: (p: string) => p === "/" },
    {
      label: "Students",
      href: "/students",
      icon: UserGroupIcon,
      match: (p: string) => p === "/students" || (p.startsWith("/students/") && !p.includes("/modules/")),
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: Analytics01Icon,
      match: (p: string) => p.startsWith("/analytics"),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: UserIcon,
      match: (p: string) => p.startsWith("/profile") || p.startsWith("/staff"),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border/80 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {/* Icon with filled pill behind when active */}
              <div
                className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
                  isActive ? "bg-primary/15" : "bg-transparent"
                }`}
              >
                <HugeiconsIcon
                  icon={tab.icon}
                  className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
