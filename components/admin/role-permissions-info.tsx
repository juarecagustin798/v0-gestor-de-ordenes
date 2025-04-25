"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { getAllRoles } from "@/lib/services/user-service"
import { Permission, UserRole } from "@/lib/db/schema"
import { useEffect, useState } from "react"

export function RolePermissionsInfo() {
  // Inicializar con un array vacío para evitar valores undefined
  const [roles, setRoles] = useState<any[]>([])

  useEffect(() => {
    setRoles(getAllRoles())
  }, [])

  // Obtener todos los permisos únicos
  const allPermissions = Object.values(Permission)

  // Función para obtener el color de la insignia según el rol
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "default"
      case UserRole.COMERCIAL:
        return "blue" as any
      case UserRole.OPERADOR:
        return "green" as any
      case UserRole.CONTROLADOR:
        return "yellow" as any
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles y Permisos</CardTitle>
        <CardDescription>
          Información sobre los roles disponibles en el sistema y sus permisos asociados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <div className="text-center py-8">Cargando información de roles...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Rol</TableHead>
                  <TableHead className="w-[250px]">Descripción</TableHead>
                  {allPermissions.map((permission) => (
                    <TableHead key={permission} className="text-center">
                      {permission
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(role.name)}>{role.name}</Badge>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    {allPermissions.map((permission) => (
                      <TableCell key={permission} className="text-center">
                        {role.permissions.includes(permission) ? (
                          <Check className="mx-auto h-4 w-4 text-green-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
