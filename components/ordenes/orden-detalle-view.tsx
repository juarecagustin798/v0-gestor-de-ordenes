"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Orden, OrdenDetalle, OrdenObservacion } from "@/lib/services/orden-supabase-service"
import { actualizarEstadoOrden, agregarObservacionOrden } from "@/lib/actions/orden-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, MessageSquare, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface OrdenDetalleViewProps {
  orden: Orden
}

export function OrdenDetalleView({ orden }: OrdenDetalleViewProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusNote, setStatusNote] = useState("")
  const [newObservation, setNewObservation] = useState("")
  const [isAddingObservation, setIsAddingObservation] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Formatear fechas
  const createdAt = new Date(orden.created_at)
  const updatedAt = new Date(orden.updated_at)

  // Manejar cambio de estado
  const handleStatusChange = async () => {
    if (!newStatus) return

    setIsUpdatingStatus(true)
    try {
      const result = await actualizarEstadoOrden(orden.id, newStatus, statusNote)

      if (result.success) {
        toast({
          title: "Estado actualizado",
          description: `La orden ha sido actualizada a "${newStatus}"`,
        })
        setIsDialogOpen(false)
        setNewStatus("")
        setStatusNote("")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo actualizar el estado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Manejar agregar observación
  const handleAddObservation = async () => {
    if (!newObservation.trim()) return

    setIsAddingObservation(true)
    try {
      const result = await agregarObservacionOrden(
        orden.id,
        newObservation,
        "user-1", // En un entorno real, esto vendría del usuario autenticado
        "Usuario Actual", // En un entorno real, esto vendría del usuario autenticado
      )

      if (result.success) {
        toast({
          title: "Observación agregada",
          description: "La observación ha sido agregada correctamente",
        })
        setNewObservation("")
        router.refresh()
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
        description: "Ha ocurrido un error al agregar la observación",
        variant: "destructive",
      })
    } finally {
      setIsAddingObservation(false)
    }
  }

  // Determinar el color del badge según el estado
  const getStatusBadgeVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "outline"
      case "tomada":
      case "en proceso":
        return "secondary"
      case "ejecutada":
      case "completada":
        return "default"
      case "cancelada":
      case "rechazada":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Obtener el icono según el estado
  const getStatusIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return <Clock className="h-4 w-4 mr-1" />
      case "tomada":
      case "en proceso":
        return <AlertCircle className="h-4 w-4 mr-1" />
      case "ejecutada":
      case "completada":
        return <CheckCircle2 className="h-4 w-4 mr-1" />
      case "cancelada":
      case "rechazada":
        return <XCircle className="h-4 w-4 mr-1" />
      default:
        return <Clock className="h-4 w-4 mr-1" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/ordenes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detalles de la Orden</h1>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Cambiar Estado</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Estado de la Orden</DialogTitle>
              <DialogDescription>Selecciona el nuevo estado para esta orden.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="status">Nuevo Estado</label>
                <Select onValueChange={setNewStatus} value={newStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="tomada">Tomada</SelectItem>
                    <SelectItem value="en proceso">En Proceso</SelectItem>
                    <SelectItem value="ejecutada">Ejecutada</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="note">Observación (opcional)</label>
                <Textarea
                  id="note"
                  placeholder="Añade una observación sobre el cambio de estado"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleStatusChange} disabled={!newStatus || isUpdatingStatus}>
                {isUpdatingStatus ? "Actualizando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información de la Orden</CardTitle>
            <CardDescription>Detalles generales de la orden</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID de la Orden</p>
                  <p className="font-mono">{orden.id}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(orden.estado)} className="flex items-center">
                  {getStatusIcon(orden.estado)}
                  {orden.estado}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p className="font-medium">{orden.cliente_nombre}</p>
                {orden.cliente_cuenta && (
                  <p className="text-sm text-muted-foreground">Cuenta: {orden.cliente_cuenta}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Operación</p>
                  <Badge variant={orden.tipo_operacion === "Compra" ? "default" : "destructive"}>
                    {orden.tipo_operacion}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mercado</p>
                  <p>{orden.mercado || "No especificado"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                  <p>{format(createdAt, "dd/MM/yyyy HH:mm", { locale: es })}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                  <p>{format(updatedAt, "dd/MM/yyyy HH:mm", { locale: es })}</p>
                </div>
              </div>

              {orden.notas && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notas</p>
                    <p className="whitespace-pre-line">{orden.notas}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Activo</CardTitle>
            <CardDescription>Información sobre el activo</CardDescription>
          </CardHeader>
          <CardContent>
            {orden.detalles && orden.detalles.length > 0 ? (
              <div className="space-y-4">
                {orden.detalles.map((detalle: OrdenDetalle) => (
                  <div key={detalle.id} className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ticker</p>
                      <p className="font-medium">{detalle.ticker}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cantidad</p>
                      <p>{detalle.cantidad.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Precio</p>
                      <p>
                        {detalle.es_orden_mercado
                          ? "Orden a mercado"
                          : `$${detalle.precio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </p>
                    </div>

                    {!detalle.es_orden_mercado && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Importe Total</p>
                        <p className="font-medium">
                          $
                          {(detalle.cantidad * detalle.precio).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No hay detalles disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Observaciones</CardTitle>
          <CardDescription>Historial de observaciones y comentarios</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="observaciones">
            <TabsList>
              <TabsTrigger value="observaciones">Observaciones</TabsTrigger>
              <TabsTrigger value="nueva">Nueva Observación</TabsTrigger>
            </TabsList>
            <TabsContent value="observaciones" className="pt-4">
              {orden.observaciones && orden.observaciones.length > 0 ? (
                <div className="space-y-4">
                  {orden.observaciones.map((obs: OrdenObservacion) => (
                    <div key={obs.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{obs.usuario_nombre || "Usuario"}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(obs.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                        </p>
                      </div>
                      <p className="mt-2 whitespace-pre-line">{obs.texto}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay observaciones registradas</p>
              )}
            </TabsContent>
            <TabsContent value="nueva" className="pt-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Escribe una nueva observación..."
                  value={newObservation}
                  onChange={(e) => setNewObservation(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleAddObservation} disabled={!newObservation.trim() || isAddingObservation}>
                  {isAddingObservation ? "Agregando..." : "Agregar Observación"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
