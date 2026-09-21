import type { Metadata, Viewport } from "next"
import { Figtree } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toast"

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Resala Children's Day Tracking System",
  description: "Every child. Every session. Every step forward.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#253487",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={figtree.variable}>
      <body className="min-h-dvh flex flex-col font-sans bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
