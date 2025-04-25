import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
}

// Alias para mantener compatibilidad con el nombre requerido
export const createClient = createServerClient
