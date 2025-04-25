"use client"

import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { setupDebugUtils } from "@/lib/debug-utils"
import { useEffect } from "react"
import { AutoAssetsLoader } from "@/components/auto-assets-loader"
import { AutoClientsLoader } from "@/components/auto-clients-loader"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    setupDebugUtils()
  }, [])
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AutoAssetsLoader />
      <AutoClientsLoader />
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
    </ThemeProvider>
  )
}
