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

export async function getProjects() {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('projects').select('id, name, created_at').order('created_at', { ascending: true })
}

export async function createProject(name: string, ownerId: string) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  const { data: project, error } = await supabase.from('projects').insert({ name, owner_id: ownerId }).select('id, name, created_at').single()
  if (error || !project) return { data: null, error: error ?? new Error('No se pudo crear el proyecto') }
  const membership = await supabase.from('project_members').insert({ project_id: project.id, user_id: ownerId, role: 'owner' })
  if (membership.error) return { data: null, error: membership.error }
  return { data: project, error: null }
}

export async function updateProject(id: string, name: string) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('projects').update({ name }).eq('id', id).select('id, name, created_at').single()
}

export async function deleteProject(id: string) {
  if (!supabase) return { error: new Error('Supabase no está configurado') }
  const { error } = await supabase.from('projects').delete().eq('id', id)
  return { error }
}

export async function getProducts(projectId: string) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('products').select('id, code, name, sale_price, active').eq('project_id', projectId).eq('active', true).order('created_at', { ascending: true })
}

export async function createProduct(projectId: string, product: { code: string; name: string; sale_price: number }) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('products').insert({ project_id: projectId, ...product }).select('id, code, name, sale_price, active').single()
}

export async function updateProduct(id: string, updates: { code?: string; name?: string; sale_price?: number; active?: boolean }) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('products').update(updates).eq('id', id).select('id, code, name, sale_price, active').single()
}

export async function deleteProduct(id: string) {
  if (!supabase) return { error: new Error('Supabase no está configurado') }
  const { error } = await supabase.from('products').update({ active: false }).eq('id', id)
  return { error }
}

export async function getInventoryMovements(projectId: string) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('inventory_movements').select('id, product_id, movement_type, quantity, movement_date').eq('project_id', projectId).order('movement_date', { ascending: true })
}

export async function createInventoryMovement(projectId: string, movement: { product_id: string; movement_type: 'entry' | 'exit'; quantity: number; movement_date: string }) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('inventory_movements').insert({ project_id: projectId, ...movement }).select('id, product_id, movement_type, quantity, movement_date').single()
}

export async function getFinancialTransactions(projectId: string) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('financial_transactions').select('id, title, client, product_id, quantity, category, transaction_date, amount, transaction_type, account').eq('project_id', projectId).order('transaction_date', { ascending: false })
}

export async function createFinancialTransaction(projectId: string, transaction: { title: string; client: string; product_id: string; quantity: number; category: string; transaction_date: string; amount: number; transaction_type: 'income' | 'expense'; account: string }) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('financial_transactions').insert({ project_id: projectId, ...transaction }).select('id, title, client, product_id, quantity, category, transaction_date, amount, transaction_type, account').single()
}

export async function getAgendaEvents(projectId: string) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('agenda_events').select('id, title, client, event_date, event_time, duration, event_type, location, status').eq('project_id', projectId).order('event_date', { ascending: true }).order('event_time', { ascending: true })
}

export async function createAgendaEvent(projectId: string, event: { title: string; client: string; event_date: string; event_time: string; duration: string; event_type: 'reunion' | 'tarea' | 'recordatorio'; location: string }) {
  if (!supabase) return { data: null, error: new Error('Supabase no está configurado') }
  return supabase.from('agenda_events').insert({ project_id: projectId, ...event }).select('id, title, client, event_date, event_time, duration, event_type, location, status').single()
}
