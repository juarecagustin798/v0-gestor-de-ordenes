"use client"

import { useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { type OrderFormValues, PlazoEnum, MercadoEnum, OrderTypeEnum } from "@/lib/types-order-form"
import { ClientSelect } from "../selectors/client-select"
import { AssetSelect } from "../selectors/asset-select"
import type { Client, Asset } from "@/lib/types"

interface IndividualOrderFormProps {
  form: UseFormReturn<OrderFormValues>
  clients: Client[]
  assets: Asset[]
  onSubmit: (values: OrderFormValues) => void
  isSubmitting: boolean
}

export function IndividualOrderForm({ form, clients, assets, onSubmit, isSubmitting }: IndividualOrderFormProps) {
  // Asegurarse de que el modo esté configurado correctamente
  useEffect(() => {
    form.setValue("mode", "individual")
  }, [form])

  // Manejar el cambio de ticker para autocompletar el precio
  const handleTickerChange = (ticker: string) => {
    const asset = assets.find((a) => a.ticker === ticker)
    if (asset) {
      form.setValue("data.price", asset.lastPrice)
    }
  }

  // Manejar el cambio en usePriceBands
  const handlePriceBandsChange = (checked: boolean) => {
    if (checked) {
      const currentPrice = form.getValues("data.price")
      form.setValue("data.minPrice", currentPrice * 0.95) // 5% menos
      form.setValue("data.maxPrice", currentPrice * 1.05) // 5% más
    }
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
              <FormDescription>Selecciona el cliente para el cual deseas crear la orden.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="data.ticker"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activo</FormLabel>
                <AssetSelect
                  assets={assets}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    handleTickerChange(value)
                  }}
                />
                <FormDescription>Selecciona el activo para la orden.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Operación</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de operación" />
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
                <FormDescription>Selecciona si es una orden de compra o venta.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>Ingresa la cantidad de unidades.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.priceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Precio</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de precio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="money">Moneda ($)</SelectItem>
                    <SelectItem value="yield">Rendimiento (%)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Selecciona si el precio es en moneda o rendimiento.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>
                  Ingresa el precio {form.watch("data.priceType") === "money" ? "en moneda" : "de rendimiento"}.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.usePriceBands"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Usar bandas de precio</FormLabel>
                  <FormDescription>Permite especificar un rango de precios para la orden.</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      handlePriceBandsChange(checked)
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {form.watch("data.usePriceBands") && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="data.minPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Mínimo</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>Precio mínimo aceptable.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.maxPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Máximo</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>Precio máximo aceptable.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="data.plazo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plazo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el plazo" />
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
                <FormDescription>Selecciona el plazo de la operación.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.mercado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mercado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el mercado" />
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
                <FormDescription>Selecciona el mercado para la operación.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="data.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ingrese notas adicionales para esta orden..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Notas adicionales para la orden (opcional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando orden..." : "Crear Orden"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

