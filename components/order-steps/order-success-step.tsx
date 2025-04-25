"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, FileText, Plus, Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface OrderSuccessStepProps {
  orderId: string
  onViewDetails: () => void
  onCreateAnother: () => void
  onGoToDashboard: () => void
}

export function OrderSuccessStep({ orderId, onViewDetails, onCreateAnother, onGoToDashboard }: OrderSuccessStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />

      <h2 className="text-2xl font-bold text-center">¡Orden Creada Exitosamente!</h2>
      <p className="text-muted-foreground text-center mb-6">
        La orden ha sido registrada y está lista para ser procesada.
      </p>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Detalles de la Orden</CardTitle>
          <CardDescription>Información de la orden creada.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center p-4 bg-muted rounded-md">
            <span className="font-medium">ID de la Orden:</span>
            <span className="font-bold">{orderId}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={onViewDetails}>
            <FileText className="mr-2 h-4 w-4" />
            Ver Detalles de la Orden
          </Button>
          <Button variant="outline" className="w-full" onClick={onCreateAnother}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Otra Orden
          </Button>
          <Button variant="ghost" className="w-full" onClick={onGoToDashboard}>
            <Home className="mr-2 h-4 w-4" />
            Ir al Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
