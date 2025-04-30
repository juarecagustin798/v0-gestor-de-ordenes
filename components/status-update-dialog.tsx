"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import type { Orden } from "@/lib/types/orden.types"

interface StatusUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: string
  onConfirm: (params: { observation: string; executedQuantity?: number; executedPrice?: number }) => void
  showExecutionFields?: boolean
  currentOrder?: Orden | null
  isProcessingMultiple?: boolean
  currentOrderIndex?: number
  totalOrders?: number
}

export function StatusUpdateDialog({
  open,
  onOpenChange,
  status,
  onConfirm,
  showExecutionFields = false,
  currentOrder,
  isProcessingMultiple = false,
  currentOrderIndex = 0,
  totalOrders = 0,
}: StatusUpdateDialogProps) {
  const [observation, setObservation] = useState("")
  const [executedQuantity, setExecutedQuantity] = useState<number | undefined>(undefined)
  const [executedPrice, setExecutedPrice] = useState<number | undefined>(undefined)

  // Resetear los campos cuando se abre el diálogo
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Solo resetear si no estamos en proceso múltiple o si es el último
      if (!isProcessingMultiple || currentOrderIndex === totalOrders - 1) {
        setObservation("")
        setExecutedQuantity(undefined)
        setExecutedPrice(undefined)
      }
    }
    onOpenChange(open)
  }

  const handleConfirm = () => {
    onConfirm({
      observation,
      ...(showExecutionFields && {
        executedQuantity,
        executedPrice,
      }),
    })

    // Solo resetear si no estamos en proceso múltiple o si es el último
    if (!isProcessingMultiple || currentOrderIndex === totalOrders - 1) {
      setObservation("")
      setExecutedQuantity(undefined)
      setExecutedPrice(undefined)
    }
  }

  // Determinar el título y descripción según el estado
  let title = `Actualizar estado a ${status}`
  let description = "Ingresa una observación para este cambio de estado."

  if (status === "Tomada") {
    title = "Tomar orden"
    description = "La orden será asignada a ti. Puedes agregar una observación opcional."
  } else if (status === "Ejecutada") {
    title = "Ejecutar orden"
    description = "Confirma la ejecución de la orden e ingresa los detalles."
  } else if (status === "Ejecutada parcial") {
    title = "Ejecutar parcialmente"
    description = "Ingresa la cantidad y precio de ejecución parcial."
  } else if (status === "Revisar") {
    title = "Marcar para revisión"
    description = "Indica el motivo por el que esta orden requiere revisión."
  } else if (status === "Cancelada") {
    title = "Cancelar orden"
    description = "Indica el motivo de la cancelación."
  }

  // Si estamos procesando múltiples órdenes, actualizar el título
  if (isProcessingMultiple && totalOrders > 1) {
    title = `${title} (${currentOrderIndex + 1} de ${totalOrders})`
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isProcessingMultiple && totalOrders > 1 && (
          <div className="mb-4">
            <Progress value={((currentOrderIndex + 1) / totalOrders) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Procesando orden {currentOrderIndex + 1} de {totalOrders}
            </p>
          </div>
        )}

        {currentOrder && (
          <div className="grid gap-2 mb-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Detalles de la orden actual:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-muted-foreground">Cliente:</span>
              <span>{currentOrder.cliente_nombre}</span>
              <span className="text-muted-foreground">Tipo:</span>
              <span>{currentOrder.tipo_operacion}</span>
              {currentOrder.detalles && currentOrder.detalles.length > 0 && (
                <>
                  <span className="text-muted-foreground">Ticker:</span>
                  <span>{currentOrder.detalles[0].ticker}</span>
                  <span className="text-muted-foreground">Cantidad:</span>
                  <span>{currentOrder.detalles[0].cantidad}</span>
                  <span className="text-muted-foreground">Precio:</span>
                  <span>
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(currentOrder.detalles[0].precio || 0)}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="observation">Observación</Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ingresa una observación..."
              className="resize-none"
              rows={3}
              required={status === "Cancelada" || status === "Revisar"}
            />
          </div>

          {showExecutionFields && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="executedQuantity">Cantidad ejecutada</Label>
                <Input
                  id="executedQuantity"
                  type="number"
                  value={executedQuantity === undefined ? "" : executedQuantity}
                  onChange={(e) => setExecutedQuantity(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ingresa la cantidad ejecutada"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="executedPrice">Precio de ejecución</Label>
                <Input
                  id="executedPrice"
                  type="number"
                  step="0.01"
                  value={executedPrice === undefined ? "" : executedPrice}
                  onChange={(e) => setExecutedPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ingresa el precio de ejecución"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={status === "Cancelada" && !observation}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
