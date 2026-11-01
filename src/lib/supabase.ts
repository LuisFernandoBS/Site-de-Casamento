import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.SUPABASE_URL as string | undefined
const key = import.meta.env.SUPABASE_ANON_KEY as string | undefined

if (!url || !key) {
  console.warn(
    "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY.",
  )
}

export const supabase = createClient(url ?? "", key ?? "")