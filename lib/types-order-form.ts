import { z } from "zod"

// Enums para las opciones de selección
export const PriceTypeEnum = z.enum(["money", "yield"])
export const PlazoEnum = z.enum(["CI", "24hs"])
export const MercadoEnum = z.enum(["BYMA", "A3", "SENEBI/SISTACO", "Exterior"])
export const OrderTypeEnum = z.enum(["Compra", "Venta"])

// Esquema para una orden individual
export const individualOrderSchema = z.object({
  clientId: z.string().min(1, "Debe seleccionar un cliente"),
  ticker: z.string().min(1, "Debe ingresar un ticker"),
  type: OrderTypeEnum,
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  priceType: PriceTypeEnum,
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  usePriceBands: z.boolean().default(false),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  plazo: PlazoEnum,
  mercado: MercadoEnum,
  notes: z.string().optional(),
})

// Esquema para una orden individual en un swap
export const swapOrderSchema = individualOrderSchema.omit({ clientId: true })

// Esquema para un swap completo
export const swapSchema = z.object({
  clientId: z.string().min(1, "Debe seleccionar un cliente"),
  sellOrder: swapOrderSchema.extend({
    type: z.literal(OrderTypeEnum.enum.Venta),
  }),
  buyOrder: swapOrderSchema.extend({
    type: z.literal(OrderTypeEnum.enum.Compra),
    useFullAmount: z.boolean().default(true),
  }),
  notes: z.string().optional(),
})

// Esquema para una orden en carga masiva
export const bulkOrderItemSchema = individualOrderSchema.omit({ clientId: true })

// Esquema para carga masiva completa
export const bulkOrderSchema = z.object({
  clientId: z.string().min(1, "Debe seleccionar un cliente"),
  orders: z.array(bulkOrderItemSchema).min(1, "Debe agregar al menos una orden"),
  notes: z.string().optional(),
})

// Tipo para el formulario principal que puede ser cualquiera de los tres tipos
export const orderFormSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("individual"), data: individualOrderSchema }),
  z.object({ mode: z.literal("bulk"), data: bulkOrderSchema }),
  z.object({ mode: z.literal("swap"), data: swapSchema }),
])

// Tipos TypeScript derivados de los esquemas Zod
export type PriceType = z.infer<typeof PriceTypeEnum>
export type Plazo = z.infer<typeof PlazoEnum>
export type Mercado = z.infer<typeof MercadoEnum>
export type OrderType = z.infer<typeof OrderTypeEnum>
export type IndividualOrderFormValues = z.infer<typeof individualOrderSchema>
export type SwapOrderFormValues = z.infer<typeof swapOrderSchema>
export type SwapFormValues = z.infer<typeof swapSchema>
export type BulkOrderItemFormValues = z.infer<typeof bulkOrderItemSchema>
export type BulkOrderFormValues = z.infer<typeof bulkOrderSchema>
export type OrderFormValues = z.infer<typeof orderFormSchema>

