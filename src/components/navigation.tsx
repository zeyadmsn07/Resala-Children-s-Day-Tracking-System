"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Don't render the navigation bar on the login screen
  const isLoginPage = pathname === "/login"

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setRole(null)
        setUserEmail(null)
        return
      }

      setUserEmail(user.email ?? null)

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (!error && data) {
        setRole(data.role)
      }
    }

    loadUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUserEmail(session.user.email ?? null)
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data }) => {
              if (data) setRole(data.role)
            })
        } else {
          setUserEmail(null)
          setRole(null)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Close mobile menu whenever pathname changes
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  if (isLoginPage) {
    return null
  }

  const canManageStaff = role === "director" || role === "head"

  const links = [
    { label: "Dashboard", href: "/" },
    { label: "Modules", href: "/modules" },
    { label: "Analytics", href: "/analytics" },
    ...(canManageStaff
      ? [{ label: "Staff Management", href: "/staff" }]
      : []),
  ]

  async function handleSignOut() {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <nav className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 py-1"
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
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-secondary hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {userEmail && (
            <div className="ml-3 flex items-center gap-2 pl-3 border-l">
              {role && (
                <Badge variant="outline" className="capitalize text-xs font-medium">
                  {role}
                </Badge>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button - 44px tap target */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-input bg-background text-foreground transition-colors hover:bg-secondary active:scale-95 md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {menuOpen && (
        <div className="border-t bg-white px-4 pt-3 pb-5 shadow-lg md:hidden animate-in fade-in-0 slide-in-from-top-2 duration-150">
          {userEmail && (
            <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs">
              <span className="truncate text-muted-foreground font-medium max-w-[200px]">
                {userEmail}
              </span>
              {role && (
                <Badge variant="outline" className="capitalize text-[11px]">
                  {role}
                </Badge>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex h-11 items-center rounded-xl px-4 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-foreground hover:bg-secondary hover:text-primary active:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            {userEmail && (
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-2 flex h-11 w-full items-center rounded-xl px-4 text-base font-medium text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
