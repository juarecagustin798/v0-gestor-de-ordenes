"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { OrdenService } from "@/lib/services/orden-service-proxy"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function OrderTypeChart() {
  const [data, setData] = useState<{ name: string; compra: number; venta: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await OrdenService.obtenerOrdenes()

        // Contar órdenes por tipo y mercado
        const typeCounts: Record<string, { compra: number; venta: number }> = {}

        orders.forEach((order) => {
          const market = order.mercado || "No especificado"
          const type = order.tipo_operacion?.toLowerCase() || "desconocido"

          if (!typeCounts[market]) {
            typeCounts[market] = { compra: 0, venta: 0 }
          }

          if (type === "compra") {
            typeCounts[market].compra += 1
          } else if (type === "venta") {
            typeCounts[market].venta += 1
          }
        })

        // Convertir a formato para el gráfico
        const chartData = Object.entries(typeCounts).map(([name, counts]) => ({
          name,
          compra: counts.compra,
          venta: counts.venta,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes por Tipo y Mercado</CardTitle>
        <CardDescription>Distribución de compras y ventas por mercado</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length > 0 ? (
          <ChartContainer
            config={{
              compra: {
                label: "Compras",
                color: "hsl(var(--chart-1))",
              },
              venta: {
                label: "Ventas",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="compra" fill="var(--color-compra)" name="Compras" />
                <Bar dataKey="venta" fill="var(--color-venta)" name="Ventas" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No hay datos suficientes para mostrar el gráfico</div>
        )}
      </CardContent>
    </Card>
  )
}
