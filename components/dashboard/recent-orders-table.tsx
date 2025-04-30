"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrdenService } from "@/lib/services/orden-service-proxy"
import type { Orden } from "@/lib/types/orden.types"

export function RecentOrdersTable() {
  const [orders, setOrders] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrdenService.obtenerOrdenes()
        // Tomar solo las 5 órdenes más recientes
        setOrders(data.slice(0, 5))
      } catch (error) {
        console.error("Error al cargar órdenes recientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Determinar la variante del badge según el estado
  const getStatusBadgeVariant = (status: string) => {
    const lowerStatus = status.toLowerCase()

    switch (lowerStatus) {
      case "pendiente":
        return "outline"
      case "tomada":
        return "blue" as any
      case "ejecutada parcial":
        return "yellow" as any
      case "ejecutada":
        return "green" as any
      case "revisar":
        return "orange" as any
      case "cancelada":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes Recientes</CardTitle>
        <CardDescription>Las últimas órdenes ingresadas al sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              // Obtener el primer detalle de la orden (si existe)
              const detalle = order.detalles && order.detalles.length > 0 ? order.detalles[0] : null

              return (
                <div key={order.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="font-medium">{order.cliente_nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {detalle ? `${detalle.ticker} - ${detalle.cantidad} unidades` : "Sin detalles"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(order.estado)}>{order.estado}</Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/ordenes/${order.id}`}>Ver</Link>
                    </Button>
                  </div>
                </div>
              )
            })}

            <div className="pt-2 text-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/ordenes">Ver todas las órdenes</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No hay órdenes recientes para mostrar</div>
        )}
      </CardContent>
    </Card>
  )
}
