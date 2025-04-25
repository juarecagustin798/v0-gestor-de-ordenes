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
import { Loader2, ArrowDownUp } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Client, Asset } from "@/lib/types"

// Importar los nuevos componentes de selección:
import { ClientSelect } from "@/components/selectors/client-select"
import { AssetSelect } from "@/components/selectors/asset-select"

// Esquema para una orden individual (venta o compra)
const orderSchema = z.object({
  assetId: z.string().min(1, "Debe seleccionar un activo"),
  quantity: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  market: z.enum(["BYMA", "A3", "SENEBI/SISTACO", "EXTERIOR"]),
  term: z.enum(["CI", "24hs", "48hs", "72hs"]),
})

// Esquema de validación para el formulario de swap
const swapFormSchema = z.object({
  clientId: z.string().min(1, "Debe seleccionar un cliente"),
  sellOrder: orderSchema,
  buyOrder: orderSchema,
  useFullAmount: z.boolean().default(true),
  notes: z.string().optional(),
})

type SwapFormValues = z.infer<typeof swapFormSchema>

interface SwapOrderFormProps {
  clients: Client[]
  assets: Asset[]
  onSubmit: (values: any) => void
  isSubmitting: boolean
  onClientChange?: (clientId: string) => void
}

export function SwapOrderForm({ clients, assets, onSubmit, isSubmitting, onClientChange }: SwapOrderFormProps) {
  const [selectedSellAsset, setSelectedSellAsset] = useState<Asset | null>(null)
  const [selectedBuyAsset, setSelectedBuyAsset] = useState<Asset | null>(null)

  const form = useForm<SwapFormValues>({
    resolver: zodResolver(swapFormSchema),
    defaultValues: {
      clientId: "",
      sellOrder: {
        assetId: "",
        quantity: 1,
        price: 0,
        market: "BYMA",
        term: "24hs",
      },
      buyOrder: {
        assetId: "",
        quantity: 1,
        price: 0,
        market: "BYMA",
        term: "24hs",
      },
      useFullAmount: true,
      notes: "",
    },
  })

  // Calcular el importe total de la venta
  const calculateSellTotal = () => {
    const quantity = form.watch("sellOrder.quantity") || 0
    const price = form.watch("sellOrder.price") || 0
    return quantity * price
  }

  // Actualizar la cantidad de compra cuando cambia el importe de venta o el precio de compra
  const updateBuyQuantity = () => {
    if (form.watch("useFullAmount")) {
      const sellTotal = calculateSellTotal()
      const buyPrice = form.watch("buyOrder.price") || 0

      if (buyPrice > 0) {
        const buyQuantity = Math.floor(sellTotal / buyPrice)
        form.setValue("buyOrder.quantity", buyQuantity)
      }
    }
  }

  // Manejar el cambio de activo de venta
  const handleSellAssetChange = (value: string) => {
    const asset = assets.find((a) => a.ticker === value || a.id === value)
    if (asset) {
      setSelectedSellAsset(asset)
      form.setValue("sellOrder.assetId", asset.id || asset.ticker)
      form.setValue("sellOrder.price", asset.lastPrice || 0)
      updateBuyQuantity()
    }
  }

  // Manejar el cambio de activo de compra
  const handleBuyAssetChange = (value: string) => {
    const asset = assets.find((a) => a.ticker === value || a.id === value)
    if (asset) {
      setSelectedBuyAsset(asset)
      form.setValue("buyOrder.assetId", asset.id || asset.ticker)
      form.setValue("buyOrder.price", asset.lastPrice || 0)
      updateBuyQuantity()
    }
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

        {/* Orden de Venta */}
        <Card className="border-destructive/20">
          <CardHeader className="bg-destructive/10 py-3">
            <CardTitle className="text-base">Orden de Venta</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="sellOrder.assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activo a Vender</FormLabel>
                    <AssetSelect
                      assets={assets}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value)
                        handleSellAssetChange(value)
                      }}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sellOrder.quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={isSubmitting}
                          onChange={(e) => {
                            field.onChange(e)
                            updateBuyQuantity()
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sellOrder.price"
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
                            updateBuyQuantity()
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sellOrder.market"
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

                <FormField
                  control={form.control}
                  name="sellOrder.term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plazo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar plazo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CI">CI</SelectItem>
                          <SelectItem value="24hs">24hs</SelectItem>
                          <SelectItem value="48hs">48hs</SelectItem>
                          <SelectItem value="72hs">72hs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-2 p-3 bg-muted rounded-md">
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
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-2">
            <ArrowDownUp className="h-6 w-6" />
          </div>
        </div>

        {/* Orden de Compra */}
        <Card className="border-primary/20">
          <CardHeader className="bg-primary/10 py-3">
            <CardTitle className="text-base">Orden de Compra</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="buyOrder.assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activo a Comprar</FormLabel>
                    <AssetSelect
                      assets={assets}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value)
                        handleBuyAssetChange(value)
                      }}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="useFullAmount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Usar importe total de venta</FormLabel>
                      <FormDescription className="text-xs">
                        Calcula automáticamente la cantidad a comprar
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          if (checked) {
                            updateBuyQuantity()
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="buyOrder.price"
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
                            updateBuyQuantity()
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buyOrder.quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={isSubmitting || form.watch("useFullAmount")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="buyOrder.market"
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

                <FormField
                  control={form.control}
                  name="buyOrder.term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plazo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar plazo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CI">CI</SelectItem>
                          <SelectItem value="24hs">24hs</SelectItem>
                          <SelectItem value="48hs">48hs</SelectItem>
                          <SelectItem value="72hs">72hs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
              <FormDescription>Notas adicionales para esta operación de swap (opcional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando swap...
            </>
          ) : (
            "Crear Swap"
          )}
        </Button>
      </form>
    </Form>
  )
}
