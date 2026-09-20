"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { loginAction, signUpAction } from "./actions"

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
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
      // redirect() throws a NEXT_REDIRECT error — this is expected
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signUpAction(signUpEmail, signUpPassword)
      if (result?.error) {
        toast.add({
          title: "Sign Up Failed",
          description: result.error,
          type: "error",
        })
      }
    } catch {
      // redirect() throws a NEXT_REDIRECT error — this is expected
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Resala Logo */}
        <div className="flex flex-col items-center">
          <img
            src="/resala-logo.png"
            alt="Resala"
            className="h-auto w-44 object-contain"
          />
          <h1 className="mt-4 text-xl font-bold tracking-tight text-primary">
            Children&apos;s Day Tracking
          </h1>
        </div>

        {/* Auth Card */}
        <Card className="border-border/80 shadow-sm">
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2 h-11">
                <TabsTrigger value="login" className="text-sm font-semibold py-2">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-semibold py-2">
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-2">
              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-11 text-base"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-11 text-base"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-semibold shadow-xs active:scale-98 mt-2" disabled={loading}>
                    {loading ? "Signing in…" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-11 text-base"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="h-11 text-base"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-semibold shadow-xs active:scale-98 mt-2" disabled={loading}>
                    {loading ? "Creating account…" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Resala Children&apos;s Day Tracking System
        </p>
      </div>
    </main>
  )
}
