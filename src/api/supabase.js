import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
const configurationError =
  'Supabase sozlanmagan. .env fayliga VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY qiymatlarini kiriting.'

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from() {
        throw new Error(configurationError)
      },
      rpc() {
        throw new Error(configurationError)
      },
    }