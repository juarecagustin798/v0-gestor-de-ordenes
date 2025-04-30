import type React from "react"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import ClientLayout from "./client-layout"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gestor de Órdenes",
  description: "Sistema de gestión de órdenes para sociedades de bolsa",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
