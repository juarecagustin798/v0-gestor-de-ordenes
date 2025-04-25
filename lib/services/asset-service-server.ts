import { createClient } from "@/lib/supabase/server"

/**
 * Fetches all assets from the database (server-side version)
 * @returns Array of assets
 */
export async function getAssetsServer() {
  const supabase = createClient()

  const { data: assets, error } = await supabase.from("activos").select("*").order("nombre")

  if (error) {
    console.error("Error fetching assets:", error)
    throw new Error(`Failed to fetch assets: ${error.message}`)
  }

  return assets || []
}

/**
 * Fetches an asset by its ID (server-side version)
 * @param id Asset ID
 * @returns Asset object or null if not found
 */
export async function getAssetByIdServer(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("activos").select("*").eq("id", id).single()

  if (error && error.code !== "PGSQL_ERROR_NO_ROWS") {
    console.error("Error fetching asset by ID:", error)
    throw new Error(`Failed to fetch asset: ${error.message}`)
  }

  return data
}
