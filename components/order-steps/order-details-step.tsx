"use client"

import { useEffect, useState } from "react"
import type { OrderFormValues, Asset } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface OrderDetailsStepProps {
  formData: OrderFormValues
  selectedAsset: Asset | null
  onChange: (data: Partial<OrderFormValues>) => void
  onNext: () => void
  onBack: () => void
}

export function OrderDetailsStep({ formData, selectedAsset, onChange, onNext, onBack }: OrderDetailsStepProps) {
  const [total, setTotal] = useState(0)

  // Calcular el total cuando cambia la cantidad o el precio
  useEffect(() => {
    setTotal(formData.quantity * formData.price)
  }, [formData.quantity, formData.price])

  // Validar que los campos requeridos estén completos
  const isValid = formData.type && formData.quantity > 0 && formData.price > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Detalles de la Orden</h2>
          <p className="text-muted-foreground">Completa los detalles de la orden.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Operación</Label>
            <Select value={formData.type} onValueChange={(value) => onChange({ type: value as "Compra" | "Venta" })}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Seleccione el tipo de operación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compra">Compra</SelectItem>
                <SelectItem value="Venta">Venta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity || ""}
              onChange={(e) => onChange({ quantity: Number.parseInt(e.target.value) || 0 })}
              placeholder="Ingrese la cantidad"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price || ""}
              onChange={(e) => onChange({ price: Number.parseFloat(e.target.value) || 0 })}
              placeholder="Ingrese el precio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="Ingrese notas adicionales (opcional)"
              rows={4}
            />
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la Orden</CardTitle>
              <CardDescription>Revisa los detalles antes de continuar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Activo:</span>
                <span>
                  {selectedAsset?.name} ({selectedAsset?.ticker})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tipo:</span>
                <span>{formData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cantidad:</span>
                <span>{formData.quantity || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Precio:</span>
                <span>
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  }).format(formData.price || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-4 border-t">
                <span className="font-bold">Total:</span>
                <span className="font-bold">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  }).format(total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Continuar
        </Button>
      </div>
    </div>
  )
}

