"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from "lucide-react"
import { OrdenService } from "@/lib/services/orden-service-proxy"
import type { Orden } from "@/lib/types/orden.types"

// Modificar el tipo Orden para incluir detalles
type OrdenConDetalles = Orden & {
  detalles?: Array<{
    id: string
    orden_id: string
    ticker: string
    cantidad: number
    precio: number
    es_orden_mercado: boolean
    created_at: string
  }>
}

export function RecentOrdersTable() {
  // Actualizar el estado para usar el nuevo tipo
  const [orders, setOrders] = useState<OrdenConDetalles[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Modificar la función fetchOrders para obtener los detalles
    async function fetchOrders() {
      try {
        setLoading(true)
        const ordenes = await OrdenService.obtenerOrdenes()

        // Obtener detalles para cada orden
        const ordenesConDetalles = await Promise.all(
          ordenes.slice(0, 5).map(async (orden) => {
            const ordenCompleta = await OrdenService.obtenerOrdenPorId(orden.id)
            return ordenCompleta || orden
          }),
        )

        setOrders(ordenesConDetalles.filter(Boolean))
      } catch (error) {
        console.error("Error al cargar órdenes recientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Función para mostrar el estado con el color adecuado
  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "pendiente":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendiente
          </Badge>
        )
      case "tomada":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Tomada
          </Badge>
        )
      case "ejecutada":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ejecutada
          </Badge>
        )
      case "ejecutada parcial":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Parcial
          </Badge>
        )
      case "cancelada":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelada
          </Badge>
        )
      case "revisar":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Revisar
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Función para formatear la fecha
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes Recientes</CardTitle>
        <CardDescription>Las últimas órdenes ingresadas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">No hay órdenes recientes para mostrar</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.cliente_nombre || "Cliente sin nombre"}</TableCell>
                  <TableCell>{order.cliente_cuenta || "N/A"}</TableCell>
                  <TableCell>
                    {order.detalles && order.detalles.length > 0
                      ? order.detalles.map((d) => d.ticker).join(", ")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{order.tipo_operacion}</TableCell>
                  <TableCell>{getStatusBadge(order.estado)}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/ordenes/${order.id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" asChild>
            <Link href="/ordenes">Ver todas las órdenes</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
