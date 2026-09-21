"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { TopBar } from "./top-bar"
import { BottomNav } from "./bottom-nav"
import { Sidebar } from "./sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Task screens hide the bottom nav on mobile per Section 3.2
  const isTaskScreen =
    pathname.includes("/modules/") || pathname.includes("/roll-call")

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <TopBar showBack={isTaskScreen} />

        {/* Single Main Element - Pages must not render their own <main> */}
        <main
          className={`flex-1 w-full max-w-6xl mx-auto px-4 py-4 md:px-8 md:py-8 ${
            !isTaskScreen ? "pb-24 md:pb-8" : "pb-8"
          }`}
        >
          {children}
        </main>

        {/* Mobile Bottom Tab Bar */}
        {!isTaskScreen && <BottomNav />}
      </div>
    </div>
  )
}
