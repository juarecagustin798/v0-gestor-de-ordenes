"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { UserRole } from "@/lib/db/schema"
import { createUser, updateUser, getUserById } from "@/lib/services/user-service"

// Esquema de validación para el formulario
const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Debe ingresar un email válido.",
  }),
  password: z
    .string()
    .min(6, {
      message: "La contraseña debe tener al menos 6 caracteres.",
    })
    .optional()
    .or(z.literal("")),
  role: z.nativeEnum(UserRole, {
    required_error: "Debe seleccionar un rol.",
  }),
  isActive: z.boolean().default(true),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  userId?: string
  onSuccess: () => void
  onCancel: () => void
}

export function UserForm({ userId, onSuccess, onCancel }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!userId

  // Configurar el formulario
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.COMERCIAL,
      isActive: true,
    },
  })

  useEffect(() => {
    if (isEditing && userId) {
      const user = getUserById(userId)
      if (user) {
        form.reset({
          name: user.name,
          email: user.email,
          password: "", // No mostrar la contraseña actual
          role: user.role,
          isActive: user.isActive,
        })
      }
    }
  }, [isEditing, userId, form])

  async function onSubmit(values: UserFormValues) {
    try {
      setIsSubmitting(true)

      if (isEditing && userId) {
        // Si estamos editando, omitir la contraseña si está vacía
        const updateData = { ...values }
        if (!updateData.password) {
          delete updateData.password
        }

        await updateUser(userId, updateData)
        toast({
          title: "Usuario actualizado",
          description: "El usuario ha sido actualizado exitosamente.",
        })
      } else {
        // Si estamos creando, asegurarnos de que haya una contraseña
        if (!values.password) {
          form.setError("password", {
            type: "manual",
            message: "La contraseña es requerida para nuevos usuarios.",
          })
          setIsSubmitting(false)
          return
        }

        await createUser(values as any)
        toast({
          title: "Usuario creado",
          description: "El usuario ha sido creado exitosamente.",
        })
      }

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un error al procesar el usuario.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo" {...field} />
              </FormControl>
              <FormDescription>Nombre completo del usuario.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input type="email" placeholder="correo@ejemplo.com" {...field} />
              </FormControl>
              <FormDescription>Correo electrónico para iniciar sesión.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={isEditing ? "Dejar en blanco para mantener la actual" : "Contraseña"}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {isEditing ? "Dejar en blanco para mantener la contraseña actual." : "Contraseña para iniciar sesión."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UserRole.COMERCIAL}>Comercial</SelectItem>
                  <SelectItem value={UserRole.OPERADOR}>Operador</SelectItem>
                  <SelectItem value={UserRole.CONTROLADOR}>Controlador</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>El rol determina los permisos del usuario en el sistema.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Usuario activo</FormLabel>
                <FormDescription>Los usuarios inactivos no pueden iniciar sesión en el sistema.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar usuario" : "Crear usuario"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
