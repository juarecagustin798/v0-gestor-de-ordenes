"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Calculator } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { Client, Asset } from "@/lib/types"
import { ClientSelect } from "@/components/selectors/client-select"
import { AssetSelect } from "@/components/selectors/asset-select"

// Esquema de validación para el formulario individual
const individualFormSchema = z
  .object({
    clientId: z.string().min(1, "Debe seleccionar un cliente"),
    assetId: z.string().min(1, "Debe seleccionar un activo"),
    operationType: z.enum(["buy", "sell", "buy_mep", "buy_ccl", "buy_canje", "sell_mep", "sell_ccl", "sell_canje"], {
      required_error: "Debe seleccionar el tipo de operación",
    }),
    inputMode: z.enum(["quantity", "amount"]),
    quantity: z.coerce.number().optional(),
    amount: z.coerce.number().optional(),
    isMarketOrder: z.boolean().default(false),
    price: z.coerce.number().optional(),
    market: z.enum(["BYMA", "A3", "SENEBI/SISTACO", "EXTERIOR"]),
    notes: z.string().optional(),
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
  .refine(
    (data) => {
      // Si es orden a mercado, no validamos el precio
      if (data.isMarketOrder) return true
      // Si no es orden a mercado, el precio debe ser mayor a 0
      return data.price !== undefined && data.price > 0
    },
    {
      message: "Debe ingresar un precio válido o seleccionar 'Orden a mercado'",
      path: ["price"],
    },
  )

type IndividualFormValues = z.infer<typeof individualFormSchema>

interface IndividualOrderFormProps {
  clients: Client[]
  assets: Asset[]
  onSubmit: (values: any) => void
  isSubmitting: boolean
  onClientChange?: (clientId: string) => void
}

export function IndividualOrderForm({
  clients,
  assets,
  onSubmit,
  isSubmitting,
  onClientChange,
}: IndividualOrderFormProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const form = useForm<IndividualFormValues>({
    resolver: zodResolver(individualFormSchema),
    defaultValues: {
      clientId: "",
      assetId: "",
      operationType: "buy",
      inputMode: "quantity",
      quantity: 1,
      amount: 0,
      price: 0,
      isMarketOrder: false,
      market: "BYMA",
      notes: "",
    },
  })

  // Calcular el monto cuando cambia la cantidad o el precio
  const calculateAmount = () => {
    if (form.watch("isMarketOrder")) return 0
    const quantity = form.watch("quantity") || 0
    const price = form.watch("price") || 0
    return quantity * price
  }

  // Calcular la cantidad cuando cambia el monto o el precio
  const calculateQuantity = () => {
    if (form.watch("isMarketOrder")) return 0
    const amount = form.watch("amount") || 0
    const price = form.watch("price") || 0
    return price > 0 ? Math.floor(amount / price) : 0
  }

  // Actualizar el monto cuando cambia la cantidad o el precio
  const updateAmount = () => {
    if (form.watch("inputMode") === "quantity") {
      const amount = calculateAmount()
      form.setValue("amount", amount)
    }
  }

  // Actualizar la cantidad cuando cambia el monto o el precio
  const updateQuantity = () => {
    if (form.watch("inputMode") === "amount") {
      const quantity = calculateQuantity()
      form.setValue("quantity", quantity)
    }
  }

  // Manejar el cambio de activo
  const handleAssetChange = (value: string) => {
    const asset = assets.find((a) => a.ticker === value || a.id === value)
    if (asset) {
      setSelectedAsset(asset)
      form.setValue("assetId", asset.id || asset.ticker)
      form.setValue("price", asset.lastPrice || 0)
      updateAmount()
    }
  }

  // Manejar el cambio de modo de entrada
  const handleInputModeChange = (checked: boolean) => {
    const newMode = checked ? "amount" : "quantity"
    form.setValue("inputMode", newMode)

    if (newMode === "quantity") {
      updateAmount()
    } else {
      updateQuantity()
    }
  }

  // Agregar esta función después de la definición del formulario
  const mapOperationTypeToDisplay = (type: string): string => {
    const typeMap: Record<string, string> = {
      buy: "Compra",
      buy_mep: "Compra MEP",
      buy_ccl: "Compra CCL",
      buy_canje: "Compra Canje",
      sell: "Venta",
      sell_mep: "Venta MEP",
      sell_ccl: "Venta CCL",
      sell_canje: "Venta Canje",
    }
    return typeMap[type] || type
  }

  // Modificar la función onSubmit para incluir el mapeo
  const handleSubmit = (values: IndividualFormValues) => {
    // Asegurarse de que el tipo de operación se mapee correctamente
    const mappedValues = {
      ...values,
      displayOperationType: mapOperationTypeToDisplay(values.operationType),
    }
    onSubmit(mappedValues)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <ClientSelect
                  clients={clients}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    onClientChange?.(value)
                  }}
                  placeholder="Seleccionar cliente..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activo</FormLabel>
              <AssetSelect
                assets={assets}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value)
                  handleAssetChange(value)
                }}
                disabled={isSubmitting}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="operationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de operación</FormLabel>
              <Select
                onValueChange={(value) => {
                  // Asignar directamente al campo operationType
                  field.onChange(value)

                  // También asignar al campo type para asegurar consistencia
                  form.setValue("type", value === "buy" ? "Compra" : "Venta")

                  console.log("Tipo de operación seleccionado:", value)
                  console.log("Tipo asignado:", value === "buy" ? "Compra" : "Venta")
                }}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="buy">Compra</SelectItem>
                  <SelectItem value="sell">Venta</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="inputMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                <FormLabel>Ingresar por monto</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value === "amount"}
                    onCheckedChange={handleInputModeChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {form.watch("inputMode") === "quantity" ? (
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      disabled={isSubmitting || form.watch("inputMode") === "amount"}
                      onChange={(e) => {
                        field.onChange(e)
                        updateAmount()
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      disabled={isSubmitting || form.watch("inputMode") === "quantity"}
                      onChange={(e) => {
                        field.onChange(e)
                        updateQuantity()
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="isMarketOrder"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                <FormLabel>Orden a mercado</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      if (checked) {
                        // Si se activa "orden a mercado", limpiamos el precio
                        form.setValue("price", undefined)
                      }
                    }}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription className="text-xs">La orden se ejecutará al mejor precio disponible</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    value={form.watch("isMarketOrder") ? "" : field.value}
                    disabled={isSubmitting || form.watch("isMarketOrder")}
                    onChange={(e) => {
                      field.onChange(e)
                      if (form.watch("inputMode") === "quantity") {
                        updateAmount()
                      } else {
                        updateQuantity()
                      }
                    }}
                  />
                </FormControl>
                {form.watch("isMarketOrder") && (
                  <FormDescription className="text-xs text-muted-foreground">
                    Precio determinado por el mercado
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="market"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mercado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mercado" />
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
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ingrese observaciones adicionales..."
                  className="resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>Notas adicionales para esta orden (opcional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
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
