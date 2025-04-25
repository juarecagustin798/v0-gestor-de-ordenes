import type { Asset } from "@/lib/types"
import { mockAssets } from "@/lib/data"

/**
 * Crea un activo temporal cuando no se encuentra un activo existente
 * @param ticker El ticker del activo a crear
 * @param price El precio del activo (opcional)
 * @returns El activo temporal creado
 */
export function createTemporaryAsset(ticker: string, price = 0): Asset {
  console.log(`Creando activo temporal para ticker: ${ticker}`)

  // Crear un activo temporal con el ticker proporcionado
  const tempAsset: Asset = {
    id: `TEMP-${Date.now()}`,
    ticker: ticker,
    name: `Activo Temporal`, // Quitar el ticker del nombre para evitar duplicación
    type: "Bono",
    market: "Argentina",
    lastPrice: price || 0,
    currency: "USD",
    change: 0,
    volume: 0,
  }

  // Añadir al array de activos
  mockAssets.push(tempAsset)

  // Guardar en localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("mockAssets", JSON.stringify(mockAssets))
      console.log("Activo temporal guardado en localStorage")
    } catch (e) {
      console.warn("No se pudo guardar el activo temporal en localStorage:", e)
    }
  }

  return tempAsset
}

/**
 * Busca un activo por ticker con múltiples estrategias de búsqueda
 * @param ticker El ticker a buscar
 * @returns El activo encontrado o undefined
 */
export function findAssetByTicker(ticker: string): Asset | undefined {
  console.log(`Buscando activo con ticker: ${ticker}`)

  if (!ticker) {
    console.error("Ticker no válido")
    return undefined
  }

  // 1. Intentar coincidencia directa
  let asset = mockAssets.find((a) => a.ticker === ticker || a.id === ticker)

  // 2. Si no se encuentra, intentar coincidencia normalizada (sin espacios, minúsculas)
  if (!asset) {
    const normalizedSearchTicker = ticker.replace(/\s+/g, "").toLowerCase()
    asset = mockAssets.find((a) => {
      const normalizedAssetTicker = a.ticker.replace(/\s+/g, "").toLowerCase()
      return normalizedAssetTicker === normalizedSearchTicker
    })
  }

  // 3. Si aún no se encuentra, intentar coincidencia de ticker base (antes de cualquier guión)
  if (!asset) {
    // Extraer ticker base (parte antes del guión)
    const baseTicker = ticker.split("-")[0].trim()
    console.log("Intentando coincidencia de ticker base con:", baseTicker)

    asset = mockAssets.find((a) => {
      // Verificar si el ticker del activo comienza con el ticker base
      return a.ticker.startsWith(baseTicker)
    })
  }

  // 4. Si aún no se encuentra, intentar coincidencia parcial
  if (!asset) {
    const searchTerms = ticker.split(/[\s-]+/) // Dividir por espacios y guiones
    console.log("Intentando coincidencia parcial con términos:", searchTerms)

    // Encontrar activos que coincidan con cualquiera de los términos de búsqueda
    const possibleMatches = mockAssets.filter((a) => {
      return searchTerms.some((term) => a.ticker.toLowerCase().includes(term.toLowerCase()))
    })

    if (possibleMatches.length > 0) {
      console.log(
        "Se encontraron posibles coincidencias:",
        possibleMatches.map((a) => a.ticker),
      )
      // Ordenar por coincidencia más cercana (ticker más corto que contiene el término de búsqueda)
      possibleMatches.sort((a, b) => a.ticker.length - b.ticker.length)
      asset = possibleMatches[0]
    }
  }

  return asset
}
