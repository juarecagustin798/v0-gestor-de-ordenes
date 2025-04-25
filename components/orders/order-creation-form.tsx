"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createOrden } from "@/lib/services/orden-service"
import { PlusCircle, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Cliente = {
  id: string
  nombre: string
}

type Activo = {
  id: string
  tipo: string
  descripcion: string
  valor: string
}

export function OrderCreationForm({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter()
  const [clienteId, setClienteId] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [activos, setActivos] = useState<Activo[]>([{ id: "1", tipo: "", descripcion: "", valor: "" }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddActivo = () => {
    setActivos([
      ...activos,
      {
        id: Date.now().toString(),
        tipo: "",
        descripcion: "",
        valor: "",
      },
    ])
  }

  const handleRemoveActivo = (id: string) => {
    if (activos.length > 1) {
      setActivos(activos.filter((activo) => activo.id !== id))
    }
  }

  const handleActivoChange = (id: string, field: keyof Activo, value: string) => {
    setActivos(activos.map((activo) => (activo.id === id ? { ...activo, [field]: value } : activo)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("cliente_id", clienteId)
      formData.append("observaciones", observaciones)

      activos.forEach((activo, index) => {
        formData.append("tipo", activo.tipo)
        formData.append("descripcion", activo.descripcion)
        formData.append("valor", activo.valor)
      })

      const result = await createOrden(formData)

      if (result.success) {
        router.push("/ordenes")
      } else {
        alert(`Error al crear la orden: ${result.error}`)
      }
    } catch (error) {
      console.error("Error al crear la orden:", error)
      alert("Ocurrió un error al crear la orden")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Select value={clienteId} onValueChange={setClienteId} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Activos</h3>
          <Button type="button" variant="outline" size="sm" onClick={handleAddActivo}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Añadir Activo
          </Button>
        </div>

        {activos.map((activo, index) => (
          <Card key={activo.id}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`tipo-${activo.id}`}>Tipo</Label>
                  <Select
                    value={activo.tipo}
                    onValueChange={(value) => handleActivoChange(activo.id, "tipo", value)}
                    required
                  >
                    <SelectTrigger id={`tipo-${activo.id}`}>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acciones">Acciones</SelectItem>
                      <SelectItem value="bonos">Bonos</SelectItem>
                      <SelectItem value="fondos">Fondos</SelectItem>
                      <SelectItem value="criptomonedas">Criptomonedas</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`descripcion-${activo.id}`}>Descripción</Label>
                  <Input
                    id={`descripcion-${activo.id}`}
                    value={activo.descripcion}
                    onChange={(e) => handleActivoChange(activo.id, "descripcion", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`valor-${activo.id}`}>Valor</Label>
                  <div className="flex">
                    <Input
                      id={`valor-${activo.id}`}
                      type="number"
                      step="0.01"
                      value={activo.valor}
                      onChange={(e) => handleActivoChange(activo.id, "valor", e.target.value)}
                      required
                      className="flex-1"
                    />
                    {activos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveActivo(activo.id)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear Orden"}
        </Button>
      </div>
    </form>
  )
}
