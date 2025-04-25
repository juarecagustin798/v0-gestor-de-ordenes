import { z } from "zod"

// Enums for order form
export const OrderTypeEnum = z.enum(["Compra", "Venta"])
export type OrderTypeEnum = z.infer<typeof OrderTypeEnum>

// Corregido para usar los valores originales
export const PlazoEnum = z.enum(["CI", "24hs", "48hs", "72hs"])
export type PlazoEnum = z.infer<typeof PlazoEnum>

export const MercadoEnum = z.enum(["BYMA", "A3", "SENEBI/SISTACO", "EXTERIOR"])
export type MercadoEnum = z.infer<typeof MercadoEnum>

// Schema for order form data
export const orderFormSchema = z.object({
  mode: z.enum(["individual", "multi", "bulk", "swap"]).default("individual"),
  data: z.object({
    clientId: z.string().min(1, "El cliente es requerido"),
    ticker: z.string().min(1, "El activo es requerido"),
    type: OrderTypeEnum,
    isMarketOrder: z.boolean().default(false),
    priceType: z.enum(["money", "yield"]).default("money"),
    price: z.number().optional(),
    savedPrice: z.number().optional(),
    quantity: z.number().optional(),
    amount: z.number().optional(),
    inputMode: z.enum(["quantity", "amount"]).default("quantity"),
    usePriceBands: z.boolean().default(false),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    plazo: PlazoEnum,
    mercado: MercadoEnum,
    notes: z.string().optional(),
  }),
})

// Type for order form values
export type OrderFormValues = z.infer<typeof orderFormSchema>
