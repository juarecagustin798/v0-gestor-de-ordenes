"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { OrdenService } from "@/lib/services/orden-supabase-service-client"

interface StatusCount {
  name: string
  value: number
  color: string
}

export function OrderStatusChart() {
  const [statusData, setStatusData] = useState<StatusCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrderStatusData() {
      try {
        setLoading(true)
        const orders = await OrdenService.obtenerOrdenes()

        // Contar órdenes por estado
        const statusCounts: Record<string, number> = {}
        orders.forEach((order) => {
          const status = order.estado.toLowerCase()
          statusCounts[status] = (statusCounts[status] || 0) + 1
        })

        // Definir colores para cada estado
        const statusColors: Record<string, string> = {
          pendiente: "#EAB308", // yellow-500
          tomada: "#3B82F6", // blue-500
          ejecutada: "#22C55E", // green-500
          "ejecutada parcial": "#10B981", // emerald-500
          cancelada: "#EF4444", // red-500
          revisar: "#A855F7", // purple-500
        }

        // Convertir a formato para el gráfico
        const chartData = Object.entries(statusCounts).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
          color: statusColors[status] || "#94A3B8", // slate-400 como color por defecto
        }))

        setStatusData(chartData)
      } catch (error) {
        console.error("Error al cargar datos de estado de órdenes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderStatusData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Órdenes</CardTitle>
        <CardDescription>Distribución de órdenes por estado</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </div>
        ) : statusData.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground h-[300px] flex items-center justify-center">
            No hay datos de órdenes para mostrar
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} órdenes`, "Cantidad"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
