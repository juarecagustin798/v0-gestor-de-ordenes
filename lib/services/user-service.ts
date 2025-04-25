"use client"

import { type User, type Role, UserRole, Permission } from "../db/schema"

// Clave para almacenar usuarios en localStorage
const USERS_STORAGE_KEY = "gestor_users"
const ROLES_STORAGE_KEY = "gestor_roles"

// Roles predefinidos con sus permisos
const defaultRoles: Role[] = [
  {
    id: "role-1",
    name: UserRole.COMERCIAL,
    description: "Comercial/AP - Gestiona clientes y crea órdenes",
    permissions: [
      Permission.VIEW_DASHBOARD,
      Permission.CREATE_ORDER,
      Permission.EDIT_ORDER,
      Permission.VIEW_CONFIG,
      Permission.IMPORT_CLIENTS,
    ],
  },
  {
    id: "role-2",
    name: UserRole.OPERADOR,
    description: "Operador - Ejecuta órdenes en la mesa de trading",
    permissions: [Permission.VIEW_TRADING, Permission.EXECUTE_ORDER, Permission.VIEW_CONFIG, Permission.IMPORT_ASSETS],
  },
  {
    id: "role-3",
    name: UserRole.CONTROLADOR,
    description: "Controlador - Supervisa operaciones y verifica cumplimiento",
    permissions: [Permission.VIEW_DASHBOARD, Permission.VIEW_TRADING, Permission.VIEW_CONFIG],
  },
  {
    id: "role-4",
    name: UserRole.ADMIN,
    description: "Administrador - Acceso completo al sistema",
    permissions: Object.values(Permission),
  },
]

// Usuarios predeterminados para inicializar el sistema
const defaultUsers: User[] = [
  {
    id: "user-1",
    email: "admin@ejemplo.com",
    name: "Administrador",
    password: "admin123", // En una implementación real, esto sería un hash
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Función para inicializar los datos
function initializeData() {
  if (typeof window === "undefined") return

  // Inicializar roles si no existen
  if (!localStorage.getItem(ROLES_STORAGE_KEY)) {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(defaultRoles))
  }

  // Inicializar usuarios si no existen
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers))
  }
}

// Función para obtener todos los usuarios
export function getAllUsers(): User[] {
  if (typeof window === "undefined") return []

  initializeData()

  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY)
    return usersJson ? JSON.parse(usersJson) : []
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return []
  }
}

// Función para obtener todos los roles
export function getAllRoles(): Role[] {
  if (typeof window === "undefined") return []

  initializeData()

  try {
    const rolesJson = localStorage.getItem(ROLES_STORAGE_KEY)
    return rolesJson ? JSON.parse(rolesJson) : []
  } catch (error) {
    console.error("Error al obtener roles:", error)
    return []
  }
}

// Función para obtener un usuario por ID
export function getUserById(id: string): User | undefined {
  const users = getAllUsers()
  return users.find((user) => user.id === id)
}

// Función para obtener un usuario por email
export function getUserByEmail(email: string): User | undefined {
  const users = getAllUsers()
  return users.find((user) => user.email === email)
}

// Función para crear un nuevo usuario
export function createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): User {
  const users = getAllUsers()

  // Verificar si el email ya existe
  if (users.some((user) => user.email === userData.email)) {
    throw new Error("El email ya está en uso")
  }

  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Guardar el usuario
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...users, newUser]))

  return newUser
}

// Función para actualizar un usuario
export function updateUser(id: string, userData: Partial<User>): User {
  const users = getAllUsers()
  const userIndex = users.findIndex((user) => user.id === id)

  if (userIndex === -1) {
    throw new Error("Usuario no encontrado")
  }

  // Verificar si se está cambiando el email y si ya existe
  if (userData.email && userData.email !== users[userIndex].email) {
    if (users.some((user) => user.email === userData.email)) {
      throw new Error("El email ya está en uso")
    }
  }

  // Actualizar el usuario
  const updatedUser: User = {
    ...users[userIndex],
    ...userData,
    updatedAt: new Date(),
  }

  users[userIndex] = updatedUser

  // Guardar los cambios
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

  return updatedUser
}

// Función para eliminar un usuario
export function deleteUser(id: string): boolean {
  const users = getAllUsers()
  const filteredUsers = users.filter((user) => user.id !== id)

  if (filteredUsers.length === users.length) {
    return false // No se encontró el usuario
  }

  // Guardar los cambios
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filteredUsers))

  return true
}

// Función para verificar si un usuario tiene un permiso específico
export function hasPermission(user: User, permission: Permission): boolean {
  const roles = getAllRoles()
  const role = roles.find((r) => r.name === user.role)
  return role ? role.permissions.includes(permission) : false
}
