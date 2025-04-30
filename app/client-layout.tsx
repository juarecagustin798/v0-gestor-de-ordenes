"use client"

import type React from "react"

import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
      </div>
    </ThemeProvider>
  )
}
