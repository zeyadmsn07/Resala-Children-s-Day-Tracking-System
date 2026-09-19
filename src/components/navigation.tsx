
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export function Navigation() {
  const [role, setRole] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setRole(null)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (!error && data) {
        setRole(data.role)
      }
    }

    loadRole()
  }, [])

  const canManageStaff = role === "director" || role === "head"

  const links = [
    { label: "Dashboard", href: "/" },
    { label: "Modules", href: "/modules" },
    { label: "Analytics", href: "/analytics" },
    ...(canManageStaff
      ? [{ label: "Staff Management", href: "/staff" }]
      : []),
  ]

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setMenuOpen(false)}
          aria-label="Resala Home"
        >
          <img
            src="/resala-logo.png"
            alt="Resala"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg border px-3 py-2 text-sm font-medium md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          Menu
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium hover:bg-secondary hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

