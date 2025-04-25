"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ClientSelect } from "@/components/selectors/client-select"
import { AssetSelect } from "@/components/selectors/asset-select"
import { Loader2, Calculator } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createOrder } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Client, Asset } from "@/lib/types"

// Esquema de validación para el formulario
const formSchema = z
  .object({
    clientId: z.string().min(1, "Debe seleccionar un cliente"),
    assetId: z.string().min(1, "Debe seleccionar un activo"),
    inputMode: z.enum(["quantity", "amount"]),
    quantity: z.coerce.number().optional(),
    amount: z.coerce.number().optional(),
    price: z.coerce.number().min(0, "El precio no puede ser negativo"),
    mercado: z.enum(["BYMA", "A3", "SENEBI/SISTACO", "EXTERIOR"]),
    plazo: z.enum(["CI", "24hs"]),
    observations: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.inputMode === "quantity") {
        return data.quantity !== undefined && data.quantity > 0
      } else {
        return data.amount !== undefined && data.amount > 0
      }
    },
    {
      message: "Debe ingresar un valor válido según el modo seleccionado",
      path: ["quantity"],
    },
  )

type FormValues = z.infer<typeof formSchema>

export function IndividualOrderForm({
  form,
  clients,
  assets,
  onSubmit,
  isSubmitting,
  isMultiClientMode = false,
  onInputModeChange,
  selectedClientIds = [],
}: {
  form: any
  clients: Client[]
  assets: Asset[]
  onSubmit: (values: any) => void
  isSubmitting: boolean
  isMultiClientMode?: boolean
  onInputModeChange?: (mode: "quantity" | "amount") => void
  selectedClientIds?: string[]
}) {
  const router = useRouter()
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined)
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>(undefined)

  // Inicializar el formulario si no se proporciona uno
  const localForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      assetId: "",
      inputMode: "quantity",
      quantity: 1,
      amount: 0,
      price: 0,
      mercado: "BYMA",
      plazo: "24hs",
      observations: "",
    },
  })

  // Usar el formulario proporcionado o el local
  const formToUse = form || localForm

  // Efecto para calcular el monto cuando cambia la cantidad o el precio
  useEffect(() => {
    const quantity = formToUse.watch("quantity") || 0
    const price = formToUse.watch("price") || 0
    const inputMode = formToUse.watch("inputMode")

    if (inputMode === "quantity" && quantity > 0 && price > 0) {
      formToUse.setValue("amount", quantity * price)
    }
  }, [formToUse.watch("quantity"), formToUse.watch("price"), formToUse.watch("inputMode")])

  // Efecto para calcular la cantidad cuando cambia el monto o el precio
  useEffect(() => {
    const amount = formToUse.watch("amount") || 0
    const price = formToUse.watch("price") || 0
    const inputMode = formToUse.watch("inputMode")

    if (inputMode === "amount" && amount > 0 && price > 0) {
      formToUse.setValue("quantity", Math.floor(amount / price))
    }
  }, [formToUse.watch("amount"), formToUse.watch("price"), formToUse.watch("inputMode")])

  // Efecto para notificar cambios en el modo de entrada
  useEffect(() => {
    if (onInputModeChange) {
      onInputModeChange(formToUse.watch("inputMode"))
    }
  }, [formToUse.watch("inputMode"), onInputModeChange])

  // Manejar el cambio de activo
  const handleAssetChange = (value: string) => {
    formToUse.setValue("assetId", value)

    // Buscar el activo seleccionado
    const asset = assets.find((a) => a.ticker === value)
    if (asset) {
      setSelectedAsset(asset)
      // Actualizar el precio con el último precio del activo
      formToUse.setValue("price", asset.lastPrice)
    }
  }

  // Manejar el cambio de modo de entrada
  const handleInputModeChange = (value: "quantity" | "amount") => {
    formToUse.setValue("inputMode", value)

    // Recalcular el valor correspondiente
    const quantity = formToUse.watch("quantity") || 0
    const amount = formToUse.watch("amount") || 0
    const price = formToUse.watch("price") || 0

    if (value === "quantity" && price > 0) {
      // Si cambiamos a modo cantidad, calculamos la cantidad basada en el monto
      if (amount > 0) {
        formToUse.setValue("quantity", Math.floor(amount / price))
      }
    } else if (value === "amount" && price > 0) {
      // Si cambiamos a modo monto, calculamos el monto basado en la cantidad
      if (quantity > 0) {
        formToUse.setValue("amount", quantity * price)
      }
    }
  }

  // Manejar el envío del formulario local si no se proporciona onSubmit
  const handleLocalSubmit = async (data: FormValues) => {
    try {
      const orderData = {
        clientId: data.clientId,
        clientName: selectedClient?.denominacion || selectedClient?.titular || "Cliente sin nombre",
        assetId: data.assetId,
        quantity: data.quantity || Math.floor((data.amount || 0) / (data.price || 1)),
        price: data.price,
        mercado: data.mercado,
        plazo: data.plazo,
        observations: data.observations,
      }

      const result = await createOrder(orderData)

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Orden creada exitosamente",
        })
        router.push("/orders")
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la orden",
        variant: "destructive",
      })
    }
  }

  // Manejar la selección de cliente
  const handleClientChange = (value: string, client?: Client) => {
    formToUse.setValue("clientId", value)
    setSelectedClient(client)
  }

  return (
    <Form {...formToUse}>
      <form onSubmit={formToUse.handleSubmit(onSubmit || handleLocalSubmit)} className="space-y-6">
        {!isMultiClientMode && (
          <FormField
            control={formToUse.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <ClientSelect
                  clients={clients}
                  value={field.value}
                  onChange={handleClientChange}
                  disabled={isSubmitting}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={formToUse.control}
          name="assetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activo</FormLabel>
              <AssetSelect assets={assets} value={field.value} onChange={handleAssetChange} disabled={isSubmitting} />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <FormField
            control={formToUse.control}
            name="inputMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                <FormLabel>Ingresar por monto</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value === "amount"}
                    onCheckedChange={(checked) => handleInputModeChange(checked ? "amount" : "quantity")}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {formToUse.watch("inputMode") === "quantity" ? (
            <FormField
              control={formToUse.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      disabled={isSubmitting || formToUse.watch("inputMode") === "amount"}
                      onChange={(e) => {
                        field.onChange(e)
                        // Actualizar el monto cuando cambia la cantidad
                        const quantity = Number.parseFloat(e.target.value) || 0
                        const price = formToUse.watch("price") || 0
                        if (quantity > 0 && price > 0) {
                          formToUse.setValue("amount", quantity * price)
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={formToUse.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      disabled={isSubmitting || formToUse.watch("inputMode") === "quantity"}
                      onChange={(e) => {
                        field.onChange(e)
                        // Actualizar la cantidad cuando cambia el monto
                        const amount = Number.parseFloat(e.target.value) || 0
                        const price = formToUse.watch("price") || 0
                        if (amount > 0 && price > 0) {
                          formToUse.setValue("quantity", Math.floor(amount / price))
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={formToUse.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      field.onChange(e)
                      // Actualizar el monto o la cantidad según el modo
                      const price = Number.parseFloat(e.target.value) || 0
                      if (price > 0) {
                        if (formToUse.watch("inputMode") === "quantity") {
                          const quantity = formToUse.watch("quantity") || 0
                          if (quantity > 0) {
                            formToUse.setValue("amount", quantity * price)
                          }
                        } else {
                          const amount = formToUse.watch("amount") || 0
                          if (amount > 0) {
                            formToUse.setValue("quantity", Math.floor(amount / price))
                          }
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={formToUse.control}
            name="mercado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mercado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el mercado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BYMA">BYMA</SelectItem>
                    <SelectItem value="A3">A3</SelectItem>
                    <SelectItem value="SENEBI/SISTACO">SENEBI/SISTACO</SelectItem>
                    <SelectItem value="EXTERIOR">EXTERIOR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formToUse.control}
            name="plazo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plazo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el plazo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CI">CI</SelectItem>
                    <SelectItem value="24hs">24hs</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={formToUse.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>Notas adicionales para esta orden (opcional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || (isMultiClientMode && selectedClientIds.length === 0)}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando orden...
            </>
          ) : (
            "Crear Orden"
          )}
        </Button>
      </form>
    </Form>
  )
}
