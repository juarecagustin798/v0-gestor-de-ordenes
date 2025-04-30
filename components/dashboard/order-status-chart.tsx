"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { OrdenService } from "@/lib/services/orden-service-proxy"

export function OrderStatusChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await OrdenService.obtenerOrdenes()

        // Contar órdenes por estado
        const statusCounts: Record<string, number> = {}

        orders.forEach((order) => {
          const status = order.estado || "Desconocido"
          statusCounts[status] = (statusCounts[status] || 0) + 1
        })

        // Convertir a formato para el gráfico
        const chartData = Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value,
        }))

        setData(chartData)
      } catch (error) {
        console.error("Error al cargar datos para el gráfico:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Colores para los diferentes estados
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes por Estado</CardTitle>
        <CardDescription>Distribución de órdenes según su estado actual</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} órdenes`, "Cantidad"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No hay datos suficientes para mostrar el gráfico</div>
        )}
      </CardContent>
    </Card>
  )
}
