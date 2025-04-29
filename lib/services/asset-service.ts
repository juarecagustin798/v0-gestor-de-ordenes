import { createServerClient } from "@/lib/supabase/server"
import type { Asset } from "@/lib/types"

export async function getAssets(): Promise<Asset[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("assets").select("*")

    if (error) {
      console.error("Error fetching assets:", error)
      return []
    }

    return (data as Asset[]) || []
  } catch (error) {
    console.error("Failed to fetch assets:", error)
    return []
  }
}

export async function getAssetById(id: string): Promise<Asset | null> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("assets").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching asset with id ${id}:`, error)
      return null
    }

    return data as Asset
  } catch (error) {
    console.error(`Failed to fetch asset with id ${id}:`, error)
    return null
  }
}
