"use client"

import type { OrderFormValues, Client, Asset } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface OrderConfirmationStepProps {
  formData: OrderFormValues
  client: Client | null
  asset: Asset | null
  onConfirm: () => void
  onBack: () => void
  isSubmitting: boolean
}

export function OrderConfirmationStep({
  formData,
  client,
  asset,
  onConfirm,
  onBack,
  isSubmitting,
}: OrderConfirmationStepProps) {
  const total = formData.quantity * formData.price

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2" disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Confirmar Orden</h2>
          <p className="text-muted-foreground">Revisa y confirma los detalles de la orden.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de la Orden</CardTitle>
          <CardDescription>Verifica que todos los detalles sean correctos antes de confirmar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Información del Cliente</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground">Nombre:</div>
              <div>{client?.name}</div>
              <div className="text-muted-foreground">Documento:</div>
              <div>
                {client?.documentType} {client?.documentNumber}
              </div>
              <div className="text-muted-foreground">Cuenta:</div>
              <div>{client?.accountNumber}</div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-2">Detalles de la Operación</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground">Tipo:</div>
              <div>
                <Badge variant={formData.type === "Compra" ? "default" : "destructive"}>{formData.type}</Badge>
              </div>
              <div className="text-muted-foreground">Activo:</div>
              <div>
                {asset?.name} ({asset?.ticker})
              </div>
              <div className="text-muted-foreground">Cantidad:</div>
              <div>{formData.quantity}</div>
              <div className="text-muted-foreground">Precio:</div>
              <div>
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                }).format(formData.price)}
              </div>
              <div className="text-muted-foreground font-medium">Total:</div>
              <div className="font-bold">
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                }).format(total)}
              </div>
            </div>
          </div>

          {formData.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2">Notas</h3>
                <p className="text-sm">{formData.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Atrás
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Procesando..." : "Confirmar Orden"}
        </Button>
      </div>
    </div>
  )
}

