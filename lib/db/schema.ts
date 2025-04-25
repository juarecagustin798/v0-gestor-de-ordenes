// Esquema de la base de datos para usuarios, roles y permisos

// Enumeración de roles disponibles en el sistema
export enum UserRole {
  COMERCIAL = "comercial",
  OPERADOR = "operador",
  CONTROLADOR = "controlador",
  ADMIN = "admin",
}

// Enumeración de permisos disponibles en el sistema
export enum Permission {
  VIEW_DASHBOARD = "view_dashboard",
  CREATE_ORDER = "create_order",
  EDIT_ORDER = "edit_order",
  DELETE_ORDER = "delete_order",
  EXECUTE_ORDER = "execute_order",
  VIEW_TRADING = "view_trading",
  VIEW_CONFIG = "view_config",
  IMPORT_ASSETS = "import_assets",
  IMPORT_CLIENTS = "import_clients",
  MANAGE_USERS = "manage_users",
}

// Interfaz para el modelo de Usuario
export interface User {
  id: string
  email: string
  name: string
  password: string // En una implementación real, esto sería un hash
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
}

// Interfaz para el modelo de Rol
export interface Role {
  id: string
  name: UserRole
  permissions: Permission[]
  description: string
}

// Interfaz para el modelo de Sesión
export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}
