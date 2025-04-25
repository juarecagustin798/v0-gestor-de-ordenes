"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { OrdenService, type Orden } from "@/lib/services/orden-supabase-service-client"

export function SentOrdersDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [orders, setOrders] = useState<Orden[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)

  // Cargar órdenes con estado "Enviada"
  useEffect(() => {
    if (open) {
      loadOrders()
    }
  }, [open])

  const loadOrders = async () => {
    setLoading(true)
    try {
      // Intentar cargar órdenes con estado "Enviada"
      let ordersData = await OrdenService.obtenerOrdenesPorEstado("Enviada")

      // Si no hay resultados, intentar con minúsculas
      if (ordersData.length === 0) {
        ordersData = await OrdenService.obtenerOrdenesPorEstado("enviada")
      }

      setOrders(ordersData)
    } catch (error) {
      console.error("Error al cargar órdenes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes enviadas al mercado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Refrescar la lista de órdenes
  const refreshOrders = async () => {
    setRefreshing(true)
    try {
      await loadOrders()
      toast({
        title: "Lista actualizada",
        description: "Se ha actualizado la lista de órdenes enviadas al mercado",
      })
    } catch (error) {
      console.error("Error al refrescar órdenes:", error)
    } finally {
      setRefreshing(false)
    }
  }

  // Marcar una orden como ejecutada en el mercado
  const markAsExecuted = async (orderId: string) => {
    setProcessingOrder(orderId)
    try {
      // Actualizar estado de la orden a "Ejecutada"
      await OrdenService.actualizarEstadoOrden(orderId, "Ejecutada", "Orden ejecutada correctamente en el mercado")

      toast({
        title: "Orden ejecutada",
        description: `La orden ${orderId} ha sido marcada como ejecutada`,
      })

      // Actualizar la lista de órdenes
      setOrders((prev) => prev.filter((order) => order.id !== orderId))
    } catch (error) {
      console.error("Error al marcar orden como ejecutada:", error)
      toast({
        title: "Error",
        description: `No se pudo marcar la orden ${orderId} como ejecutada`,
        variant: "destructive",
      })
    } finally {
      setProcessingOrder(null)
    }
  }

  // Marcar una orden como rechazada por el mercado
  const markAsRejected = async (orderId: string) => {
    setProcessingOrder(orderId)
    try {
      // Actualizar estado de la orden a "Rechazada"
      await OrdenService.actualizarEstadoOrden(orderId, "Rechazada", "Orden rechazada por el mercado")

      toast({
        title: "Orden rechazada",
        description: `La orden ${orderId} ha sido marcada como rechazada por el mercado`,
      })

      // Actualizar la lista de órdenes
      setOrders((prev) => prev.filter((order) => order.id !== orderId))
    } catch (error) {
      console.error("Error al marcar orden como rechazada:", error)
      toast({
        title: "Error",
        description: `No se pudo marcar la orden ${orderId} como rechazada`,
        variant: "destructive",
      })
    } finally {
      setProcessingOrder(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Órdenes enviadas al mercado</DialogTitle>
          <DialogDescription>
            Monitorea el estado de las órdenes que han sido enviadas al mercado para su ejecución.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {orders.length} {orders.length === 1 ? "orden enviada" : "órdenes enviadas"} al mercado
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshOrders}
              disabled={refreshing}
              className="flex items-center"
            >
              {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Actualizar
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando órdenes...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay órdenes enviadas al mercado para mostrar.
            </div>
          ) : (
            <div className="border rounded-md overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background">ID</TableHead>
                    <TableHead className="sticky top-0 bg-background">Cliente</TableHead>
                    <TableHead className="sticky top-0 bg-background">Cuenta</TableHead>
                    <TableHead className="sticky top-0 bg-background">Ticker</TableHead>
                    <TableHead className="sticky top-0 bg-background">Tipo</TableHead>
                    <TableHead className="sticky top-0 bg-background">Cantidad</TableHead>
                    <TableHead className="sticky top-0 bg-background">Precio</TableHead>
                    <TableHead className="sticky top-0 bg-background">Fecha de envío</TableHead>
                    <TableHead className="sticky top-0 bg-background text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    // Obtener el primer detalle de la orden (si existe)
                    const detalle = order.detalles && order.detalles.length > 0 ? order.detalles[0] : null

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.cliente_nombre || "Cliente sin nombre"}</TableCell>
                        <TableCell>{order.cliente_cuenta || "Sin cuenta"}</TableCell>
                        <TableCell>{detalle?.ticker || "Sin ticker"}</TableCell>
                        <TableCell>
                          <Badge variant={order.tipo_operacion === "Compra" ? "default" : "destructive"}>
                            {order.tipo_operacion}
                          </Badge>
                        </TableCell>
                        <TableCell>{detalle?.cantidad || 0}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(detalle?.precio || 0)}
                        </TableCell>
                        <TableCell>{new Date(order.updated_at || order.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsExecuted(order.id)}
                              disabled={processingOrder === order.id}
                              className="bg-green-50 hover:bg-green-100 border-green-200"
                            >
                              {processingOrder === order.id ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                              )}
                              Ejecutada
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRejected(order.id)}
                              disabled={processingOrder === order.id}
                              className="bg-red-50 hover:bg-red-100 border-red-200"
                            >
                              {processingOrder === order.id ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : (
                                <XCircle className="mr-2 h-3 w-3 text-red-500" />
                              )}
                              Rechazada
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
