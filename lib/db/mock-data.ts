import { type User, UserRole, type Role, Permission } from "./schema"

// Roles predefinidos con sus permisos
export const mockRoles: Role[] = [
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

// Usuarios de ejemplo para cada rol
export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "comercial@ejemplo.com",
    name: "Juan Pérez",
    password: "password123", // En una implementación real, esto sería un hash
    role: UserRole.COMERCIAL,
    isActive: true,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
    lastLogin: new Date("2023-06-10"),
  },
  {
    id: "user-2",
    email: "operador@ejemplo.com",
    name: "María Rodríguez",
    password: "password123",
    role: UserRole.OPERADOR,
    isActive: true,
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-02-20"),
    lastLogin: new Date("2023-06-12"),
  },
  {
    id: "user-3",
    email: "controlador@ejemplo.com",
    name: "Carlos Gómez",
    password: "password123",
    role: UserRole.CONTROLADOR,
    isActive: true,
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10"),
    lastLogin: new Date("2023-06-08"),
  },
  {
    id: "user-4",
    email: "admin@ejemplo.com",
    name: "Ana López",
    password: "password123",
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
    lastLogin: new Date("2023-06-15"),
  },
]

// Función para obtener un usuario por email
export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email === email)
}

// Función para obtener un usuario por ID
export function getUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id)
}

// Función para obtener un rol por nombre
export function getRoleByName(name: UserRole): Role | undefined {
  return mockRoles.find((role) => role.name === name)
}

// Función para verificar si un usuario tiene un permiso específico
export function hasPermission(user: User, permission: Permission): boolean {
  const role = getRoleByName(user.role)
  return role ? role.permissions.includes(permission) : false
}

// Función para obtener todos los usuarios
export function getAllUsers(): User[] {
  return mockUsers
}

// Función para obtener todos los roles
export function getAllRoles(): Role[] {
  return mockRoles
}
