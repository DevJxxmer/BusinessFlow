import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithPassword(email: string, password: string, fullName: string) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
}

export async function signOut() {
  if (!supabase) return { error: null }
  return supabase.auth.signOut()
}
