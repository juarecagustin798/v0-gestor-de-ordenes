"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { IndividualOrderForm } from "./order-forms/individual-order-form"
import { BulkOrderForm } from "./order-forms/bulk-order-form"
import { SwapOrderForm } from "./order-forms/swap-order-form"
import { orderFormSchema, type OrderFormValues } from "@/lib/types-order-form"
import { createOrders } from "@/lib/actions"
import type { Client, Asset } from "@/lib/types"

interface OrderCreationFormProps {
  clients: Client[]
  assets: Asset[]
}

export function OrderCreationForm({ clients, assets }: OrderCreationFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"individual" | "bulk" | "swap">("individual")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Configurar el formulario con react-hook-form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      mode: "individual",
      data: {
        clientId: "",
        ticker: "",
        type: "Compra",
        quantity: 0,
        priceType: "money",
        price: 0,
        usePriceBands: false,
        plazo: "24hs",
        mercado: "BYMA",
        notes: "",
      },
    },
  })

  // Manejar el cambio de pestaña
  const handleTabChange = (value: string) => {
    if (value === "individual" || value === "bulk" || value === "swap") {
      setActiveTab(value)
      form.setValue("mode", value)
    }
  }

  // Manejar el envío del formulario
  const onSubmit = async (values: OrderFormValues) => {
    try {
      setIsSubmitting(true)

      // Llamar a la acción del servidor para crear las órdenes
      const result = await createOrders(values)

      if (result.success) {
        toast({
          title: "Órdenes creadas",
          description: result.message || "Las órdenes han sido creadas exitosamente.",
        })

        // Redirigir al dashboard o a la página de detalles
        if (result.orderId) {
          console.log("Redirigiendo a la página de detalles de la orden:", result.orderId)
          router.push(`/orders/${result.orderId}`)
        } else {
          console.log("Redirigiendo al listado de órdenes")
          router.push("/orders")
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Hubo un error al crear las órdenes.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al crear órdenes:", error)
      toast({
        title: "Error",
        description: "Hubo un error al crear las órdenes.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Orden</CardTitle>
        <CardDescription>Selecciona el tipo de orden que deseas crear.</CardDescription>
      </CardHeader>
      <CardContent>
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
            />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkOrderForm
              form={form}
              clients={clients}
              assets={assets}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="swap">
            <SwapOrderForm
              form={form}
              clients={clients}
              assets={assets}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

