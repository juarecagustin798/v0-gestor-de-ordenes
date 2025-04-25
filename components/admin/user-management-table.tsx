"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { type User, type Role, UserRole } from "@/lib/db/schema"
import { Edit, MoreHorizontal, UserPlus, UserX, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { UserForm } from "./user-form"
import { getAllUsers, getAllRoles, updateUser, deleteUser } from "@/lib/services/user-service"

interface UserManagementTableProps {
  initialUsers?: User[]
  initialRoles?: Role[]
}

export function UserManagementTable({ initialUsers, initialRoles }: UserManagementTableProps) {
  // Modificar el estado inicial para evitar valores undefined
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar usuarios y roles
  useEffect(() => {
    const loadData = () => {
      try {
        const loadedUsers = getAllUsers()
        const loadedRoles = getAllRoles()
        setUsers(loadedUsers)
        setRoles(loadedRoles)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

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

  // Función para obtener la descripción del rol
  const getRoleDescription = (role: UserRole) => {
    const foundRole = roles.find((r) => r.name === role)
    return foundRole?.description || role
  }

  // Función para desactivar un usuario
  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await updateUser(userId, { isActive })

      // Actualizar la lista de usuarios
      setUsers(users.map((user) => (user.id === userId ? { ...user, isActive } : user)))

      toast({
        title: isActive ? "Usuario activado" : "Usuario desactivado",
        description: `El usuario ha sido ${isActive ? "activado" : "desactivado"} exitosamente.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario.",
        variant: "destructive",
      })
    }
  }

  // Función para abrir el formulario de edición
  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId)
    setIsFormOpen(true)
  }

  // Función para abrir el formulario de creación
  const handleCreateUser = () => {
    setSelectedUserId(null)
    setIsFormOpen(true)
  }

  // Función para confirmar eliminación
  const handleDeleteConfirm = (userId: string) => {
    setSelectedUserId(userId)
    setIsDeleteDialogOpen(true)
  }

  // Función para eliminar un usuario
  const handleDeleteUser = async () => {
    if (!selectedUserId) return

    try {
      const success = await deleteUser(selectedUserId)

      if (success) {
        // Actualizar la lista de usuarios
        setUsers(users.filter((user) => user.id !== selectedUserId))

        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado exitosamente.",
        })
      } else {
        throw new Error("No se pudo eliminar el usuario")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedUserId(null)
    }
  }

  // Función para refrescar la lista de usuarios
  const refreshUsers = () => {
    setUsers(getAllUsers())
    setIsFormOpen(false)
    setSelectedUserId(null)
  }

  // Asegurarnos de que el componente no intente renderizar datos antes de que estén disponibles
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreateUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando usuarios...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">{getRoleDescription(user.role)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "destructive"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar usuario
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.isActive ? (
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id, false)}>
                              <UserX className="mr-2 h-4 w-4" />
                              Desactivar usuario
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id, true)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Activar usuario
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteConfirm(user.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar usuario
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No hay usuarios registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo para el formulario de usuario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedUserId ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
            <DialogDescription>
              {selectedUserId
                ? "Actualice la información del usuario."
                : "Complete el formulario para crear un nuevo usuario."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            userId={selectedUserId || undefined}
            onSuccess={refreshUsers}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar usuario */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el usuario y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
