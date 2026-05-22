import { createClient, type SupabaseClient } from '@supabase/supabase-js'

interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

function getConfig(): SupabaseConfig {
  const url =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_URL) ||
    ''
  const anonKey =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY) ||
    ''
  const serviceRoleKey =
    (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY) || undefined

  return { url, anonKey, serviceRoleKey }
}

export function createBrowserClient(): SupabaseClient {
  const { url, anonKey } = getConfig()
  return createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder')
}

export function createAdminClient(): SupabaseClient {
  const { url, serviceRoleKey, anonKey } = getConfig()
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin client')
  }
  return createClient(url || 'https://placeholder.supabase.co', serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function createNativeClient(options?: {
  storage?: {
    getItem: (key: string) => string | null | Promise<string | null>
    setItem: (key: string, value: string) => void | Promise<void>
    removeItem: (key: string) => void | Promise<void>
  }
}): SupabaseClient {
  const { url, anonKey } = getConfig()
  return createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder', {
    auth: {
      storage: options?.storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
}
