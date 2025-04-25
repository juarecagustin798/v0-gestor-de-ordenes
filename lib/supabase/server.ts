"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Cliente para componentes del lado del servidor
export const createServerClient = () => {
  return createClientComponentClient<Database>()
}

// Alias para mantener compatibilidad con el nombre requerido
export const createClient = createServerClient
