import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

// Cliente para componentes del lado del servidor
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Alias para mantener compatibilidad con el nombre requerido
export const createClient = createServerClient
