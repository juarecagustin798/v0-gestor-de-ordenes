"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

/**
 * Fetches all assets from the database (client-side version)
 * @returns Array of assets
 */
export async function getAssets() {
  const supabase = createClientComponentClient<Database>()

  const { data: assets, error } = await supabase.from("activos").select("*").order("nombre")

  if (error) {
    console.error("Error fetching assets:", error)
    return []
  }

  return assets || []
}

/**
 * Fetches an asset by its ID (client-side version)
 * @param id Asset ID
 * @returns Asset object or null if not found
 */
export async function getAssetById(id: string) {
  const supabase = createClientComponentClient<Database>()

  const { data, error } = await supabase.from("activos").select("*").eq("id", id).single()

  if (error && error.code !== "PGSQL_ERROR_NO_ROWS") {
    console.error("Error fetching asset by ID:", error)
    return null
  }

  return data
}

/**
 * Creates a new asset in the database
 * @param asset Asset data to create
 * @returns Created asset
 */
export async function createAsset(asset: Omit<Database["public"]["Tables"]["activos"]["Insert"], "id">) {
  const supabase = createClientComponentClient<Database>()

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
  const supabase = createClientComponentClient<Database>()

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
  const supabase = createClientComponentClient<Database>()

  const { error } = await supabase.from("activos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting asset:", error)
    throw new Error(`Failed to delete asset: ${error.message}`)
  }

  return true
}
