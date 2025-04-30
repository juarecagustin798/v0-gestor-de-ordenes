"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OrdenService } from "@/lib/services/orden-service-proxy"
import { StatusUpdateDialog } from "@/components/status-update-dialog"
import { AddObservationForm } from "@/components/add-observation-form"
import { OrderObservations } from "@/components/order-observations"
import { toast } from "@/hooks/use-toast"
import type { Orden } from "@/lib/types/orden.types"

interface OrdenDetalleViewProps {
  ordenId: string
}

export function OrdenDetalleView({ ordenId }: OrdenDetalleViewProps) {
  const router = useRouter()
  const [orden, setOrden] = useState<Orden | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // Cargar datos de la orden
  useEffect(() => {
    const fetchOrden = async () => {
      setLoading(true)
      try {
        const data = await OrdenService.obtenerOrdenPorId(ordenId)
        setOrden(data)
      } catch (error) {
        console.error("Error al cargar la orden:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la orden",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrden()
  }, [ordenId])

  // Manejar actualización de estado
  const handleStatusUpdate = (status: string) => {
    setSelectedStatus(status)
    setStatusDialogOpen(true)
  }

  // Procesar la actualización de estado
  const processStatusUpdate = async (params: { observation: string }) => {
    if (!selectedStatus) return

    try {
      const result = await OrdenService.actualizarEstadoOrden(ordenId, selectedStatus, params.observation)

      if (result.success) {
        toast({
          title: "Estado actualizado",
          description: `La orden ha sido actualizada a estado ${selectedStatus}`,
        })

        // Recargar la orden para mostrar los cambios
        const updatedOrden = await OrdenService.obtenerOrdenPorId(ordenId)
        setOrden(updatedOrden)
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo actualizar el estado de la orden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setStatusDialogOpen(false)
    }
  }

  // Manejar la adición de una observación
  const handleAddObservation = async (observacion: string) => {
    try {
      const result = await OrdenService.agregarObservacion(ordenId, observacion)

      if (result.success) {
        toast({
          title: "Observación agregada",
          description: "La observación ha sido agregada correctamente",
        })

        // Recargar la orden para mostrar los cambios
        const updatedOrden = await OrdenService.obtenerOrdenPorId(ordenId)
        setOrden(updatedOrden)
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo agregar la observación",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al agregar observación:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al agregar la observación",
        variant: "destructive",
      })
    }
  }

  // Determinar las acciones disponibles según el estado actual
  const getAvailableActions = () => {
    if (!orden) return []

    const estado = orden.estado.toLowerCase()

    if (estado === "pendiente") {
      return [{ label: "Tomar orden", status: "Tomada", disabled: false }]
    } else if (estado === "tomada") {
      return [
        { label: "Ejecutar", status: "Ejecutada", disabled: false },
        { label: "Ejecutar parcialmente", status: "Ejecutada parcial", disabled: false },
        { label: "Revisar", status: "Revisar", disabled: false },
        { label: "Cancelar", status: "Cancelada", disabled: false },
      ]
    } else if (estado === "ejecutada parcial") {
      return [
        { label: "Ejecutar completamente", status: "Ejecutada", disabled: false },
        { label: "Revisar", status: "Revisar", disabled: false },
        { label: "Cancelar", status: "Cancelada", disabled: false },
      ]
    } else if (estado === "revisar") {
      return [
        { label: "Tomar", status: "Tomada", disabled: false },
        { label: "Ejecutar", status: "Ejecutada", disabled: false },
        { label: "Cancelar", status: "Cancelada", disabled: false },
      ]
    }

    // Para estados finales como "Ejecutada" o "Cancelada", no hay acciones disponibles
    return []
  }

  // Renderizar estado de carga
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar mensaje si no se encuentra la orden
  if (!orden) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">Orden no encontrada</h3>
            <p className="text-muted-foreground mt-2">No se pudo encontrar la orden con ID {ordenId}</p>
            <Button className="mt-4" onClick={() => router.push("/ordenes")}>
              Volver a órdenes
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

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

  // Obtener el primer detalle de la orden (si existe)
  const detalle = orden.detalles && orden.detalles.length > 0 ? orden.detalles[0] : null

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Orden #{orden.id}</CardTitle>
              <CardDescription>
                Creada el {new Date(orden.created_at).toLocaleDateString()} a las{" "}
                {new Date(orden.created_at).toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(orden.estado)}>{orden.estado}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Información de la orden</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span>{orden.cliente_nombre}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Cuenta:</span>
                  <span>{orden.cliente_cuenta || "No especificada"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Tipo de operación:</span>
                  <span>{orden.tipo_operacion}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Mercado:</span>
                  <span>{orden.mercado || "No especificado"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Fecha de vencimiento:</span>
                  <span>
                    {orden.fecha_vencimiento
                      ? new Date(orden.fecha_vencimiento).toLocaleDateString()
                      : "No especificada"}
                  </span>
                </div>
              </div>
            </div>

            {detalle && (
              <div>
                <h3 className="text-lg font-medium mb-2">Detalles del activo</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Ticker:</span>
                    <span>{detalle.ticker}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <span>{detalle.cantidad}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Precio:</span>
                    <span>
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(detalle.precio || 0)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format((detalle.cantidad || 0) * (detalle.precio || 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Observaciones</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <OrderObservations observations={orden.observaciones || []} />
            </ScrollArea>
            <AddObservationForm onSubmit={handleAddObservation} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/ordenes")}>
            Volver a órdenes
          </Button>

          {getAvailableActions().map((action) => (
            <Button
              key={action.status}
              onClick={() => handleStatusUpdate(action.status)}
              disabled={action.disabled}
              variant={action.status === "Cancelada" ? "destructive" : "default"}
            >
              {action.label}
            </Button>
          ))}
        </CardFooter>
      </Card>

      <StatusUpdateDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        status={selectedStatus || ""}
        onConfirm={processStatusUpdate}
        showExecutionFields={selectedStatus === "Ejecutada" || selectedStatus === "Ejecutada parcial"}
        currentOrder={orden}
      />
    </>
  )
}
