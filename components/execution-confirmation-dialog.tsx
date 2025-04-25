"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ExecutionConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (completeInfo: boolean) => void
  orderCount: number
}

export function ExecutionConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  orderCount,
}: ExecutionConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ejecutar {orderCount > 1 ? `${orderCount} órdenes` : "orden"}</DialogTitle>
          <DialogDescription>
            {orderCount > 1
              ? "Está a punto de marcar varias órdenes como ejecutadas."
              : "Está a punto de marcar esta orden como ejecutada."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p>¿Desea completar información adicional sobre {orderCount > 1 ? "las órdenes" : "la orden"}?</p>
          <p className="text-sm text-muted-foreground mt-2">
            Si selecciona "No", {orderCount > 1 ? "las órdenes serán marcadas" : "la orden será marcada"} como
            ejecutada(s) sin información adicional.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={() => onConfirm(false)}>
            No, ejecutar sin información
          </Button>
          <Button onClick={() => onConfirm(true)}>Sí, completar información</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

