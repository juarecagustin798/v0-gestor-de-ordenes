import type { User, Session } from "../db/schema"
import { getUserByEmail, getUserById } from "../services/user-service"
import { cookies } from "next/headers"

// Clave para la cookie de sesión
const SESSION_COOKIE_NAME = "gestor_session"

// Clave para almacenar sesiones en localStorage
const SESSIONS_STORAGE_KEY = "gestor_sessions"

// Función para obtener todas las sesiones
function getAllSessions(): Session[] {
  if (typeof window === "undefined") return []

  try {
    const sessionsJson = localStorage.getItem(SESSIONS_STORAGE_KEY)
    return sessionsJson ? JSON.parse(sessionsJson) : []
  } catch (error) {
    console.error("Error al obtener sesiones:", error)
    return []
  }
}

// Función para guardar sesiones
function saveSessions(sessions: Session[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error("Error al guardar sesiones:", error)
  }
}

// Función para iniciar sesión
export async function login(
  email: string,
  password: string,
): Promise<{ success: boolean; message: string; user?: User }> {
  const user = getUserByEmail(email)

  if (!user) {
    return { success: false, message: "Usuario no encontrado" }
  }

  if (user.password !== password) {
    // En una implementación real, se compararía con hash
    return { success: false, message: "Contraseña incorrecta" }
  }

  if (!user.isActive) {
    return { success: false, message: "Usuario inactivo" }
  }

  // Crear una sesión
  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Expira en 7 días

  const session: Session = {
    id: `session-${Date.now()}`,
    userId: user.id,
    token,
    expiresAt,
    createdAt: new Date(),
  }

  // Guardar la sesión
  const sessions = getAllSessions()
  sessions.push(session)
  saveSessions(sessions)

  // Establecer cookie de sesión
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: token,
    expires: expiresAt,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })

  return { success: true, message: "Inicio de sesión exitoso", user }
}

// Función para cerrar sesión
export async function logout(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value

  if (token) {
    // Eliminar la sesión
    const sessions = getAllSessions()
    const updatedSessions = sessions.filter((s) => s.token !== token)
    saveSessions(updatedSessions)

    // Eliminar la cookie
    cookies().delete(SESSION_COOKIE_NAME)
  }
}

// Función para obtener el usuario actual
export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  // Buscar la sesión
  const sessions = getAllSessions()
  const session = sessions.find((s) => s.token === token && new Date(s.expiresAt) > new Date())

  if (!session) {
    return null
  }

  // Obtener el usuario
  const user = getUserById(session.userId)

  return user || null
}

// Función para generar un token aleatorio
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
