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
          <DialogTitle>Confirmar ejecución</DialogTitle>
          <DialogDescription>
            {orderCount === 1
              ? "¿Deseas completar información adicional para esta orden?"
              : `¿Deseas completar información adicional para estas ${orderCount} órdenes?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onConfirm(false)} className="sm:flex-1">
            No, ejecutar directamente
          </Button>
          <Button onClick={() => onConfirm(true)} className="sm:flex-1">
            Sí, completar información
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
