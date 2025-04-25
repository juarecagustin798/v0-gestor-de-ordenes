"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null)

  // Verificar la conexión con Supabase al montar el componente
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("ordenes").select("id").limit(1)

        if (error) {
          console.error("Error al conectar con Supabase:", error)
          setIsSupabaseConnected(false)
        } else {
          console.log("Conexión con Supabase establecida correctamente")
          setIsSupabaseConnected(true)
        }
      } catch (err) {
        console.error("Error al verificar la conexión con Supabase:", err)
        setIsSupabaseConnected(false)
      }
    }

    checkSupabaseConnection()
  }, [])

  return (
    <div className={`container grid items-start gap-8 pb-8 pt-6 md:py-8 ${className || ""}`} {...props}>
      {isSupabaseConnected === false && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">
          <p className="font-medium">Error de conexión con Supabase</p>
          <p className="text-sm">No se pudo establecer conexión con la base de datos. Verifica tu configuración.</p>
        </div>
      )}
      {children}
    </div>
  )
}
