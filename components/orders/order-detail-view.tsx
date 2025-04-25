"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { updateOrdenEstado, deleteOrden } from "@/lib/services/orden-service"
import { AlertCircle, ArrowLeft } from "lucide-react"

type Orden = {
  id: string
  estado: string
  created_at: string
  updated_at: string
  observaciones: string | null
  clientes: {
    id: string
    nombre: string
    email: string | null
    telefono: string | null
  } | null
  activos: Array<{
    id: string
    tipo: string
    descripcion: string | null
    valor: number | null
  }>
}

export function OrderDetailView({ orden }: { orden: Orden }) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [nuevaObservacion, setNuevaObservacion] = useState("")

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "en_proceso":
        return <Badge className="bg-blue-100 text-blue-800">En Proceso</Badge>
      case "completada":
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const handleUpdateEstado = async (estado: string) => {
    setIsUpdating(true)
    try {
      await updateOrdenEstado(orden.id, estado, nuevaObservacion || undefined)
      router.refresh()
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      alert("Ocurrió un error al actualizar el estado")
    } finally {
      setIsUpdating(false)
      setNuevaObservacion("")
    }
  }

  const handleDeleteOrden = async () => {
    setIsDeleting(true)
    try {
      await deleteOrden(orden.id)
      router.push("/ordenes")
    } catch (error) {
      console.error("Error al eliminar orden:", error)
      alert("Ocurrió un error al eliminar la orden")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPpp", { locale: es })
  }

  const getTipoActivoLabel = (tipo: string) => {
    switch (tipo) {
      case "acciones":
        return "Acciones"
      case "bonos":
        return "Bonos"
      case "fondos":
        return "Fondos"
      case "criptomonedas":
        return "Criptomonedas"
      case "otros":
        return "Otros"
      default:
        return tipo
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Orden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Estado</p>
              <div className="mt-1">{getEstadoBadge(orden.estado)}</div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Cliente</p>
              <p className="mt-1">{orden.clientes?.nombre || "Cliente desconocido"}</p>
            </div>

            {orden.clientes?.email && (
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{orden.clientes.email}</p>
              </div>
            )}

            {orden.clientes?.telefono && (
              <div>
                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                <p className="mt-1">{orden.clientes.telefono}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
              <p className="mt-1">{formatDate(orden.created_at)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Última actualización</p>
              <p className="mt-1">{formatDate(orden.updated_at)}</p>
            </div>

            {orden.observaciones && (
              <div>
                <p className="text-sm font-medium text-gray-500">Observaciones</p>
                <p className="mt-1 whitespace-pre-line">{orden.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activos</CardTitle>
          </CardHeader>
          <CardContent>
            {orden.activos.length === 0 ? (
              <p className="text-gray-500">No hay activos asociados a esta orden</p>
            ) : (
              <div className="space-y-4">
                {orden.activos.map((activo) => (
                  <div key={activo.id} className="p-4 border rounded-md">
                    <div className="flex justify-between">
                      <Badge variant="outline">{getTipoActivoLabel(activo.tipo)}</Badge>
                      <p className="font-medium">{activo.valor ? `$${activo.valor.toLocaleString("es-AR")}` : "N/A"}</p>
                    </div>
                    <p className="mt-2">{activo.descripcion || "Sin descripción"}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 justify-end mt-6">
        {orden.estado === "pendiente" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Marcar en proceso</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Actualizar estado a En Proceso</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="mb-4">¿Deseas añadir alguna observación?</p>
                <Textarea
                  value={nuevaObservacion}
                  onChange={(e) => setNuevaObservacion(e.target.value)}
                  placeholder="Observaciones (opcional)"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={() => handleUpdateEstado("en_proceso")} disabled={isUpdating}>
                  {isUpdating ? "Actualizando..." : "Confirmar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {orden.estado === "en_proceso" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Marcar completada</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Completar orden</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="mb-4">¿Deseas añadir alguna observación?</p>
                <Textarea
                  value={nuevaObservacion}
                  onChange={(e) => setNuevaObservacion(e.target.value)}
                  placeholder="Observaciones (opcional)"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={() => handleUpdateEstado("completada")} disabled={isUpdating}>
                  {isUpdating ? "Actualizando..." : "Confirmar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {(orden.estado === "pendiente" || orden.estado === "en_proceso") && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                Cancelar orden
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancelar orden</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="mb-4">¿Deseas añadir alguna observación sobre la cancelación?</p>
                <Textarea
                  value={nuevaObservacion}
                  onChange={(e) => setNuevaObservacion(e.target.value)}
                  placeholder="Motivo de cancelación (opcional)"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Volver</Button>
                </DialogClose>
                <Button variant="destructive" onClick={() => handleUpdateEstado("cancelada")} disabled={isUpdating}>
                  {isUpdating ? "Cancelando..." : "Confirmar cancelación"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Eliminar orden</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar orden</DialogTitle>
            </DialogHeader>
            <div className="py-4 flex items-start space-x-4">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">¿Estás seguro de que deseas eliminar esta orden?</p>
                <p className="text-sm text-gray-500 mt-1">
                  Esta acción no se puede deshacer. Se eliminarán todos los activos asociados a esta orden.
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteOrden} disabled={isDeleting}>
                {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
