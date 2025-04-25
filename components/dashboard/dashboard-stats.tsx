"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChartIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from "lucide-react"
import { OrdenService } from "@/lib/services/orden-supabase-service-client"

export function DashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    ejecutadas: 0,
    canceladas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const orders = await OrdenService.obtenerOrdenes()

        // Calcular estadísticas
        const pendientes = orders.filter(
          (order) =>
            order.estado.toLowerCase() === "pendiente" ||
            order.estado.toLowerCase() === "tomada" ||
            order.estado.toLowerCase() === "revisar",
        ).length

        const ejecutadas = orders.filter(
          (order) => order.estado.toLowerCase() === "ejecutada" || order.estado.toLowerCase() === "ejecutada parcial",
        ).length

        const canceladas = orders.filter((order) => order.estado.toLowerCase() === "cancelada").length

        setStats({
          total: orders.length,
          pendientes,
          ejecutadas,
          canceladas,
        })
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Órdenes"
        value={stats.total}
        icon={<BarChartIcon className="h-4 w-4 text-blue-600" />}
        description="Órdenes totales"
        loading={loading}
      />
      <StatsCard
        title="Pendientes"
        value={stats.pendientes}
        icon={<ClockIcon className="h-4 w-4 text-yellow-600" />}
        description="Órdenes en proceso"
        loading={loading}
      />
      <StatsCard
        title="Ejecutadas"
        value={stats.ejecutadas}
        icon={<CheckCircleIcon className="h-4 w-4 text-green-600" />}
        description="Órdenes completadas"
        loading={loading}
      />
      <StatsCard
        title="Canceladas"
        value={stats.canceladas}
        icon={<AlertCircleIcon className="h-4 w-4 text-red-600" />}
        description="Órdenes canceladas"
        loading={loading}
      />
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  description: string
  loading: boolean
}

function StatsCard({ title, value, icon, description, loading }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
