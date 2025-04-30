"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { OrdenService } from "@/lib/services/orden-service-proxy"

export function ClientFileStatus() {
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    activeClients: 0,
    completionPercentage: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClientStats = async () => {
      try {
        // En un entorno real, esto vendría de una API
        // Por ahora, simulamos algunos datos
        const orders = await OrdenService.obtenerOrdenes()

        // Extraer clientes únicos
        const uniqueClients = new Set(orders.map((order) => order.cliente_id))
        const totalClients = uniqueClients.size

        // Clientes con órdenes completadas
        const clientsWithCompletedOrders = new Set(
          orders
            .filter(
              (order) => order.estado.toLowerCase() === "ejecutada" || order.estado.toLowerCase() === "completada",
            )
            .map((order) => order.cliente_id),
        )
        const activeClients = clientsWithCompletedOrders.size

        // Calcular porcentaje
        const completionPercentage = totalClients > 0 ? (activeClients / totalClients) * 100 : 0

        setClientStats({
          totalClients,
          activeClients,
          completionPercentage,
        })
      } catch (error) {
        console.error("Error al cargar estadísticas de clientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientStats()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Estado de Clientes</CardTitle>
        <CardDescription>Progreso de activación de clientes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Clientes activos</span>
              <span className="text-sm font-medium">
                {clientStats.activeClients} de {clientStats.totalClients}
              </span>
            </div>
            <Progress value={clientStats.completionPercentage} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {clientStats.completionPercentage.toFixed(0)}% de los clientes han realizado operaciones
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
