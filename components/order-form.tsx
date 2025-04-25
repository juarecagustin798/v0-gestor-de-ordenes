"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createOrder } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  client: z.string().min(2, {
    message: "El cliente debe tener al menos 2 caracteres.",
  }),
  asset: z.string().min(1, {
    message: "Debe seleccionar un activo.",
  }),
  type: z.enum(["Compra", "Venta"], {
    required_error: "Debe seleccionar un tipo de operación.",
  }),
  quantity: z.coerce.number().positive({
    message: "La cantidad debe ser un número positivo.",
  }),
  price: z.coerce.number().positive({
    message: "El precio debe ser un número positivo.",
  }),
})

export function OrderForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: "",
      asset: "",
      type: "Compra",
      quantity: 0,
      price: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createOrder(values)
      toast({
        title: "Orden creada",
        description: "La orden ha sido creada exitosamente.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al crear la orden.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del cliente" {...field} />
                </FormControl>
                <FormDescription>Ingrese el nombre del cliente que realiza la orden.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="asset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activo</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del activo" {...field} />
                </FormControl>
                <FormDescription>Ingrese el nombre o ticker del activo.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de operación</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de operación" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Compra">Compra</SelectItem>
                    <SelectItem value="Venta">Venta</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Seleccione si es una orden de compra o venta.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>Ingrese la cantidad de unidades.</FormDescription>
                <FormMessage />
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
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>Ingrese el precio por unidad.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Crear Orden</Button>
      </form>
    </Form>
  )
}

