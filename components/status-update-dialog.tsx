"use client"

import { useState, useEffect } from "react"
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
import type { Order } from "@/lib/types"

interface StatusUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: string
  onConfirm: (params: {
    observation: string
    executedQuantity?: number
    executedPrice?: number
  }) => void
  showExecutionFields?: boolean
  currentOrder?: Order | null
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
  currentOrder = null,
  isProcessingMultiple = false,
  currentOrderIndex = 0,
  totalOrders = 0,
}: StatusUpdateDialogProps) {
  const [observation, setObservation] = useState("")
  const [executedQuantity, setExecutedQuantity] = useState<number | undefined>()
  const [executedPrice, setExecutedPrice] = useState<number | undefined>()

  // Resetear los campos cuando cambia la orden actual
  useEffect(() => {
    if (currentOrder) {
      // Inicializar con valores de la orden si están disponibles
      setExecutedQuantity(currentOrder.executedQuantity)
      setExecutedPrice(currentOrder.executedPrice)
      setObservation("")
    } else {
      setExecutedQuantity(undefined)
      setExecutedPrice(undefined)
      setObservation("")
    }
  }, [currentOrder])

  // Obtener título y descripción según el estado
  const getDialogTitle = () => {
    if (isProcessingMultiple) {
      return `Completar Información (${currentOrderIndex + 1}/${totalOrders})`
    }

    switch (status) {
      case "Tomada":
        return "Tomar Orden(es)"
      case "Ejecutada":
        return "Completar Información de Ejecución"
      case "Ejecutada parcial":
        return "Ejecutar Parcialmente Orden(es)"
      case "Revisar":
        return "Marcar para Revisar"
      case "Cancelada":
        return "Cancelar Orden(es)"
      default:
        return "Actualizar Estado"
    }
  }

  const getDialogDescription = () => {
    if (isProcessingMultiple && currentOrder) {
      return `Completando información para la orden ${currentOrder.id} - ${currentOrder.client} - ${currentOrder.ticker}`
    }

    switch (status) {
      case "Tomada":
        return "La(s) orden(es) seleccionada(s) será(n) asignada(s) a ti para su procesamiento."
      case "Ejecutada":
        return "Complete la información de ejecución para la(s) orden(es) seleccionada(s)."
      case "Ejecutada parcial":
        return "La(s) orden(es) seleccionada(s) será(n) marcada(s) como ejecutada(s) parcialmente."
      case "Revisar":
        return "La(s) orden(es) seleccionada(s) será(n) marcada(s) para revisión por parte del comercial."
      case "Cancelada":
        return "La(s) orden(es) seleccionada(s) será(n) cancelada(s)."
      default:
        return "Actualiza el estado de la(s) orden(es) seleccionada(s)."
    }
  }

  // Manejar confirmación
  const handleConfirm = () => {
    onConfirm({
      observation,
      executedQuantity: showExecutionFields ? executedQuantity : undefined,
      executedPrice: showExecutionFields ? executedPrice : undefined,
    })

    // No limpiar campos aquí, se limpiarán en el efecto cuando cambie la orden actual
  }

  // Calcular el progreso para la barra de progreso
  const progress = isProcessingMultiple ? ((currentOrderIndex + 1) / totalOrders) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {isProcessingMultiple && (
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Orden {currentOrderIndex + 1} de {totalOrders}
            </p>
          </div>
        )}

        {currentOrder && isProcessingMultiple && (
          <div className="bg-muted p-3 rounded-md mb-4">
            <h4 className="font-medium mb-2">Detalles de la orden actual:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">ID:</span>
              <span>{currentOrder.id}</span>
              <span className="text-muted-foreground">Cliente:</span>
              <span>{currentOrder.client}</span>
              <span className="text-muted-foreground">Activo:</span>
              <span>
                {currentOrder.ticker} - {currentOrder.asset}
              </span>
              <span className="text-muted-foreground">Cantidad:</span>
              <span>{currentOrder.quantity}</span>
              <span className="text-muted-foreground">Precio solicitado:</span>
              <span>
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                }).format(currentOrder.price)}
              </span>
            </div>
          </div>
        )}

        <div className="grid gap-4 py-4">
          {showExecutionFields && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="executedQuantity">Cantidad Ejecutada</Label>
                  <Input
                    id="executedQuantity"
                    type="number"
                    min="1"
                    value={executedQuantity || ""}
                    onChange={(e) => setExecutedQuantity(Number.parseInt(e.target.value) || undefined)}
                    placeholder="Ingrese la cantidad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="executedPrice">Precio Ejecutado</Label>
                  <Input
                    id="executedPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={executedPrice || ""}
                    onChange={(e) => setExecutedPrice(Number.parseFloat(e.target.value) || undefined)}
                    placeholder="Ingrese el precio"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="observation">Observaciones</Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ingrese observaciones para el comercial"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isProcessingMultiple ? "Cancelar todo" : "Cancelar"}
          </Button>
          <Button onClick={handleConfirm}>{isProcessingMultiple ? "Guardar y continuar" : "Confirmar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

