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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type OrderFormValues, PlazoEnum, MercadoEnum } from "@/lib/types-order-form"
import { ClientSelect } from "../selectors/client-select"
import { AssetSelect } from "../selectors/asset-select"
import { ArrowDownUp, InfoIcon } from "lucide-react"
import type { Client, Asset } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SwapOrderFormProps {
  form: UseFormReturn<OrderFormValues>
  clients: Client[]
  assets: Asset[]
  onSubmit: (values: OrderFormValues) => void
  isSubmitting: boolean
  isMultiClientMode?: boolean
  selectedClientIds?: string[]
}

export function SwapOrderForm({
  form,
  clients,
  assets,
  onSubmit,
  isSubmitting,
  isMultiClientMode = false,
  selectedClientIds = [],
}: SwapOrderFormProps) {
  // Asegurarse de que el modo esté configurado correctamente
  useEffect(() => {
    form.setValue("mode", "swap")

    // Inicializar con valores por defecto si es necesario
    if (!form.getValues("data.sellOrder") || !form.getValues("data.buyOrder")) {
      form.setValue("data", {
        clientId: "",
        sellOrder: {
          ticker: "",
          type: "Venta",
          quantity: 0,
          priceType: "money",
          price: 0,
          usePriceBands: false,
          plazo: "24hs",
          mercado: "BYMA",
        },
        buyOrder: {
          ticker: "",
          type: "Compra",
          quantity: 0,
          priceType: "money",
          price: 0,
          usePriceBands: false,
          plazo: "24hs",
          mercado: "BYMA",
          useFullAmount: true,
        },
        notes: "",
      })
    }
  }, [form])

  // Calcular el importe total de la venta
  const calculateSellTotal = () => {
    const quantity = form.watch("data.sellOrder.quantity") || 0
    const price = form.watch("data.sellOrder.price") || 0
    return quantity * price
  }

  // Actualizar la cantidad de compra cuando cambia el importe de venta o el precio de compra
  useEffect(() => {
    const sellTotal = calculateSellTotal()
    const buyPrice = form.watch("data.buyOrder.price") || 0
    const useFullAmount = form.watch("data.buyOrder.useFullAmount")

    if (useFullAmount && buyPrice > 0) {
      const buyQuantity = Math.floor(sellTotal / buyPrice)
      form.setValue("data.buyOrder.quantity", buyQuantity)
    }
  }, [
    form.watch("data.sellOrder.quantity"),
    form.watch("data.sellOrder.price"),
    form.watch("data.buyOrder.price"),
    form.watch("data.buyOrder.useFullAmount"),
  ])

  // Manejar el cambio de ticker para autocompletar el precio
  const handleSellTickerChange = (ticker: string) => {
    const asset = assets.find((a) => a.ticker === ticker)
    if (asset) {
      form.setValue("data.sellOrder.price", asset.lastPrice)
    }
  }

  const handleBuyTickerChange = (ticker: string) => {
    const asset = assets.find((a) => a.ticker === ticker)
    if (asset) {
      form.setValue("data.buyOrder.price", asset.lastPrice)
    }
  }

  // Manejar el cambio en usePriceBands
  const handleSellPriceBandsChange = (checked: boolean) => {
    if (checked) {
      const currentPrice = form.getValues("data.sellOrder.price")
      form.setValue("data.sellOrder.minPrice", currentPrice * 0.95) // 5% menos
      form.setValue("data.sellOrder.maxPrice", currentPrice * 1.05) // 5% más
    }
  }

  const handleBuyPriceBandsChange = (checked: boolean) => {
    if (checked) {
      const currentPrice = form.getValues("data.buyOrder.price")
      form.setValue("data.buyOrder.minPrice", currentPrice * 0.95) // 5% menos
      form.setValue("data.buyOrder.maxPrice", currentPrice * 1.05) // 5% más
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        {!isMultiClientMode && (
          <FormField
            control={form.control}
            name="data.clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <ClientSelect clients={clients} value={field.value} onChange={field.onChange} />
                <FormDescription>Selecciona el cliente para el cual deseas crear el swap.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Separator className="my-4" />

        {/* Orden de Venta */}
        <Card>
          <CardHeader className="bg-destructive/10 py-3">
            <CardTitle className="text-base">Orden de Venta</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="data.sellOrder.ticker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activo a Vender</FormLabel>
                    <AssetSelect
                      assets={assets}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value)
                        handleSellTickerChange(value)
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data.sellOrder.quantity"
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
                name="data.sellOrder.priceType"
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
                name="data.sellOrder.price"
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
                name="data.sellOrder.usePriceBands"
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
                          handleSellPriceBandsChange(checked)
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {form.watch("data.sellOrder.usePriceBands") && (
              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="data.sellOrder.minPrice"
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
                  name="data.sellOrder.maxPrice"
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
                name="data.sellOrder.plazo"
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
                name="data.sellOrder.mercado"
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

            <div className="mt-4 p-3 bg-muted rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">Importe Total de Venta:</span>
                <span className="font-bold">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  }).format(calculateSellTotal())}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-2">
            <ArrowDownUp className="h-6 w-6" />
          </div>
        </div>

        {/* Orden de Compra */}
        <Card>
          <CardHeader className="bg-primary/10 py-3">
            <CardTitle className="text-base">Orden de Compra</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="data.buyOrder.ticker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activo a Comprar</FormLabel>
                    <AssetSelect
                      assets={assets}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value)
                        handleBuyTickerChange(value)
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data.buyOrder.useFullAmount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Usar importe total de venta</FormLabel>
                      <FormDescription className="text-xs">
                        Calcula automáticamente la cantidad a comprar
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data.buyOrder.priceType"
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
                name="data.buyOrder.price"
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
                name="data.buyOrder.quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={form.watch("data.buyOrder.useFullAmount")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data.buyOrder.usePriceBands"
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
                          handleBuyPriceBandsChange(checked)
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {form.watch("data.buyOrder.usePriceBands") && (
              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="data.buyOrder.minPrice"
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
                  name="data.buyOrder.maxPrice"
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
                name="data.buyOrder.plazo"
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
                name="data.buyOrder.mercado"
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

        {isMultiClientMode && (
          <Alert variant="info" className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
            <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription>
              En modo multi cuentas, esta operación de swap se creará para todos los clientes seleccionados. Puedes
              ajustar la cantidad o monto individualmente para cada cliente haciendo clic en "Ajustar detalles por
              cliente".
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="data.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ingrese notas adicionales para este swap..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Notas adicionales para la operación de swap (opcional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || (isMultiClientMode && selectedClientIds.length === 0)}>
            {isSubmitting ? "Creando swap..." : isMultiClientMode ? "Crear swaps" : "Crear swap"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
