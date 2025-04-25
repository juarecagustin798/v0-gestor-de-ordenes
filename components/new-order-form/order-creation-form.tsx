"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IndividualOrderForm } from "./individual-order-form"
import { BulkOrderForm } from "./bulk-order-form"
import { SwapOrderForm } from "./swap-order-form"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { crearOrdenIndividual, crearOrdenesMasivas, crearOperacionSwap } from "@/lib/actions/orden-actions"
import type { Client, Asset } from "@/lib/types"

interface OrderCreationFormProps {
  clients: Client[]
  assets: Asset[]
}

export function OrderCreationForm({ clients, assets }: OrderCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()

  const updateSelectedAccountNumber = (clientId: string) => {
    const selectedClient = clients.find((client) => client.id === clientId)
    if (selectedClient) {
      setSelectedAccountNumber(selectedClient.accountNumber || selectedClient.idCliente || "")
    } else {
      setSelectedAccountNumber("")
    }
  }

  const handleIndividualSubmit = async (values: any) => {
    setIsSubmitting(true)
    try {
      console.log("Enviando formulario individual:", values)

      // Enviar los datos a Supabase usando la nueva función
      const result = await crearOrdenIndividual({
        clientId: values.clientId,
        assetId: values.assetId,
        operationType: values.operationType,
        quantity: values.quantity,
        price: values.price || 0,
        isMarketOrder: values.isMarketOrder,
        market: values.market,
        notes: values.notes,
      })

      if (result.success) {
        toast({
          title: "Orden creada",
          description: "La orden se ha creado correctamente en Supabase",
        })

        // Redirigir al dashboard principal
        router.push("/")
        router.refresh()
      } else {
        console.error("Error al crear la orden:", result.error)
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al crear la orden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al crear la orden:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al crear la orden. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkSubmit = async (values: any) => {
    setIsSubmitting(true)
    try {
      console.log("Enviando formulario masivo:", values)

      // Enviar los datos a Supabase usando la nueva función
      const result = await crearOrdenesMasivas({
        clientId: values.clientId,
        orders: values.orders.map((order: any) => ({
          assetId: order.assetId,
          operationType: order.operationType,
          quantity: order.quantity,
          price: order.price,
          market: order.market,
          term: order.term,
        })),
        notes: values.notes,
      })

      if (result.success) {
        toast({
          title: "Órdenes creadas",
          description: result.message || "Las órdenes se han creado correctamente en Supabase",
        })

        // Redirigir al dashboard principal
        router.push("/")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al crear las órdenes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al crear las órdenes:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al crear las órdenes",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSwapSubmit = async (values: any) => {
    setIsSubmitting(true)
    try {
      console.log("Enviando formulario swap:", values)

      // Enviar los datos a Supabase usando la nueva función
      const result = await crearOperacionSwap({
        clientId: values.clientId,
        sellOrder: {
          assetId: values.sellOrder.assetId,
          quantity: values.sellOrder.quantity,
          price: values.sellOrder.price,
          market: values.sellOrder.market,
          term: values.sellOrder.term,
        },
        buyOrder: {
          assetId: values.buyOrder.assetId,
          quantity: values.buyOrder.quantity,
          price: values.buyOrder.price,
          market: values.buyOrder.market,
          term: values.buyOrder.term,
        },
        notes: values.notes,
      })

      if (result.success) {
        toast({
          title: "Operación swap creada",
          description: "La operación swap se ha creado correctamente en Supabase",
        })

        // Redirigir al dashboard principal
        router.push("/")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al crear la operación swap",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al crear la operación swap:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al crear la operación swap",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Orden</CardTitle>
        <CardDescription>Crea una nueva orden para tus clientes</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedAccountNumber && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <div className="text-sm font-medium">Número de cuenta seleccionado:</div>
            <div className="text-lg font-bold">{selectedAccountNumber}</div>
          </div>
        )}
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="bulk">Masiva</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
          </TabsList>
          <TabsContent value="individual">
            <IndividualOrderForm
              clients={clients}
              assets={assets}
              onSubmit={handleIndividualSubmit}
              isSubmitting={isSubmitting}
              onClientChange={updateSelectedAccountNumber}
            />
          </TabsContent>
          <TabsContent value="bulk">
            <BulkOrderForm
              clients={clients}
              assets={assets}
              onSubmit={handleBulkSubmit}
              isSubmitting={isSubmitting}
              onClientChange={updateSelectedAccountNumber}
            />
          </TabsContent>
          <TabsContent value="swap">
            <SwapOrderForm
              clients={clients}
              assets={assets}
              onSubmit={handleSwapSubmit}
              isSubmitting={isSubmitting}
              onClientChange={updateSelectedAccountNumber}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
