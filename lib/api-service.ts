"use client"

import { mockAssets } from "./data"
import type { Asset } from "./types"

// Credenciales y URL base de la API
const API_USERNAME = "cjuarez"
const API_PASSWORD = "75966957qW!"
const API_BASE_URL = "https://api.dmabroker.xoms.com.ar"

/**
 * Función para obtener el token de autenticación usando headers específicos.
 * Esta función realiza un POST a `/auth/getToken` con los headers X-Username y X-Password,
 * y obtiene el token del header X-Auth-Token en la respuesta.
 */
async function getAuthToken(): Promise<string> {
  try {
    console.log("Obteniendo token de autenticación mediante headers...")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos

    // Realizar la solicitud de autenticación con headers específicos
    const response = await fetch(`${API_BASE_URL}/auth/getToken`, {
      method: "POST",
      headers: {
        "X-Username": API_USERNAME,
        "X-Password": API_PASSWORD,
      },
      signal: controller.signal,
      cache: "no-store",
    })

    clearTimeout(timeoutId)

    console.log("Respuesta de autenticación:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en autenticación:", errorText.substring(0, 500))
      throw new Error(`Error en autenticación: ${response.status} ${response.statusText}`)
    }

    // Obtener el token del header de la respuesta
    const token = response.headers.get("X-Auth-Token")
    if (!token) {
      throw new Error("No se recibió el token en el header X-Auth-Token")
    }

    console.log("Token obtenido correctamente")
    return token
  } catch (error) {
    console.error("Error al obtener token:", error)
    throw error
  }
}

/**
 * Función para obtener todos los instrumentos desde la API.
 * Primero intenta cargar los datos desde localStorage y, de no haberlos,
 * obtiene un token y realiza la solicitud a `/rest/instruments/details` usando el header X-Auth-Token.
 */
export async function fetchAllInstruments(): Promise<Asset[]> {
  try {
    console.log("Iniciando obtención de instrumentos...")

    // Intentar cargar datos desde localStorage
    const storedAssets = loadAssetsFromStorage()
    if (storedAssets.length > 0) {
      console.log("Usando activos almacenados en localStorage")
      return storedAssets
    }

    // Obtener token de autenticación
    const token = await getAuthToken()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos

    // Realizar la solicitud para obtener los instrumentos usando el token en el header
    const response = await fetch(`${API_BASE_URL}/rest/instruments/details`, {
      method: "GET",
      headers: {
        "X-Auth-Token": token,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    })

    clearTimeout(timeoutId)

    console.log("Respuesta de instrumentos:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error al obtener instrumentos:", errorText.substring(0, 500))
      throw new Error(`Error al obtener instrumentos: ${response.status} ${response.statusText}`)
    }

    // Verificar que la respuesta sea JSON y no HTML
    const contentType = response.headers.get("Content-Type")
    if (contentType && contentType.includes("text/html")) {
      const htmlResponse = await response.text()
      console.error("Respuesta HTML recibida para instrumentos:", htmlResponse.substring(0, 500))
      throw new Error("La API devolvió HTML en lugar de JSON. Es posible que la autenticación haya fallado.")
    }

    const responseText = await response.text()
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e: any) {
      throw new Error(
        `No se pudo parsear la respuesta de instrumentos como JSON: ${e.message}. Respuesta: ${responseText.substring(0, 100)}...`,
      )
    }

    console.log("Datos recibidos:", data)

    // Verificar la estructura de la respuesta
    // Ajustamos la verificación para ser más flexible con la estructura de respuesta
    if (!data) {
      throw new Error("Formato de respuesta inválido o error en la respuesta de instrumentos")
    }

    // Determinar la estructura de la respuesta y extraer los instrumentos
    let instruments = []
    if (data.instruments) {
      instruments = data.instruments
    } else if (Array.isArray(data)) {
      instruments = data
    } else if (data.data && Array.isArray(data.data)) {
      instruments = data.data
    } else {
      console.warn("Estructura de respuesta no reconocida, intentando procesar como mejor podamos")
      instruments = data.items || []
    }

    console.log(`Se obtuvieron ${instruments.length} instrumentos`)

    // Transformar los datos al formato de Asset, extrayendo los campos específicos
    const assets: Asset[] = instruments.map((instrument: any) => {
      // Obtener el symbol del instrumentId
      const symbol = instrument.instrumentId?.symbol || ""

      // Extraer el ticker (parte después de "XMEV - " si existe)
      let ticker = symbol
      if (symbol && symbol.includes("XMEV - ")) {
        ticker = symbol.split("XMEV - ")[1]
      }

      // Formatear la fecha de vencimiento de YYYYMMDD a YYYY-MM-DD
      let maturityDate = ""
      if (instrument.maturityDate) {
        const dateStr = instrument.maturityDate
        if (dateStr.length === 8) {
          maturityDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
        } else {
          maturityDate = dateStr
        }
      }

      return {
        id: `${instrument.instrumentId?.marketId || "UNKNOWN"}-${symbol}`,
        name: instrument.underlying || instrument.securityDescription || symbol,
        ticker: ticker,
        type: instrument.cficode || "UNKNOWN",
        market: instrument.instrumentId?.marketId || instrument.segment?.marketId || "UNKNOWN",
        currency: instrument.currency || "ARS",
        lastPrice: instrument.lowLimitPrice || 0,
        change: 0, // Dato no disponible en la respuesta
        volume: 0, // Dato no disponible en la respuesta
        maturityDate: maturityDate, // Añadir la fecha de vencimiento formateada
      }
    })

    // Actualizar y persistir datos
    updateMockAssets(assets)
    saveAssetsToStorage(assets)

    return assets
  } catch (error) {
    console.error("Error detallado al obtener instrumentos:", error)
    throw error
  }
}

