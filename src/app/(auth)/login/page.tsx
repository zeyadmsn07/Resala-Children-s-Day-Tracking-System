"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { loginAction, signUpAction } from "./actions"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [whitelistError, setWhitelistError] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await loginAction(loginEmail, loginPassword)
      if (result?.error) {
        toast.add({
          title: "Login Failed",
          description: result.error,
          type: "error",
        })
      }
    } catch {
      // NEXT_REDIRECT throws intentionally
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setWhitelistError(null)
    setLoading(true)

    try {
      const result = await signUpAction(signUpEmail, signUpPassword)
      if (result?.error) {
        if (result.error.includes("Invalidated email")) {
          setWhitelistError(result.error)
        }
        toast.add({
          title: "Sign Up Failed",
          description: result.error,
          type: "error",
        })
      }
    } catch {
      // NEXT_REDIRECT throws intentionally
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center text-center">
          <img
            src="/resala-logo.png"
            alt="Resala"
            className="h-14 w-auto object-contain"
          />
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary">
            Children&apos;s Day Tracking
          </h1>
          <p className="mt-1 text-xs text-muted-foreground font-medium italic">
            &ldquo;Every child. Every session. Every step forward.&rdquo;
          </p>
        </div>

        {/* Auth Card */}
        <Card className="rounded-3xl border border-border/80 shadow-soft p-2">
          <Tabs defaultValue="login">
            <CardHeader className="p-3 pb-2">
              <TabsList className="grid w-full grid-cols-2 h-11 rounded-2xl">
                <TabsTrigger value="login" className="text-sm font-bold h-9 rounded-xl">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-bold h-9 rounded-xl">
                  Create Account
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-3 pt-2">
              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email address
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      inputMode="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      placeholder="name@example.com"
                      className="h-12 text-base rounded-2xl"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="h-12 text-base rounded-2xl pr-11"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        <HugeiconsIcon
                          icon={showLoginPassword ? ViewOffIcon : ViewIcon}
                          className="w-5 h-5"
                        />
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-2xl text-base font-bold bg-primary text-white shadow-soft active:scale-98 mt-2"
                  >
                    {loading ? "Signing in…" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Whitelisted Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      inputMode="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      placeholder="name@example.com"
                      className="h-12 text-base rounded-2xl"
                      value={signUpEmail}
                      onChange={(e) => {
                        setSignUpEmail(e.target.value)
                        setWhitelistError(null)
                      }}
                      required
                    />
                    {whitelistError && (
                      <p className="text-xs font-semibold text-destructive mt-1.5">
                        {whitelistError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="h-12 text-base rounded-2xl pr-11"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                      >
                        <HugeiconsIcon
                          icon={showSignUpPassword ? ViewOffIcon : ViewIcon}
                          className="w-5 h-5"
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Must be at least 8 characters.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-2xl text-base font-bold bg-primary text-white shadow-soft active:scale-98 mt-2"
                  >
                    {loading ? "Creating account…" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
