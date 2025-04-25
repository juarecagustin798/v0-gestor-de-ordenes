"use server"
import path from "path"
import { mkdir, writeFile, readFile, stat } from "fs/promises"
import type { Client } from "@/lib/types"

// Directorio para guardar los archivos
const UPLOADS_DIR = path.join(process.cwd(), "uploads")
const CLIENTS_FILE_PATH = path.join(UPLOADS_DIR, "clients.xlsx")
const CLIENTS_JSON_PATH = path.join(UPLOADS_DIR, "clients.json")

// Función para guardar el archivo Excel de clientes
export async function saveClientsFile(formData: FormData) {
  try {
    // Asegurarse de que el directorio de uploads exista
    await mkdir(UPLOADS_DIR, { recursive: true })

    const file = formData.get("file") as File
    if (!file) {
      throw new Error("No se proporcionó ningún archivo")
    }

    // Guardar el archivo Excel
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(CLIENTS_FILE_PATH, buffer)

    return { success: true, message: "Archivo guardado correctamente" }
  } catch (error) {
    console.error("Error al guardar el archivo de clientes:", error)
    return {
      success: false,
      message: `Error al guardar el archivo: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Función para guardar los clientes procesados en formato JSON
export async function saveClientsJson(clients: Client[]) {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true })
    await writeFile(CLIENTS_JSON_PATH, JSON.stringify(clients, null, 2))
    return { success: true }
  } catch (error) {
    console.error("Error al guardar el JSON de clientes:", error)
    return { success: false, error: String(error) }
  }
}

// Función para obtener los clientes desde el archivo JSON guardado
export async function getClientsFromSavedFile(): Promise<Client[]> {
  try {
    // Verificar si el archivo JSON existe
    try {
      await stat(CLIENTS_JSON_PATH)
    } catch (error) {
      console.log("El archivo JSON de clientes no existe")
      return []
    }

    // Leer y parsear el archivo JSON
    const data = await readFile(CLIENTS_JSON_PATH, "utf-8")
    const clients = JSON.parse(data) as Client[]

    console.log(`Cargados ${clients.length} clientes desde el archivo JSON guardado`)
    return clients
  } catch (error) {
    console.error("Error al cargar clientes desde el archivo guardado:", error)
    return []
  }
}

// Función para obtener información sobre el archivo de clientes
export async function getClientsFileInfo() {
  try {
    // Verificar si el archivo Excel existe
    let excelExists = false
    let excelLastModified: Date | null = null
    let clientCount = 0

    try {
      const excelStats = await stat(CLIENTS_FILE_PATH)
      excelExists = true
      excelLastModified = excelStats.mtime
    } catch (error) {
      // El archivo no existe
    }

    // Verificar si el archivo JSON existe
    try {
      const jsonStats = await stat(CLIENTS_JSON_PATH)
      const data = await readFile(CLIENTS_JSON_PATH, "utf-8")
      const clients = JSON.parse(data) as Client[]
      clientCount = clients.length
    } catch (error) {
      // El archivo no existe o no se puede leer
    }

    return {
      excelExists,
      excelLastModified,
      clientCount,
    }
  } catch (error) {
    console.error("Error al obtener información del archivo de clientes:", error)
    return {
      excelExists: false,
      excelLastModified: null,
      clientCount: 0,
    }
  }
}