/**
 * Función para generar datos de ejemplo en caso de ser solicitados explícitamente.
 */
export function getExampleInstruments(): Asset[] {
  console.log("Generando datos de ejemplo...")

  const exampleAssets: Asset[] = [
    {
      id: "ROFX-DLR/DIC23",
      name: "Dólar Futuro Diciembre 2023",
      ticker: "DLR/DIC23",
      type: "FXXXSX",
      market: "ROFX",
      currency: "ARS",
      lastPrice: 1050.25,
      change: 0.5,
      volume: 1000000,
      maturityDate: "2023-12-29",
    },
    {
      id: "ROFX-TRI.ROS/DIC23",
      name: "Opción Call Trigo Rosario Diciembre 2023",
      ticker: "TRI.ROS/DIC23 352 C",
      type: "OCAFXS",
      market: "ROFX",
      currency: "USD",
      lastPrice: 352.0,
      change: -0.2,
      volume: 500000,
      maturityDate: "2023-12-15",
    },
    {
      id: "BYMA-GGAL",
      name: "Grupo Financiero Galicia",
      ticker: "GGAL",
      type: "ESVUFR",
      market: "BYMA",
      currency: "ARS",
      lastPrice: 3500.75,
      change: 2.3,
      volume: 2500000,
    },
    {
      id: "BYMA-YPF",
      name: "YPF S.A.",
      ticker: "YPF",
      type: "ESVUFR",
      market: "BYMA",
      currency: "ARS",
      lastPrice: 8750.5,
      change: 1.8,
      volume: 1800000,
    },
    {
      id: "ROFX-TGSC6700AG",
      name: "Transportadora Gas del Sur Merval",
      ticker: "TGSC6700AG - 24hs",
      type: "OCASPS",
      market: "ROFX",
      currency: "ARS",
      lastPrice: 120.5,
      change: 1.2,
      volume: 450000,
      maturityDate: "2025-08-14",
    },
    {
      id: "BYMA-PAMP",
      name: "Pampa Energía",
      ticker: "PAMP",
      type: "ESVUFR",
      market: "BYMA",
      currency: "ARS",
      lastPrice: 2950.25,
      change: -0.7,
      volume: 1200000,
    },
    {
      id: "BYMA-ALUA",
      name: "Aluar Aluminio Argentino",
      ticker: "ALUA",
      type: "ESVUFR",
      market: "BYMA",
      currency: "ARS",
      lastPrice: 1200.0,
      change: 0.3,
      volume: 900000,
    },
    {
      id: "BYMA-TXAR",
      name: "Ternium Argentina",
      ticker: "TXAR",
      type: "ESVUFR",
      market: "BYMA",
      currency: "ARS",
      lastPrice: 3200.5,
      change: 1.5,
      volume: 750000,
    },
    {
      id: "BYMA-BBAR",
      name: "Banco BBVA Argentina",
      ticker: "BBAR",
      type: "ESVUFR",
      market: "BYMA",
      currency: "ARS",
      lastPrice: 980.25,
      change: -0.5,
      volume: 650000,
    },
    {
      id: "BYMA-BMA",
      name: "Banco Macro",
      ticker: "BMA",
      type: "ESVUFR",
      market: "BYMA",
      currency: "ARS",
      lastPrice: 4500.75,
      change: 2.1,
      volume: 1100000,
    },
    {
      id: "BYMA-CEPU",
      name: "Central Puerto",
      ticker: "CEPU",
      type: "ESVUFR",
      market: "BYMA",
      currency: "ARS",
      lastPrice: 1850.0,
      change: 0.9,
      volume: 800000,
    },
  ]

  updateMockAssets(exampleAssets)
  saveAssetsToStorage(exampleAssets)
  return exampleAssets
}

