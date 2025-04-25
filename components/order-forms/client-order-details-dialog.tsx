"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Client } from "@/lib/types"

export interface ClientOrderDetail {
  clientId: string
  quantity: number
  amount: number
}

interface ClientOrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  orderDetails: ClientOrderDetail[]
  onSave: (details: ClientOrderDetail[]) => void
  basePrice: number
  isAmountMode: boolean
}

export function ClientOrderDetailsDialog({
  open,
  onOpenChange,
  clients,
  orderDetails,
  onSave,
  basePrice,
  isAmountMode,
}: ClientOrderDetailsDialogProps) {
  const [details, setDetails] = useState<ClientOrderDetail[]>(orderDetails)
  const [inputMode, setInputMode] = useState<"quantity" | "amount">(isAmountMode ? "amount" : "quantity")

  // Actualizar detalles cuando cambian los props
  useEffect(() => {
    setDetails(orderDetails)
  }, [orderDetails])

  // Actualizar el modo de entrada cuando cambia isAmountMode
  useEffect(() => {
    setInputMode(isAmountMode ? "amount" : "quantity")
  }, [isAmountMode])

  // Actualizar un detalle específico
  const updateDetail = (clientId: string, field: "quantity" | "amount", value: number) => {
    setDetails((prev) =>
      prev.map((detail) => {
        if (detail.clientId === clientId) {
          const updatedDetail = { ...detail, [field]: value }

          // Si se actualiza la cantidad, calcular el monto
          if (field === "quantity" && basePrice > 0) {
            updatedDetail.amount = value * basePrice
          }

          // Si se actualiza el monto, calcular la cantidad
          if (field === "amount" && basePrice > 0) {
            updatedDetail.quantity = Math.floor(value / basePrice)
          }

          return updatedDetail
        }
        return detail
      }),
    )
  }

  // Obtener el nombre del cliente por ID
  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : `Cliente ${clientId}`
  }

  // Guardar los cambios
  const handleSave = () => {
    onSave(details)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajustar detalles por cliente</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue={inputMode}
          value={inputMode}
          onValueChange={(value) => setInputMode(value as "quantity" | "amount")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="quantity">Editar Cantidad</TabsTrigger>
            <TabsTrigger value="amount">Editar Monto</TabsTrigger>
          </TabsList>

          <TabsContent value="quantity" className="mt-0">
            <ScrollArea className="h-[400px] w-full rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Monto (calculado)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail) => (
                    <TableRow key={detail.clientId}>
                      <TableCell>{getClientName(detail.clientId)}</TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Input
                            type="number"
                            min="1"
                            value={detail.quantity || ""}
                            onChange={(e) =>
                              updateDetail(detail.clientId, "quantity", Number.parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        }).format(detail.quantity * basePrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="amount" className="mt-0">
            <ScrollArea className="h-[400px] w-full rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Cantidad (calculada)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail) => (
                    <TableRow key={detail.clientId}>
                      <TableCell>{getClientName(detail.clientId)}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <Input
                            type="number"
                            min="1"
                            step="0.01"
                            value={detail.amount || ""}
                            onChange={(e) =>
                              updateDetail(detail.clientId, "amount", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>{basePrice > 0 ? Math.floor(detail.amount / basePrice) : 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
