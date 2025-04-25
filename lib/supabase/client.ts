"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Cliente para componentes del lado del cliente
export const createClient = () => {
  return createClientComponentClient<Database>()
}
