"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

export default function Home() {
const [childName, setChildName] = useState("")
const [childId, setChildId] = useState("")
const [attentiveness, setAttentiveness] = useState(70)
const [behaviorScore, setBehaviorScore] = useState(0)

return ( <main className="min-h-screen bg-background px-4 py-8 sm:px-6"> <div className="mx-auto w-full max-w-2xl space-y-6">


    {/* Header */}
    <header className="flex flex-col items-center text-center">
      <img
        src="/resala-logo.png"
        alt="Resala Logo"
        className="mb-5 h-auto w-40 object-contain"
      />

      <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
        Children&apos;s Day
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        Child Tracking &amp; Progress
      </p>
    </header>

    {/* Child Information */}
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Currently Tracking
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="child-name"
            className="mb-2 block text-sm font-medium"
          >
            Child Name
          </label>

          <Input
            id="child-name"
            placeholder="Enter child's name"
            value={childName}
            onChange={(event) => setChildName(event.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="child-id"
            className="mb-2 block text-sm font-medium"
          >
            Child ID
          </label>

          <Input
            id="child-id"
            placeholder="Enter child ID"
            value={childId}
            onChange={(event) => setChildId(event.target.value)}
          />
        </div>
      </div>
    </section>

    {/* Attentiveness */}
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Attentiveness
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Rate the child&apos;s level of attentiveness
          </p>
        </div>

        <div className="text-right">
          <span className="text-3xl font-bold text-primary">
            {attentiveness}
          </span>

          <span className="ml-1 text-sm text-muted-foreground">
            / 100
          </span>
        </div>
      </div>

      <Slider
        defaultValue={[70]}
        min={0}
        max={100}
        step={1}
        onValueChange={(value) => {
          const newValue = Array.isArray(value)
            ? value[0]
            : value

          if (typeof newValue === "number") {
            setAttentiveness(newValue)
          }
        }}
      />

      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>Needs attention</span>
        <span>Excellent</span>
      </div>
    </section>

    {/* Behavior Points */}
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Behavior Points
        </p>

        <div className="mt-2">
          <span className="text-5xl font-bold text-primary">
            {behaviorScore}
          </span>

          <span className="ml-2 text-sm text-muted-foreground">
            points
          </span>
        </div>
      </div>

<div className="mt-7 grid grid-cols-2 gap-3">
  <Button
    className="behavior-point h-12 text-base font-semibold"
    onClick={() => setBehaviorScore((score) => score - 1)}
  >
    -1
  </Button>

  <Button
    className="behavior-point h-12 text-base font-semibold"
    onClick={() => setBehaviorScore((score) => score + 1)}
  >
    +1
  </Button>
</div>

      <div className="mt-4 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setBehaviorScore(0)}
        >
          Reset points
        </Button>
      </div>
    </section>

    {/* Save */}
    <Button
      className="h-12 w-full text-base font-semibold"
      onClick={() => alert("Progress saved!")}
    >
      Save Progress
    </Button>

    <p className="pb-4 text-center text-xs text-muted-foreground">
      Resala Children&apos;s Day Tracking System
    </p>

  </div>
</main>


)
}
