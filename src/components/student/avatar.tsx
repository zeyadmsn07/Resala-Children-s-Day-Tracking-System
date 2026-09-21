"use client"

import React, { useState } from "react"

const PASTEL_COLORS = [
  "bg-[oklch(0.92_0.06_220)] text-[oklch(0.40_0.12_220)]", // sky
  "bg-[oklch(0.92_0.06_150)] text-[oklch(0.40_0.12_150)]", // mint
  "bg-[oklch(0.93_0.08_95)] text-[oklch(0.45_0.14_85)]",  // butter
  "bg-[oklch(0.92_0.07_50)] text-[oklch(0.45_0.14_45)]",  // peach
  "bg-[oklch(0.92_0.06_295)] text-[oklch(0.45_0.14_295)]", // lilac
  "bg-[oklch(0.92_0.06_10)] text-[oklch(0.45_0.14_10)]",   // rose
  "bg-[oklch(0.92_0.06_180)] text-[oklch(0.40_0.12_180)]", // aqua
  "bg-[oklch(0.92_0.07_125)] text-[oklch(0.40_0.13_125)]", // lime
]

const SHIRT_COLORS = [
  "fill-[#3B82F6]",
  "fill-[#10B981]",
  "fill-[#F59E0B]",
  "fill-[#EC4899]",
  "fill-[#8B5CF6]",
  "fill-[#06B6D4]",
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// 6 Faceless head-and-shoulders silhouettes with varied hair and shirt styles
function Silhouette({ variant }: { variant: number }) {
  const shirtColor = SHIRT_COLORS[variant % SHIRT_COLORS.length]

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <circle cx="50" cy="38" r="18" fill="#FCD34D" opacity="0.95" />

      {/* Hair variants */}
      {variant === 0 && (
        // Short neat hair
        <path
          d="M32 36C32 26 40 20 50 20C60 20 68 26 68 36C68 32 64 26 50 26C36 26 32 32 32 36Z"
          fill="#4B5563"
        />
      )}
      {variant === 1 && (
        // Curly/Puffy hair
        <path
          d="M30 35C28 26 36 17 50 17C64 17 72 26 70 35C66 22 34 22 30 35Z"
          fill="#1F2937"
        />
      )}
      {variant === 2 && (
        // Side-part hair
        <path
          d="M31 38C31 24 42 19 53 19C64 19 69 25 69 35C65 24 45 23 31 38Z"
          fill="#92400E"
        />
      )}
      {variant === 3 && (
        // Cap / Hat style
        <path
          d="M28 32C28 24 38 21 50 21C62 21 72 24 72 32L78 35L22 35L28 32Z"
          fill="#2563EB"
        />
      )}
      {variant === 4 && (
        // Bun/topknot
        <>
          <circle cx="50" cy="16" r="7" fill="#374151" />
          <path
            d="M32 36C32 25 40 20 50 20C60 20 68 25 68 36C65 26 35 26 32 36Z"
            fill="#374151"
          />
        </>
      )}
      {variant === 5 && (
        // Wavy hair
        <path
          d="M30 40C29 27 38 20 50 20C62 20 71 27 70 40C66 28 34 28 30 40Z"
          fill="#78350F"
        />
      )}

      {/* Shoulders / Shirt */}
      <path
        d="M20 86C20 68 33 60 50 60C67 60 80 68 80 86C80 90 77 92 73 92H27C23 92 20 90 20 86Z"
        className={shirtColor}
      />
    </svg>
  )
}

type AvatarProps = {
  id?: string
  name?: string
  photoUrl?: string | null
  size?: 32 | 40 | 56 | 64 | 96
  role?: "director" | "head" | "member" | null
  className?: string
}

export function StudentAvatar({
  id = "default",
  name = "",
  photoUrl,
  size = 56,
  role,
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const hash = hashString(id + name)
  const pastelClass = PASTEL_COLORS[hash % PASTEL_COLORS.length]
  const variant = hash % 6

  const sizeClasses = {
    32: "w-8 h-8",
    40: "w-10 h-10",
    56: "w-14 h-14",
    64: "w-16 h-16",
    96: "w-24 h-24",
  }[size]

  // Role ring colors per section 7.4 (director yellow, head blue, member teal)
  const roleRing = role
    ? {
        director: "ring-3 ring-amber-400",
        head: "ring-3 ring-blue-500",
        member: "ring-3 ring-teal-500",
      }[role]
    : ""

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden select-none ${sizeClasses} ${
        role ? "bg-[oklch(0.93_0.05_295)]" : pastelClass
      } ${roleRing} ${className}`}
    >
      {photoUrl && !imageError ? (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <Silhouette variant={variant} />
      )}
    </div>
  )
}
