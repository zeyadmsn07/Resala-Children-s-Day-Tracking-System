"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useStaff } from "@/lib/hooks/use-staff"
import { StudentAvatar } from "@/components/student/avatar"
import { supabase } from "@/lib/supabase"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  UserGroupIcon,
  Analytics01Icon,
  UserIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const staff = useStaff()

  const links = [
    { label: "Home", href: "/", icon: Home01Icon, match: (p: string) => p === "/" },
    {
      label: "Students",
      href: "/students",
      icon: UserGroupIcon,
      match: (p: string) => p === "/students" || p.startsWith("/students/"),
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

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 h-[calc(100dvh-2rem)] sticky top-4 my-4 ml-4 rounded-3xl bg-white border border-border/80 shadow-soft p-5 z-30 shrink-0">
      {/* Top: Logo & Nav Links */}
      <div className="space-y-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1">
          <img
            src="/resala-logo.png"
            alt="Resala"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Nav Links */}
        <nav className="space-y-1.5 pt-2">
          {links.map((link) => {
            const isActive = link.match(pathname)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-soft"
                    : "text-muted-foreground hover:bg-secondary hover:text-primary active:scale-98"
                }`}
              >
                <HugeiconsIcon
                  icon={link.icon}
                  className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom: Tagline, User Card & Sign out */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        {/* Tagline per Section 3.2 */}
        <div className="px-2">
          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic">
            &ldquo;Every child. Every session. Every step forward.&rdquo;
          </p>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-muted/40 border border-border/40">
          <StudentAvatar
            id={staff.id}
            name={staff.fullName}
            size={40}
            role={staff.role}
          />
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-foreground truncate">
              {staff.fullName}
            </span>
            <span className="block text-[10px] uppercase font-bold text-primary tracking-wider">
              {staff.role}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
