"use client"

import { useState, useEffect } from "react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { OrdenService, type Orden } from "@/lib/services/orden-supabase-service-client"

export function SendOrdersDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [orders, setOrders] = useState<Orden[]>([])
  const [selectedOrders, setSelectedOrders] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState<Record<string, boolean>>({})
  const [allSending, setAllSending] = useState(false)

  // Cargar órdenes con estado "Tomada"
  useEffect(() => {
    if (open) {
      loadOrders()
    } else {
      // Limpiar selecciones al cerrar
      setSelectedOrders({})
      setSending({})
      setAllSending(false)
    }
  }, [open])

  const loadOrders = async () => {
    setLoading(true)
    try {
      // Intentar cargar órdenes con estado "Tomada"
      let ordersData = await OrdenService.obtenerOrdenesPorEstado("Tomada")

      // Si no hay resultados, intentar con minúsculas
      if (ordersData.length === 0) {
        ordersData = await OrdenService.obtenerOrdenesPorEstado("tomada")
      }

      setOrders(ordersData)
    } catch (error) {
      console.error("Error al cargar órdenes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes tomadas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Manejar selección de todas las órdenes
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected: Record<string, boolean> = {}
      orders.forEach((order) => {
        newSelected[order.id] = true
      })
      setSelectedOrders(newSelected)
    } else {
      setSelectedOrders({})
    }
  }

  // Manejar selección individual
  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders((prev) => ({
      ...prev,
      [orderId]: checked,
    }))
  }

  // Verificar si todas las órdenes están seleccionadas
  const areAllSelected = orders.length > 0 && orders.every((order) => selectedOrders[order.id])

  // Contar órdenes seleccionadas
  const selectedCount = Object.values(selectedOrders).filter(Boolean).length

  // Enviar una orden individual al mercado
  const sendOrder = async (orderId: string) => {
    setSending((prev) => ({ ...prev, [orderId]: true }))

    try {
      // Simular conexión con API de mercado
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Actualizar estado de la orden a "Enviada al mercado"
      await OrdenService.actualizarEstadoOrden(orderId, "Enviada", "Orden enviada al mercado")

      toast({
        title: "Orden enviada",
        description: `La orden ${orderId} ha sido enviada al mercado correctamente`,
      })

      // Actualizar la lista de órdenes
      setOrders((prev) => prev.filter((order) => order.id !== orderId))

      // Limpiar selección
      const newSelected = { ...selectedOrders }
      delete newSelected[orderId]
      setSelectedOrders(newSelected)
    } catch (error) {
      console.error("Error al enviar orden:", error)
      toast({
        title: "Error",
        description: `No se pudo enviar la orden ${orderId} al mercado`,
        variant: "destructive",
      })
    } finally {
      setSending((prev) => {
        const newSending = { ...prev }
        delete newSending[orderId]
        return newSending
      })
    }
  }

  // Enviar todas las órdenes seleccionadas
  const sendAllSelected = async () => {
    const selectedIds = Object.keys(selectedOrders).filter((id) => selectedOrders[id])

    if (selectedIds.length === 0) {
      toast({
        title: "Advertencia",
        description: "No hay órdenes seleccionadas para enviar",
        variant: "default",
      })
      return
    }

    setAllSending(true)

    try {
      // Enviar órdenes en secuencia
      for (const orderId of selectedIds) {
        setSending((prev) => ({ ...prev, [orderId]: true }))

        // Simular conexión con API de mercado
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Actualizar estado de la orden
        await OrdenService.actualizarEstadoOrden(orderId, "Enviada", "Orden enviada al mercado en proceso masivo")

        setSending((prev) => {
          const newSending = { ...prev }
          delete newSending[orderId]
          return newSending
        })
      }

      toast({
        title: "Órdenes enviadas",
        description: `Se han enviado ${selectedIds.length} órdenes al mercado correctamente`,
      })

      // Actualizar la lista de órdenes
      setOrders((prev) => prev.filter((order) => !selectedIds.includes(order.id)))

      // Limpiar selecciones
      setSelectedOrders({})
    } catch (error) {
      console.error("Error al enviar órdenes:", error)
      toast({
        title: "Error",
        description: "No se pudieron enviar todas las órdenes al mercado",
        variant: "destructive",
      })
    } finally {
      setAllSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Envío de órdenes al mercado</DialogTitle>
          <DialogDescription>Selecciona las órdenes que deseas enviar al mercado para su ejecución.</DialogDescription>
        </DialogHeader>

        <div className="py-4 flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando órdenes...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay órdenes tomadas disponibles para enviar al mercado.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={areAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Seleccionar todas
                  </label>
                </div>

                <Button
                  onClick={sendAllSelected}
                  disabled={selectedCount === 0 || allSending}
                  className="flex items-center"
                >
                  {allSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar seleccionadas ({selectedCount})
                    </>
                  )}
                </Button>
              </div>

              <div className="border rounded-md overflow-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px] sticky top-0 bg-background">Seleccionar</TableHead>
                      <TableHead className="sticky top-0 bg-background">ID</TableHead>
                      <TableHead className="sticky top-0 bg-background">Cliente</TableHead>
                      <TableHead className="sticky top-0 bg-background">Cuenta</TableHead>
                      <TableHead className="sticky top-0 bg-background">Ticker</TableHead>
                      <TableHead className="sticky top-0 bg-background">Tipo</TableHead>
                      <TableHead className="sticky top-0 bg-background">Cantidad</TableHead>
                      <TableHead className="sticky top-0 bg-background">Precio</TableHead>
                      <TableHead className="sticky top-0 bg-background text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      // Obtener el primer detalle de la orden (si existe)
                      const detalle = order.detalles && order.detalles.length > 0 ? order.detalles[0] : null

                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Checkbox
                              checked={!!selectedOrders[order.id]}
                              onCheckedChange={(checked) => handleSelectOrder(order.id, !!checked)}
                              disabled={!!sending[order.id]}
                            />
                          </TableCell>
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
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendOrder(order.id)}
                              disabled={!!sending[order.id]}
                            >
                              {sending[order.id] ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 h-3 w-3" />
                                  Enviar
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
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
