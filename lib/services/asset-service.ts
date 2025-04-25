import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"

/**
 * Fetches all assets from the database
 * @returns Array of assets
 */
export async function getAssets() {
  const supabase = createClient()

  const { data: assets, error } = await supabase.from("activos").select("*").order("nombre")

  if (error) {
    console.error("Error fetching assets:", error)
    throw new Error(`Failed to fetch assets: ${error.message}`)
  }

  return assets || []
}

/**
 * Fetches an asset by its ID
 * @param id Asset ID
 * @returns Asset object or null if not found
 */
export async function getAssetById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("activos").select("*").eq("id", id).single()

  if (error && error.code !== "PGSQL_ERROR_NO_ROWS") {
    console.error("Error fetching asset by ID:", error)
    throw new Error(`Failed to fetch asset: ${error.message}`)
  }

  return data
}

/**
 * Creates a new asset in the database
 * @param asset Asset data to create
 * @returns Created asset
 */
export async function createAsset(asset: Omit<Database["public"]["Tables"]["activos"]["Insert"], "id">) {
  const supabase = createClient()

  const { data, error } = await supabase.from("activos").insert(asset).select().single()

  if (error) {
    console.error("Error creating asset:", error)
    throw new Error(`Failed to create asset: ${error.message}`)
  }

  return data
}

/**
 * Updates an existing asset in the database
 * @param id Asset ID
 * @param asset Updated asset data
 * @returns Updated asset
 */
export async function updateAsset(id: string, asset: Partial<Database["public"]["Tables"]["activos"]["Update"]>) {
  const supabase = createClient()

  const { data, error } = await supabase.from("activos").update(asset).eq("id", id).select().single()

  if (error) {
    console.error("Error updating asset:", error)
    throw new Error(`Failed to update asset: ${error.message}`)
  }

  return data
}

/**
 * Deletes an asset from the database
 * @param id Asset ID to delete
 * @returns Success status
 */
export async function deleteAsset(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("activos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting asset:", error)
    throw new Error(`Failed to delete asset: ${error.message}`)
  }

  return true
}
