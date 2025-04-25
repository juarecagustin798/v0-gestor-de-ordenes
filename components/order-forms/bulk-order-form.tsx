"use client"

import { useEffect } from "react"
import { type UseFormReturn, useFieldArray } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type OrderFormValues, PlazoEnum, MercadoEnum, OrderTypeEnum } from "@/lib/types-order-form"
import { ClientSelect } from "../selectors/client-select"
import { AssetSelect } from "../selectors/asset-select"
import { Plus, Trash2 } from "lucide-react"
import type { Client, Asset } from "@/lib/types"

interface BulkOrderFormProps {
  form: UseFormReturn<OrderFormValues>
  clients: Client[]
  assets: Asset[]
  onSubmit: (values: OrderFormValues) => void
  isSubmitting: boolean
}

export function BulkOrderForm({ form, clients, assets, onSubmit, isSubmitting }: BulkOrderFormProps) {
  // Asegurarse de que el modo esté configurado correctamente
  useEffect(() => {
    form.setValue("mode", "bulk")

    // Inicializar con al menos una orden vacía si no hay órdenes
    if (!form.getValues("data.orders") || form.getValues("data.orders").length === 0) {
      form.setValue("data", {
        clientId: "",
        orders: [
          {
            ticker: "",
            type: "Compra",
            quantity: 0,
            priceType: "money",
            price: 0,
            usePriceBands: false,
            plazo: "24hs",
            mercado: "BYMA",
          },
        ],
        notes: "",
      })
    }
  }, [form])

  // Configurar el array de campos para las órdenes
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "data.orders",
  })

  // Manejar el cambio de ticker para autocompletar el precio
  const handleTickerChange = (ticker: string, index: number) => {
    const asset = assets.find((a) => a.ticker === ticker)
    if (asset) {
      form.setValue(`data.orders.${index}.price`, asset.lastPrice)
    }
  }

  // Manejar el cambio en usePriceBands
  const handlePriceBandsChange = (checked: boolean, index: number) => {
    if (checked) {
      const currentPrice = form.getValues(`data.orders.${index}.price`)
      form.setValue(`data.orders.${index}.minPrice`, currentPrice * 0.95) // 5% menos
      form.setValue(`data.orders.${index}.maxPrice`, currentPrice * 1.05) // 5% más
    }
  }

  // Añadir una nueva orden
  const addOrder = () => {
    append({
      ticker: "",
      type: "Compra",
      quantity: 0,
      priceType: "money",
      price: 0,
      usePriceBands: false,
      plazo: "24hs",
      mercado: "BYMA",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="data.clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <ClientSelect clients={clients} value={field.value} onChange={field.onChange} />
              <FormDescription>Selecciona el cliente para el cual deseas crear las órdenes.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Órdenes</h3>
            <Button type="button" variant="outline" size="sm" onClick={addOrder}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Orden
            </Button>
          </div>

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
                    name={`data.orders.${index}.ticker`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activo</FormLabel>
                        <AssetSelect
                          assets={assets}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value)
                            handleTickerChange(value, index)
                          }}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`data.orders.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(OrderTypeEnum.enum).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`data.orders.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`data.orders.${index}.priceType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Precio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo de precio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="money">Moneda ($)</SelectItem>
                            <SelectItem value="yield">Rendimiento (%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`data.orders.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`data.orders.${index}.usePriceBands`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Bandas de precio</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              handlePriceBandsChange(checked, index)
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch(`data.orders.${index}.usePriceBands`) && (
                  <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`data.orders.${index}.minPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Mínimo</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`data.orders.${index}.maxPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Máximo</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`data.orders.${index}.plazo`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plazo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Plazo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(PlazoEnum.enum).map((plazo) => (
                              <SelectItem key={plazo} value={plazo}>
                                {plazo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`data.orders.${index}.mercado`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mercado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Mercado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(MercadoEnum.enum).map((mercado) => (
                              <SelectItem key={mercado} value={mercado}>
                                {mercado}
                              </SelectItem>
                            ))}
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
          name="data.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ingrese notas adicionales para estas órdenes..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Notas adicionales para las órdenes (opcional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando órdenes..." : "Crear Órdenes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

