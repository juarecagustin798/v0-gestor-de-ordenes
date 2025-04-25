"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Client, Asset } from "@/lib/types"
import { ClientSelect } from "@/components/selectors/client-select"
import { AssetSelect } from "@/components/selectors/asset-select"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

// Esquema para una orden individual en la carga masiva
const bulkOrderItemSchema = z
  .object({
    assetId: z.string().min(1, "Debe seleccionar un activo"),
    operationType: z.enum(["buy", "sell"], {
      required_error: "Debe seleccionar el tipo de operación",
    }),
    quantity: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
    isMarketOrder: z.boolean().default(false),
    price: z.coerce.number().optional(),
    market: z.enum(["BYMA", "A3", "SENEBI/SISTACO", "EXTERIOR"]),
  })
  .refine(
    (data) => {
      // Si no es orden a mercado, el precio es obligatorio
      return data.isMarketOrder || (data.price && data.price > 0)
    },
    {
      message: "Debe especificar un precio o marcar como 'A mercado'",
      path: ["price"],
    },
  )

// Esquema de validación para el formulario de carga masiva
const bulkFormSchema = z.object({
  clientId: z.string().min(1, "Debe seleccionar un cliente"),
  orders: z.array(bulkOrderItemSchema).min(1, "Debe agregar al menos una orden"),
  notes: z.string().optional(),
})

type BulkFormValues = z.infer<typeof bulkFormSchema>

interface BulkOrderFormProps {
  clients: Client[]
  assets: Asset[]
  onSubmit: (values: any) => void
  isSubmitting: boolean
  onClientChange?: (clientId: string) => void
}

export function BulkOrderForm({ clients, assets, onSubmit, isSubmitting, onClientChange }: BulkOrderFormProps) {
  const form = useForm<BulkFormValues>({
    resolver: zodResolver(bulkFormSchema),
    defaultValues: {
      clientId: "",
      orders: [
        {
          assetId: "",
          operationType: "buy",
          quantity: 1,
          isMarketOrder: false,
          price: 0,
          market: "BYMA",
        },
      ],
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orders",
  })

  // Estado para el checkbox global "A mercado"
  const [allMarketOrders, setAllMarketOrders] = useState(false)

  // Función para marcar/desmarcar todas las órdenes como "A mercado"
  const toggleAllMarketOrders = (checked: boolean) => {
    setAllMarketOrders(checked)
    const currentOrders = form.getValues("orders")
    currentOrders.forEach((_, index) => {
      form.setValue(`orders.${index}.isMarketOrder`, checked)
      if (checked) {
        form.clearErrors(`orders.${index}.price`)
      }
    })
  }

  // Manejar el cambio de activo
  const handleAssetChange = (value: string, index: number) => {
    const asset = assets.find((a) => a.ticker === value || a.id === value)
    if (asset) {
      form.setValue(`orders.${index}.assetId`, asset.id || asset.ticker)
      form.setValue(`orders.${index}.price`, asset.lastPrice || 0)
    }
  }

  // Añadir una nueva orden
  const addOrder = () => {
    append({
      assetId: "",
      operationType: "buy",
      quantity: 1,
      isMarketOrder: allMarketOrders,
      price: 0,
      market: "BYMA",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <Separator className="my-4" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Órdenes</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="all-market-orders" checked={allMarketOrders} onCheckedChange={toggleAllMarketOrders} />
              <label htmlFor="all-market-orders" className="text-sm font-medium cursor-pointer">
                Todas las órdenes a mercado
              </label>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addOrder} disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Orden
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Orden #{index + 1}</CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isSubmitting}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar orden</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`orders.${index}.assetId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activo</FormLabel>
                        <AssetSelect
                          assets={assets}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value)
                            handleAssetChange(value, index)
                          }}
                          disabled={isSubmitting}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`orders.${index}.operationType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo" />
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

                  <FormField
                    control={form.control}
                    name={`orders.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`orders.${index}.isMarketOrder`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              if (checked) {
                                form.clearErrors(`orders.${index}.price`)
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>A mercado</FormLabel>
                          <FormDescription>La orden se ejecutará al mejor precio disponible</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`orders.${index}.price`}
                    render={({ field }) => {
                      const isMarketOrder = form.watch(`orders.${index}.isMarketOrder`)
                      return (
                        <FormItem>
                          <FormLabel>Precio</FormLabel>
                          {isMarketOrder ? (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                              A mercado
                            </div>
                          ) : (
                            <FormControl>
                              <Input type="number" step="0.01" {...field} disabled={isSubmitting} />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <FormField
                    control={form.control}
                    name={`orders.${index}.market`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mercado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Mercado" />
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
              </CardContent>
            </Card>
          ))}
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
              <FormDescription>Notas adicionales para estas órdenes (opcional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando órdenes...
            </>
          ) : (
            "Crear Órdenes"
          )}
        </Button>
      </form>
    </Form>
  )
}
