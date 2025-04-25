"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { IndividualOrderForm } from "./order-forms/individual-order-form"
import { BulkOrderForm } from "./order-forms/bulk-order-form"
import { SwapOrderForm } from "./order-forms/swap-order-form"
import { orderFormSchema, type OrderFormValues } from "@/lib/types-order-form"
import { createOrders } from "@/lib/actions"
import type { Client, Asset } from "@/lib/types"
import { MultiClientSelect } from "./selectors/multi-client-select"
import { ClientOrderDetailsDialog, type ClientOrderDetail } from "./order-forms/client-order-details-dialog"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface OrderCreationFormProps {
  clients: Client[]
  assets: Asset[]
}

export function OrderCreationForm({ clients, assets }: OrderCreationFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"individual" | "bulk" | "swap">("individual")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMultiClientMode, setIsMultiClientMode] = useState(false)
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [clientOrderDetails, setClientOrderDetails] = useState<ClientOrderDetail[]>([])
  const [inputMode, setInputMode] = useState<"amount" | "percentage">("amount")

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      data: {
        price: 0,
        assetId: assets[0]?.id || "",
        clientId: clients[0]?.id || "",
        quantity: 1,
        percentage: 0,
      },
      type: "individual",
    },
  })

  const handleTabChange = (value: "individual" | "bulk" | "swap") => {
    setActiveTab(value)
  }

  async function onSubmit(data: OrderFormValues) {
    setIsSubmitting(true)

    try {
      if (isMultiClientMode) {
        const orders = selectedClientIds.map((clientId) => {
          const clientDetail = clientOrderDetails.find((detail) => detail.clientId === clientId)
          const price = clientDetail?.price || data.data.price
          const percentage = clientDetail?.percentage || data.data.percentage
          const quantity = clientDetail?.quantity || data.data.quantity

          return {
            ...data,
            data: {
              ...data.data,
              clientId: clientId,
              price: price,
              percentage: percentage,
              quantity: quantity,
            },
          }
        })

        await createOrders(orders)
        toast({
          title: "Ordenes creadas exitosamente.",
        })
      } else {
        await createOrders([data])
        toast({
          title: "Orden creada exitosamente.",
        })
      }

      router.refresh()
    } catch (error) {
      toast({
        title: "Algo salió mal. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Crear Orden</CardTitle>
            <CardDescription>Selecciona el tipo de orden que deseas crear.</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="multi-client-mode" checked={isMultiClientMode} onCheckedChange={setIsMultiClientMode} />
            <Label htmlFor="multi-client-mode">Modo multi cuentas</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isMultiClientMode && (
          <div className="mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Selección de clientes</h3>
              {selectedClientIds.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setDetailsDialogOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Ajustar detalles por cliente
                </Button>
              )}
            </div>
            <MultiClientSelect
              clients={clients}
              selectedClientIds={selectedClientIds}
              onChange={setSelectedClientIds}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="bulk">Masiva</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <IndividualOrderForm
              form={form}
              clients={clients}
              assets={assets}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              isMultiClientMode={isMultiClientMode}
              onInputModeChange={setInputMode}
              selectedClientIds={selectedClientIds}
            />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkOrderForm
              form={form}
              clients={clients}
              assets={assets}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              isMultiClientMode={isMultiClientMode}
              selectedClientIds={selectedClientIds}
            />
          </TabsContent>

          <TabsContent value="swap">
            <SwapOrderForm
              form={form}
              clients={clients}
              assets={assets}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              isMultiClientMode={isMultiClientMode}
              selectedClientIds={selectedClientIds}
            />
          </TabsContent>
        </Tabs>

        {/* Diálogo para ajustar detalles por cliente */}
        <ClientOrderDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          clients={clients}
          orderDetails={clientOrderDetails}
          onSave={setClientOrderDetails}
          basePrice={form.watch("data.price") || 0}
          isAmountMode={inputMode === "amount"}
        />
      </CardContent>
    </Card>
  )
}
