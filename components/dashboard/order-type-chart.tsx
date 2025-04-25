"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { OrdenService } from "@/lib/services/orden-supabase-service-client"

interface TypeCount {
  name: string
  cantidad: number
}

export function OrderTypeChart() {
  const [typeData, setTypeData] = useState<TypeCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrderTypeData() {
      try {
        setLoading(true)
        const orders = await OrdenService.obtenerOrdenes()

        // Contar órdenes por tipo
        const typeCounts: Record<string, number> = {}
        orders.forEach((order) => {
          const type = order.tipo_operacion
          typeCounts[type] = (typeCounts[type] || 0) + 1
        })

        // Convertir a formato para el gráfico
        const chartData = Object.entries(typeCounts).map(([type, count]) => ({
          name: type,
          cantidad: count,
        }))

        setTypeData(chartData)
      } catch (error) {
        console.error("Error al cargar datos de tipos de órdenes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderTypeData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de Órdenes</CardTitle>
        <CardDescription>Distribución de órdenes por tipo de operación</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : typeData.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground h-[300px] flex items-center justify-center">
            No hay datos de órdenes para mostrar
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={typeData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} órdenes`, "Cantidad"]} />
                <Bar dataKey="cantidad" fill="#3B82F6" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