/**
 * Actualiza el array global mockAssets.
 */
function updateMockAssets(assets: Asset[]) {
  mockAssets.length = 0
  mockAssets.push(...assets)
}

/**
 * Guarda los activos en localStorage.
 */
function saveAssetsToStorage(assets: Asset[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("mockAssets", JSON.stringify(assets))
      console.log(`${assets.length} activos guardados en localStorage`)
    } catch (e) {
      console.warn("No se pudo guardar en localStorage:", e)
    }
  }
}

/**
 * Carga los activos almacenados en localStorage.
 */
export function loadAssetsFromStorage(): Asset[] {
  if (typeof window !== "undefined") {
    try {
      const storedAssets = localStorage.getItem("mockAssets")
      if (storedAssets) {
        const parsedAssets = JSON.parse(storedAssets)
        console.log("Activos cargados desde localStorage:", parsedAssets.length)
        updateMockAssets(parsedAssets)
        return parsedAssets
      }
    } catch (e) {
      console.error("Error al cargar activos desde localStorage:", e)
    }
  }
  return []
}

// Modificar la función de importación de clientes para que REEMPLACE los clientes existentes
export async function importClientsFromFile(
  file: File,
): Promise<{ success: boolean; message: string; count?: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        if (!event.target || !event.target.result) {
          return resolve({ success: false, message: "Error al leer el archivo" })
        }

        const content = event.target.result.toString()
        let clients

        try {
          clients = JSON.parse(content)
          console.log("Clientes importados (raw):", clients)
        } catch (e) {
          console.error("Error al parsear JSON:", e)
          return resolve({ success: false, message: "El archivo no contiene JSON válido" })
        }

        // Verificar que sea un array
        if (!Array.isArray(clients)) {
          console.error("El contenido no es un array:", clients)
          return resolve({ success: false, message: "El formato del archivo no es válido (se esperaba un array)" })
        }

        // Verificar que los clientes tengan la estructura correcta
        const validClients = clients.filter(
          (client) => client && typeof client === "object" && client.id && client.name,
        )

        if (validClients.length === 0) {
          console.error("No se encontraron clientes válidos en el archivo")
          return resolve({ success: false, message: "No se encontraron clientes válidos en el archivo" })
        }

        console.log("Clientes válidos encontrados:", validClients.length)

        // CAMBIO IMPORTANTE: Reemplazar completamente los clientes existentes
        try {
          // Guardar SOLO los nuevos clientes en localStorage, reemplazando los existentes
          localStorage.setItem("mockClients", JSON.stringify(validClients))

          // Actualizar la variable global mockClients
          if (typeof window !== "undefined") {
            // Acceder a mockClients a través del módulo data
            const mockClientsModule = require("@/lib/data").mockClients
            if (mockClientsModule) {
              mockClientsModule.length = 0
              mockClientsModule.push(...validClients)
            }
          }

          console.log("Clientes guardados en localStorage:", validClients.length)
          console.log("Muestra de clientes guardados:", validClients.slice(0, 3))

          // Forzar una recarga de la página para que se actualicen los datos
          window.location.reload()

          return resolve({
            success: true,
            message: `Se importaron ${validClients.length} clientes, reemplazando los existentes`,
            count: validClients.length,
          })
        } catch (e) {
          console.error("Error al guardar en localStorage:", e)
          return resolve({ success: false, message: "Error al guardar los clientes en localStorage" })
        }
      } catch (e) {
        console.error("Error general al procesar el archivo:", e)
        return resolve({ success: false, message: "Error al procesar el archivo" })
      }
    }

    reader.onerror = () => {
      console.error("Error al leer el archivo")
      resolve({ success: false, message: "Error al leer el archivo" })
    }

    reader.readAsText(file)
  })
}
