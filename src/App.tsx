import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Bell,
  BellRing,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Edit3,
  Filter,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  Mail,
  Package,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
  UserPlus,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import './App.css'
import { createAgendaEvent, createFinancialTransaction, createInventoryMovement, createProduct, createProject, deleteFinancialTransaction, deleteProject, deleteProduct as deleteProductRemote, updateProduct, getAgendaEvents, getFinancialTransactions, getInventoryMovements, getProducts, getProjects, signInWithPassword, signOut, signUpWithPassword, supabase, updateProject } from './lib/supabase'

type View = 'Resumen' | 'Finanzas' | 'Inventario' | 'Agenda' | 'Configuración'
type PublicScreen = 'welcome' | 'login' | 'signup' | 'projects'
type TransactionType = 'income' | 'expense'
type Product = { id: string; name: string; sku: string; price: number }
type InventoryMovement = { id: number | string; productId: string; quantity: number; date: string }
type Transaction = { id: number | string; title: string; client: string; productId?: string | null; quantity: number; category: string; date: string; amount: number; type: TransactionType; account: string }
type BusinessSettings = { businessName: string; ownerName: string; email: string; phone: string; currency: string; timezone: string; weekStartsOn: string; reminders: boolean }
type Project = { id: string; name: string; detail: string; initials: string; color: 'green' | 'coral' }

const navigation: { label: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Resumen', icon: LayoutDashboard },
  { label: 'Finanzas', icon: WalletCards },
  { label: 'Inventario', icon: Package },
  { label: 'Agenda', icon: CalendarDays },
]
const chartValues = [40, 54, 46, 68, 52, 78, 62, 88, 72, 96, 80, 100]
const currencyCodes: Record<string, string> = { 'USD - Dólar estadounidense': 'USD', 'ARS - Peso argentino': 'ARS', 'COP - Peso colombiano': 'COP', 'EUR - Euro': 'EUR' }
let activeCurrency = 'USD - Dólar estadounidense'
const formatMoney = (value: number) => { const code = currencyCodes[activeCurrency] ?? 'USD'; const decimals = code === 'COP' ? 0 : 2; return new Intl.NumberFormat(code === 'COP' ? 'es-CO' : 'es-AR', { style: 'currency', currency: code, minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value) }
const formatDate = (date: string) => new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`))
const getTodayDateString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const formatLongDate = (value = new Date()) => {
  const formatted = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(value)
  return formatted.replace(/^./, (char) => char.toUpperCase())
}
const getRelativeDateLabel = (date: string) => {
  const today = new Date()
  const target = new Date(`${date}T12:00:00`)
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const normalizedTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const diff = Math.round((normalizedToday.getTime() - normalizedTarget.getTime()) / 86400000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  if (diff === -1) return 'Mañana'
  return formatDate(date)
}
export const getNetBalance = (totals: { income: number; expense: number }) => totals.income - totals.expense
const productName = (productId: string | null | undefined, catalog: Product[]) => productId ? catalog.find((product) => product.id === productId)?.name ?? 'Producto no encontrado' : 'Producto no encontrado'
const operationName = (transaction: Transaction) => `${transaction.title} · ${transaction.client}`
const initialSettings: BusinessSettings = { businessName: '', ownerName: '', email: '', phone: '', currency: 'USD - Dólar estadounidense', timezone: '', weekStartsOn: 'Lunes', reminders: false }
const storageKeys = { transactions: 'businessflow:transactions', products: 'businessflow:products', entries: 'businessflow:entries', exits: 'businessflow:exits', settings: 'businessflow:settings', agenda: 'businessflow:agenda', projects: 'businessflow:projects', selectedProject: 'businessflow:selectedProject' } as const
function loadLocal<T>(key: string, fallback: T): T { try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback } }

function App() {
  const [publicScreen, setPublicScreen] = useState<PublicScreen>('welcome')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => loadLocal(storageKeys.selectedProject, null))
  const [authMessage, setAuthMessage] = useState('')
  const [activeView, setActiveView] = useState<View>('Resumen')
  const [period, setPeriod] = useState('Últimos 30 días')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [entries, setEntries] = useState<InventoryMovement[]>([])
  const [exits, setExits] = useState<InventoryMovement[]>([])
  const [transactionFilter, setTransactionFilter] = useState<'all' | TransactionType>('all')
  const [categoryFilter, setCategoryFilter] = useState('Todas las categorías')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [settings, setSettings] = useState(() => loadLocal(storageKeys.settings, initialSettings))
  const [projects, setProjects] = useState<Project[]>([])
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  activeCurrency = settings.currency
  const activeProject = projects.find((project) => project.id === selectedProjectId)

  useEffect(() => {
    if (!supabase || !selectedProjectId) return
    getFinancialTransactions(selectedProjectId).then(({ data, error }) => {
      if (error) window.alert(error.message)
      else if (data) setTransactions(data.map((item) => ({ id: item.id, title: item.title, client: item.client, productId: item.product_id, quantity: item.quantity, category: item.category, date: item.transaction_date, amount: Number(item.amount), type: item.transaction_type, account: item.account })))
    })
  }, [selectedProjectId])

  useEffect(() => {
    if (selectedProjectId) window.localStorage.setItem(storageKeys.selectedProject, selectedProjectId)
    else window.localStorage.removeItem(storageKeys.selectedProject)
  }, [selectedProjectId])

  type MigrationPreview = { products: number; entries: number; exits: number; transactions: number; agenda: number; sampleProducts: string[] }
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false)
  const [migrationPreview, setMigrationPreview] = useState<MigrationPreview | null>(null)
  const [migrationProcessing, setMigrationProcessing] = useState(false)

  const generateMigrationPreview = () => {
    const localProducts = loadLocal(storageKeys.products, []) as Product[]
    const localEntries = loadLocal(storageKeys.entries, []) as InventoryMovement[]
    const localExits = loadLocal(storageKeys.exits, []) as InventoryMovement[]
    const localTransactions = loadLocal(storageKeys.transactions, []) as Transaction[]
    const localAgenda = loadLocal(storageKeys.agenda, []) as any[]
    setMigrationPreview({ products: localProducts.length, entries: localEntries.length, exits: localExits.length, transactions: localTransactions.length, agenda: localAgenda.length, sampleProducts: localProducts.slice(0, 6).map((p) => p.name) })
    setIsMigrationModalOpen(true)
  }

  const performMigration = async () => {
    if (!supabase || !selectedProjectId) { window.alert('Selecciona un proyecto y conecta Supabase antes de importar datos.'); return }
    setMigrationProcessing(true)
    try {
      const localProducts = loadLocal(storageKeys.products, []) as Product[]
      for (const p of localProducts) {
        await createProduct(selectedProjectId, { code: p.sku, name: p.name, sale_price: p.price })
      }
      const localEntries = loadLocal(storageKeys.entries, []) as InventoryMovement[]
      for (const e of localEntries) {
        await createInventoryMovement(selectedProjectId, { product_id: e.productId, movement_type: 'entry', quantity: e.quantity, movement_date: e.date })
      }
      const localExits = loadLocal(storageKeys.exits, []) as InventoryMovement[]
      for (const e of localExits) {
        await createInventoryMovement(selectedProjectId, { product_id: e.productId, movement_type: 'exit', quantity: e.quantity, movement_date: e.date })
      }
      const localTransactions = loadLocal(storageKeys.transactions, []) as Transaction[]
      for (const t of localTransactions) {
        await createFinancialTransaction(selectedProjectId, { title: t.title, client: t.client, product_id: t.productId ?? null, quantity: t.quantity, category: t.category, transaction_date: t.date, amount: t.amount, transaction_type: t.type, account: t.account })
      }
      const localAgenda = loadLocal(storageKeys.agenda, []) as any[]
      for (const a of localAgenda) {
        await createAgendaEvent(selectedProjectId, { title: a.title, client: a.client, event_date: a.date, event_time: a.time, duration: a.duration, event_type: a.type, location: a.location })
      }
      window.alert('Migración completada con éxito.')
      setIsMigrationModalOpen(false)
    } catch (err: any) { window.alert('Error durante la migración: ' + (err?.message ?? String(err))) }
    setMigrationProcessing(false)
  }

  useEffect(() => { window.localStorage.setItem(storageKeys.transactions, JSON.stringify(transactions)) }, [transactions])
  useEffect(() => { window.localStorage.setItem(storageKeys.products, JSON.stringify(products)) }, [products])
  useEffect(() => { window.localStorage.setItem(storageKeys.entries, JSON.stringify(entries)) }, [entries])
  useEffect(() => { window.localStorage.setItem(storageKeys.exits, JSON.stringify(exits)) }, [exits])
  useEffect(() => { window.localStorage.setItem(storageKeys.settings, JSON.stringify(settings)) }, [settings])
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { if (data.session) setIsAuthenticated(true) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setIsAuthenticated(Boolean(session)))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !isAuthenticated) return
    getProjects().then(({ data, error }) => {
      if (error) {
        console.warn('Error cargando proyectos:', error.message)
        return
      }
      if (!data) return
      setProjects(data.map((project, index) => ({
        id: project.id,
        name: project.name,
        detail: index === 0 ? 'Proyecto principal' : 'Proyecto compartido',
        initials: project.name.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(),
        color: index % 2 === 0 ? 'green' : 'coral',
      })))
    })
  }, [isAuthenticated])

  useEffect(() => {
    if (!supabase || !isAuthenticated || !selectedProjectId) return
    if (selectedProjectId.startsWith('local-')) {
      setSelectedProjectId(null)
      return
    }
    getProjects().then(({ data, error }) => {
      if (error) {
        console.warn('Error cargando proyectos:', error.message)
        return
      }
      const exists = data?.some((project) => project.id === selectedProjectId)
      if (!exists) setSelectedProjectId(null)
    })
  }, [isAuthenticated, selectedProjectId])

  const totals = useMemo(() => transactions.reduce((result, item) => ({ ...result, [item.type]: result[item.type] + item.amount }), { income: 0, expense: 0 }), [transactions])
  const filteredTransactions = useMemo(() => transactions.filter((item) => {
    const matchesType = transactionFilter === 'all' || item.type === transactionFilter
    const matchesCategory = categoryFilter === 'Todas las categorías' || item.category === categoryFilter
    const searchableText = `${item.title} ${item.client} ${productName(item.productId, products)} ${item.category}`.toLowerCase()
    const matchesSearch = searchableText.includes(search.toLowerCase())
    return matchesType && matchesCategory && matchesSearch
  }), [categoryFilter, products, search, transactionFilter, transactions])

  const deleteTransaction = async (id: number | string) => {
    if (supabase && selectedProjectId) {
      const { error } = await deleteFinancialTransaction(id)
      if (error) { window.alert(error.message); return }
    }
    setTransactions((current) => current.filter((item) => item.id !== id))
  }

  if (!isAuthenticated) {
    if (publicScreen === 'welcome') return <WelcomeScreen onStart={() => setPublicScreen('login')} />
    if (publicScreen === 'login') return <LoginScreen message={authMessage} onBack={() => setPublicScreen('welcome')} onSignup={() => { setAuthMessage(''); setPublicScreen('signup') }} onLogin={async (email, password) => { const result = await signInWithPassword(email, password); if (result.error) setAuthMessage(result.error.message); else setPublicScreen('projects') }} />
    if (publicScreen === 'signup') return <SignupScreen message={authMessage} onBack={() => { setAuthMessage(''); setPublicScreen('login') }} onSignup={async (name, email, password) => { const result = await signUpWithPassword(email, password, name); if (result.error) setAuthMessage(result.error.message); else { setAuthMessage('Cuenta creada. Revisa tu correo para confirmar el acceso.'); setPublicScreen('login') } }} />
    return <ProjectScreen onBack={() => setPublicScreen('login')} onSelect={(projectId) => { setSelectedProjectId(projectId); setIsAuthenticated(true) }} />
  }

  if (!selectedProjectId) {
    return <ProjectScreen onBack={() => setPublicScreen('login')} onSelect={(projectId) => setSelectedProjectId(projectId)} />
  }

  const addTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const transactionType = form.get('type') as TransactionType
    const title = String(form.get('title')).trim()
    const date = String(form.get('date'))
    const quantity = Number(form.get('quantity'))
    const client = String(form.get('client'))
    if (!title || !date || !quantity || quantity <= 0) return

    if (transactionType === 'income') {
      const product = products.find((item) => item.id === form.get('productId'))
      if (!product) return
      const received = entries.filter((item) => item.productId === product.id).reduce((total, item) => total + item.quantity, 0)
      const sold = exits.filter((item) => item.productId === product.id).reduce((total, item) => total + item.quantity, 0)
      if (quantity > received - sold) { window.alert(`No hay stock suficiente. Disponible: ${received - sold} unidades.`); return }
      const movementDate = date
      if (supabase && selectedProjectId) {
        const { data, error } = await createInventoryMovement(selectedProjectId, { product_id: product.id, movement_type: 'exit', quantity, movement_date: movementDate })
        if (error || !data) { window.alert(error?.message ?? 'La venta no pudo registrar la salida de inventario.'); return }
        setExits((current) => [...current, { id: data.id, productId: data.product_id, quantity: data.quantity, date: data.movement_date }])
      } else {
        setExits((current) => [...current, { id: Date.now(), productId: product.id, quantity, date: movementDate }])
      }
      const amount = quantity * product.price
      const category = String(form.get('category'))
      const account = String(form.get('account'))
      const client = String(form.get('client'))
      if (supabase && selectedProjectId) {
        const { data, error } = await createFinancialTransaction(selectedProjectId, { title, client, product_id: product.id, quantity, category, transaction_date: date, amount, transaction_type: transactionType, account })
        if (error || !data) { window.alert(error?.message ?? 'La operación no pudo guardarse.'); return }
        setTransactions((current) => [{ id: data.id, title: data.title, client: data.client, productId: data.product_id, quantity: data.quantity, category: data.category, date: data.transaction_date, amount: Number(data.amount), type: data.transaction_type, account: data.account }, ...current])
        setIsModalOpen(false)
        event.currentTarget.reset()
        return
      }
      setTransactions((current) => [{ id: Date.now(), title, client, productId: product.id, quantity, category, date, amount, type: transactionType, account }, ...current])
      setIsModalOpen(false)
      event.currentTarget.reset()
      return
    }

    const amount = Number(form.get('amount'))
    if (!amount || amount < 0) return
    if (supabase && selectedProjectId) {
      const { data, error } = await createFinancialTransaction(selectedProjectId, { title, client, product_id: null, quantity, category: 'Gastos', transaction_date: date, amount, transaction_type: 'expense', account: 'Gastos' })
      if (error || !data) { window.alert(error?.message ?? 'La operación no pudo guardarse.'); return }
      setTransactions((current) => [{ id: data.id, title: data.title, client: data.client, productId: data.product_id, quantity: data.quantity, category: data.category, date: data.transaction_date, amount: Number(data.amount), type: data.transaction_type, account: data.account }, ...current])
      setIsModalOpen(false)
      event.currentTarget.reset()
      return
    }

    setTransactions((current) => [{ id: Date.now(), title, client, productId: null, quantity, category: 'Gastos', date, amount, type: 'expense', account: 'Gastos' }, ...current])
    setIsModalOpen(false)
    event.currentTarget.reset()
  }

  const addProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name')).trim()
    const sku = String(form.get('sku')).trim()
    const price = Number(form.get('price'))
    if (!name || !sku || !price || price <= 0) return
    if (supabase && selectedProjectId) {
      const { data, error } = await createProduct(selectedProjectId, { code: sku, name, sale_price: price })
      if (error || !data) { window.alert(error?.message ?? 'No se pudo guardar el producto.'); return }
      setProducts((current) => [...current, { id: data.id, name: data.name, sku: data.code, price: Number(data.sale_price) }])
    } else setProducts((current) => [...current, { id: `${sku.toLowerCase()}-${Date.now()}`, name, sku, price }])
    setIsProductModalOpen(false)
    event.currentTarget.reset()
  }

  const applyProductEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name')).trim()
    const sku = String(form.get('sku')).trim()
    const price = Number(form.get('price'))
    if (!name || !sku || !price || price <= 0 || !editingProduct) return
    if (supabase && selectedProjectId) {
      const { data, error } = await updateProduct(editingProduct.id, { code: sku, name, sale_price: price })
      if (error || !data) { window.alert(error?.message ?? 'No se pudo actualizar el producto.'); return }
      setProducts((current) => current.map((p) => p.id === data.id ? { id: data.id, name: data.name, sku: data.code, price: Number(data.sale_price) } : p))
    } else {
      setProducts((current) => current.map((p) => p.id === editingProduct.id ? { ...p, name, sku, price } : p))
    }
    setEditingProduct(null)
    setIsProductModalOpen(false)
    event.currentTarget.reset()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">b</span><span>business<span className="brand-accent">flow</span></span></div>
        <div className="workspace-menu-wrap"><button className="workspace-switcher" onClick={() => { setWorkspaceMenuOpen((open) => !open); setProfileMenuOpen(false) }} aria-expanded={workspaceMenuOpen}><span className={`workspace-dot ${activeProject?.color ?? 'green'}`}>{activeProject?.initials ?? 'BF'}</span><span className="workspace-name">{activeProject?.name ?? 'Mi negocio'}<small>{activeProject?.detail ?? 'Proyecto activo'}</small></span><ChevronDown size={15} /></button>{workspaceMenuOpen && <div className="popover workspace-popover"><span className="popover-label">TUS PROYECTOS</span>{projects.length > 0 ? projects.map((project) => (<button key={project.id} className={`popover-option ${project.id === selectedProjectId ? 'selected' : ''}`} onClick={() => { setSelectedProjectId(project.id); setWorkspaceMenuOpen(false) }}><span className={`workspace-dot ${project.color}`}>{project.initials}</span><span><strong>{project.name}</strong><small>{project.detail}</small></span></button>)) : <div className="popover-empty">No se encontraron proyectos.</div>}<button className="popover-create" onClick={() => { setWorkspaceMenuOpen(false); setActiveView('Configuración') }}><Plus size={14} /> Gestionar proyectos</button></div>}</div>
        <nav aria-label="Navegación principal"><span className="nav-label">Espacio de trabajo</span>{navigation.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeView === label ? 'active' : ''}`} onClick={() => setActiveView(label)}><Icon size={18} /><span>{label}</span></button>)}<span className="nav-label nav-label-lower">Cuenta</span><button className={`nav-item ${activeView === 'Configuración' ? 'active' : ''}`} onClick={() => setActiveView('Configuración')}><Settings size={18} /><span>Configuración</span></button></nav>
        <div className="sidebar-bottom"><div className="help-link"><CircleHelp size={17} /><span>Centro de ayuda</span></div><div className="user-card"><span className="avatar">US</span><span><strong>Mi cuenta</strong><small>Administrador</small></span><ChevronDown size={15} /></div></div>
      </aside>
      <main className="main-content"><header className="topbar"><div className="breadcrumb"><span>Espacio de trabajo</span><span>/</span><strong>{activeView}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notificaciones"><Bell size={19} /><span className="notification-dot" /></button><div className="profile-menu-wrap"><button className="profile-button" onClick={() => { setProfileMenuOpen((open) => !open); setWorkspaceMenuOpen(false) }} aria-expanded={profileMenuOpen}><span className="avatar avatar-small">JM</span><ChevronDown size={15} /></button>{profileMenuOpen && <div className="popover profile-popover"><div className="profile-popover-head"><span className="avatar avatar-small">JM</span><span><strong>Jeimer Morales</strong><small>jeimer@negocios.com</small></span></div><button className="popover-action" onClick={() => { setActiveView('Configuración'); setProfileMenuOpen(false) }}><Settings size={15} /> Configuración</button><button className="popover-action danger" onClick={async () => { await signOut(); setIsAuthenticated(false); setPublicScreen('login'); setProfileMenuOpen(false) }}>Cerrar sesión</button></div>}</div></div></header>
        <div className="page-content">
          {activeView === 'Resumen' && <Dashboard transactions={transactions} totals={totals} period={period} setPeriod={setPeriod} setActiveView={setActiveView} setIsModalOpen={setIsModalOpen} />}
          {activeView === 'Finanzas' && <FinancePage transactions={filteredTransactions} totals={totals} products={products} search={search} setSearch={setSearch} transactionFilter={transactionFilter} setTransactionFilter={setTransactionFilter} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} setIsModalOpen={setIsModalOpen} onDeleteTransaction={deleteTransaction} />}
          {activeView === 'Inventario' && <InventoryPage projectId={selectedProjectId} products={products} setProducts={setProducts} entries={entries} exits={exits} setEntries={setEntries} setExits={setExits} setIsProductModalOpen={setIsProductModalOpen} onEditProduct={(product) => { setEditingProduct(product); setIsProductModalOpen(true) }} />}
          {activeView === 'Agenda' && <AgendaPage projectId={selectedProjectId} />}
          {activeView === 'Configuración' && <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="primary-button" onClick={generateMigrationPreview}>
                Importar datos locales
              </button>
            </div>
            <SettingsPage settings={settings} setSettings={setSettings} />
          </>}
        </div>
      </main>
      {isModalOpen && <TransactionModal products={products} onClose={() => setIsModalOpen(false)} onSubmit={addTransaction} />}
      {isProductModalOpen && <ProductModal onClose={() => { setIsProductModalOpen(false); setEditingProduct(null) }} onSubmit={editingProduct ? applyProductEdit : addProduct} />}
      {isMigrationModalOpen && migrationPreview && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsMigrationModalOpen(false)}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="migration-modal-title">
          <div className="modal-heading"><div><p className="eyebrow">IMPORTACIÓN LOCAL</p><h2 id="migration-modal-title">Vista previa de migración</h2></div><button className="close-button" onClick={() => setIsMigrationModalOpen(false)} aria-label="Cerrar"><X size={18} /></button></div>
          <div style={{ padding: 18 }}>
            <p>Se importarán los siguientes elementos al proyecto seleccionado:</p>
            <ul>
              <li><strong>{migrationPreview.products}</strong> productos (ejemplos: {migrationPreview.sampleProducts.join(', ') || '—'})</li>
              <li><strong>{migrationPreview.entries}</strong> entradas de inventario</li>
              <li><strong>{migrationPreview.exits}</strong> salidas de inventario</li>
              <li><strong>{migrationPreview.transactions}</strong> transacciones financieras</li>
              <li><strong>{migrationPreview.agenda}</strong> eventos de agenda</li>
            </ul>
            <p>Confirma para ejecutar la importación. Esto creará registros en Supabase.</p>
            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={() => setIsMigrationModalOpen(false)} disabled={migrationProcessing}>Cancelar</button>
              <button type="button" className="primary-button" onClick={performMigration} disabled={migrationProcessing}>{migrationProcessing ? 'Importando...' : 'Confirmar importación'}</button>
            </div>
          </div>
        </section>
      </div>}
    </div>
  )
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const features = [
    { icon: TrendingUp, title: 'Finanzas bajo control', text: 'Registra ingresos y gastos, entiende tu balance y toma decisiones con información clara.' },
    { icon: Package, title: 'Inventario actualizado', text: 'Conoce tus entradas, salidas y stock disponible sin depender de hojas de cálculo.' },
    { icon: CalendarDays, title: 'Agenda organizada', text: 'Coordina reuniones, tareas y recordatorios para que nada importante se quede atrás.' },
  ]
  return <main className="public-screen welcome-screen"><div className="public-nav"><div className="brand public-brand"><span className="brand-mark">b</span><span>business<span className="brand-accent">flow</span></span></div><button className="public-login-link" onClick={onStart}>Iniciar sesión <ArrowRight size={16} /></button></div><div className="welcome-content"><div className="welcome-copy"><p className="eyebrow">GESTIÓN CLARA PARA NEGOCIOS EN CRECIMIENTO</p><h1>Tu negocio,<br /><em>en movimiento.</em></h1><p>Una forma más simple de tener tus finanzas, inventario y agenda en un solo lugar.</p><button className="primary-button welcome-cta" onClick={onStart}>Comenzar ahora <ArrowRight size={17} /></button><div className="welcome-proof"><span className="proof-avatars"><i>JM</i><i>GN</i><i>CC</i></span><span>Todo tu negocio,<br /><strong>más claro cada día.</strong></span></div></div><div className="welcome-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="visual-board"><div className="visual-board-top"><span>Resumen del negocio</span><span className="visual-dots">•••</span></div><div className="visual-balance"><small>Saldo disponible</small><strong>$ 24.680,50</strong><span><ArrowUpRight size={13} /> 12,8% este mes</span></div><div className="visual-chart"><i style={{ height: '42%' }} /><i style={{ height: '56%' }} /><i style={{ height: '45%' }} /><i style={{ height: '70%' }} /><i style={{ height: '61%' }} /><i style={{ height: '84%' }} /><i style={{ height: '68%' }} /><i style={{ height: '94%' }} /></div><div className="visual-lines"><span /><span /><span /></div></div><div className="floating-note note-income"><span><ArrowUpRight size={15} /></span><div><small>Ingresos este mes</small><strong>$ 18.420,00</strong></div></div><div className="floating-note note-agenda"><span><CalendarDays size={15} /></span><div><small>Próxima actividad</small><strong>Revisión de propuesta</strong></div></div></div></div><section className="welcome-info"><div className="welcome-section-intro"><p className="eyebrow">TODO EN UN MISMO LUGAR</p><h2>Menos vueltas.<br /><em>Más claridad.</em></h2><p>BusinessFlow reúne las herramientas que necesitas para llevar el día a día de tu empresa con una visión completa.</p></div><div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article className="feature-item" key={title}><span className="feature-icon"><Icon size={19} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section><section className="welcome-process"><div><p className="eyebrow">ASÍ DE SIMPLE</p><h2>Empieza con una visión<br /><em>más ordenada.</em></h2></div><div className="process-steps"><div><span>01</span><strong>Crea tu espacio</strong><p>Organiza cada negocio o proyecto por separado.</p></div><div><span>02</span><strong>Carga tu operación</strong><p>Registra productos, movimientos y actividades.</p></div><div><span>03</span><strong>Decide mejor</strong><p>Consulta el estado real de tu negocio.</p></div></div></section><section className="welcome-final"><div><p className="eyebrow">TU NEGOCIO MERECE CLARIDAD</p><h2>Todo listo para<br /><em>dar el siguiente paso.</em></h2></div><button className="primary-button" onClick={onStart}>Comenzar ahora <ArrowRight size={17} /></button></section><div className="welcome-footer"><span>Finanzas</span><span>Inventario</span><span>Agenda</span><span>Todo conectado en un solo espacio</span></div></main>
}

function LoginScreen({ message, onBack, onSignup, onLogin }: { message: string; onBack: () => void; onSignup: () => void; onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
    return <main className="public-screen auth-screen"><div className="auth-decoration" /><button className="back-link" onClick={onBack}>← Volver al inicio</button><section className="auth-card"><div className="brand public-brand"><span className="brand-mark">b</span><span>business<span className="brand-accent">flow</span></span></div><div className="auth-heading"><p className="eyebrow">BIENVENIDO DE NUEVO</p><h1>Inicia sesión</h1><p>Continúa gestionando tu negocio con claridad.</p></div>{message && <p className="auth-message">{message}</p>}<form onSubmit={(event) => { event.preventDefault(); if (email && password) onLogin(email, password) }}><label>Correo electrónico<div className="input-with-icon"><Mail size={16} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@empresa.com" /></div></label><label>Contraseña<div className="input-with-icon"><LockKeyhole size={16} /><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" /></div></label><button className="primary-button auth-submit" type="submit">Iniciar sesión <ArrowRight size={16} /></button></form><button className="forgot-link">¿Olvidaste tu contraseña?</button><p className="signup-prompt">¿Aún no tienes una cuenta? <button type="button" onClick={onSignup}>Crear cuenta</button></p><p className="auth-legal">Al continuar aceptas nuestros términos de uso y política de privacidad.</p></section></main>
}

function SignupScreen({ message, onBack, onSignup }: { message: string; onBack: () => void; onSignup: (name: string, email: string, password: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  return <main className="public-screen auth-screen"><div className="auth-decoration signup-decoration" /><button className="back-link" onClick={onBack}>← Volver al inicio de sesión</button><section className="auth-card signup-card"><div className="brand public-brand"><span className="brand-mark">b</span><span>business<span className="brand-accent">flow</span></span></div><div className="auth-heading"><p className="eyebrow">EMPIEZA A ORGANIZARTE</p><h1>Crea tu cuenta</h1><p>Configura tu espacio de trabajo en pocos pasos.</p></div>{message && <p className="auth-message">{message}</p>}<form onSubmit={(event) => { event.preventDefault(); if (name && email && password && password === confirmation) onSignup(name, email, password) }}><label>Nombre completo<div className="input-with-icon"><UserRound size={16} /><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Jeimer Morales" /></div></label><label>Correo electrónico<div className="input-with-icon"><Mail size={16} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@empresa.com" /></div></label><div className="form-row"><label>Contraseña<div className="input-with-icon"><LockKeyhole size={16} /><input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" /></div></label><label>Confirmar contraseña<div className="input-with-icon"><LockKeyhole size={16} /><input type="password" required minLength={6} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Repite tu contraseña" /></div></label></div>{confirmation && password !== confirmation && <p className="form-error">Las contraseñas no coinciden.</p>}<button className="primary-button auth-submit" type="submit"><UserPlus size={16} /> Crear cuenta</button></form><p className="auth-legal">Al crear tu cuenta aceptas nuestros términos de uso y política de privacidad.</p></section></main>
}

function ProjectScreen({ onBack, onSelect }: { onBack: () => void; onSelect: (projectId: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [creating, setCreating] = useState(false)
  const [managing, setManaging] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (!supabase) {
      setError('Supabase no está configurado. Conecta Supabase para ver proyectos.')
      return
    }
    getProjects().then(({ data, error: loadError }) => {
      if (loadError) setError(loadError.message)
      else if (data) setProjects(data.map((project, index) => ({
        id: project.id,
        name: project.name,
        detail: index === 0 ? 'Proyecto principal' : 'Proyecto compartido',
        initials: project.name.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(),
        color: index % 2 === 0 ? 'green' : 'coral',
      })))
    })
  }, [])
  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName || !supabase) return
    const initials = cleanName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    const { data, error: createError } = await supabase.auth.getUser().then(({ data: userData }) => userData.user ? createProject(cleanName, userData.user.id) : { data: null, error: new Error('Sesión no encontrada') })
    if (createError || !data) {
      setError(createError?.message ?? 'No se pudo crear el proyecto')
      return
    }
    const newProject: Project = { id: data.id, name: data.name, detail: 'Proyecto nuevo', initials, color: 'green' }
    setProjects((current) => [...current, newProject])
    onSelect(data.id)
    setName('')
    setCreating(false)
  }
  const handleRename = async (project: Project) => {
    const nextName = window.prompt('Nuevo nombre del negocio', project.name)?.trim()
    if (!nextName || nextName === project.name || !supabase) return
    const { error: updateError } = await updateProject(project.id, nextName)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setProjects((current) => current.map((item) => item.id === project.id ? {
      ...item,
      name: nextName,
      initials: nextName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    } : item))
  }
  const handleDelete = async (project: Project) => {
    if (projects.length === 1 || !window.confirm(`¿Eliminar el negocio "${project.name}"?`)) return
    if (!supabase) return
    const { error: deleteError } = await deleteProject(project.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setProjects((current) => current.filter((item) => item.id !== project.id))
  }
  return <main className="public-screen project-screen"><div className="project-topbar"><div className="brand public-brand"><span className="brand-mark">b</span><span>business<span className="brand-accent">flow</span></span></div><span className="project-user"><span className="avatar avatar-small">JM</span> Jeimer Morales</span></div><section className="project-content"><div className="project-heading-row"><div><p className="eyebrow">TU ESPACIO DE TRABAJO</p><h1>{managing ? 'Administrar negocios' : 'Elige un proyecto'}</h1><p className="subheading">{managing ? 'Edita o elimina tus espacios de trabajo.' : 'Selecciona el negocio que quieres gestionar.'}</p></div><button className="manage-projects-button" onClick={() => setManaging((current) => !current)}>{managing ? 'Volver a elegir' : 'Administrar negocios'}</button></div>{error && <p className="auth-message">{error}</p>}<div className="project-list">{projects.map((project) => managing ? <div className="project-card managed" key={project.id}><span className={`project-icon ${project.color}`}>{project.initials}</span><span><strong>{project.name}</strong><small>{project.detail}</small></span><button className="project-action" onClick={() => handleRename(project)}>Renombrar</button><button className="project-action danger" onClick={() => handleDelete(project)}>Eliminar</button></div> : <button className="project-card" key={project.id} onClick={() => onSelect(project.id)}><span className={`project-icon ${project.color}`}>{project.initials}</span><span><strong>{project.name}</strong><small>{project.detail}</small></span><ArrowRight size={18} /></button>)}{creating ? <form className="new-project-form" onSubmit={handleCreateProject}><label>Nombre del negocio<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Mi empresa" /></label><div><button type="button" className="cancel-button" onClick={() => setCreating(false)}>Cancelar</button><button type="submit" className="primary-button">Crear negocio</button></div></form> : <button className="new-project-card" onClick={() => setCreating(true)}><Plus size={17} /><span>Agregar un nuevo negocio</span></button>}</div><button className="back-link project-back" onClick={onBack}>← Volver al inicio de sesión</button></section></main>
}

function Dashboard({ transactions, totals, period, setPeriod, setActiveView, setIsModalOpen }: { transactions: Transaction[]; totals: { income: number; expense: number }; period: string; setPeriod: (value: string) => void; setActiveView: (view: View) => void; setIsModalOpen: (value: boolean) => void }) {
  const balance = getNetBalance(totals)
  return <>
    <section className="welcome-row"><div><p className="eyebrow">{formatLongDate().toUpperCase()}</p><h1>Buenos días</h1><p className="subheading">Aquí tienes el estado de tu negocio en un vistazo.</p></div><button className="primary-button" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Nueva operación</button></section>
      <section className="metric-grid"><article className="metric-card featured"><div className="metric-top"><span>Saldo disponible</span><WalletCards size={19} /></div><strong>{formatMoney(balance)}</strong><div className="metric-change positive"><ArrowUpRight size={15} /> 12,8% <span>vs. mes anterior</span></div><div className="mini-bars">{[35, 48, 42, 62, 50, 72, 57, 84, 70, 89].map((height) => <i key={height} style={{ height: `${height}%` }} />)}</div></article><article className="metric-card"><div className="metric-top"><span>Ingresos este mes</span><span className="metric-icon green"><TrendingUp size={18} /></span></div><strong>{formatMoney(totals.income)}</strong><div className="metric-change positive"><ArrowUpRight size={15} /> 8,4% <span>vs. mes anterior</span></div></article><article className="metric-card"><div className="metric-top"><span>Gastos este mes</span><span className="metric-icon coral"><CreditCard size={18} /></span></div><strong>{formatMoney(totals.expense)}</strong><div className="metric-change negative"><ArrowDownRight size={15} /> 3,2% <span>vs. mes anterior</span></div></article></section>
    <div className="content-grid"><section className="panel cashflow-panel"><div className="panel-heading"><div><h2>Flujo de caja</h2><p>Ingresos y gastos a lo largo del tiempo</p></div><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Periodo del flujo de caja"><option>Últimos 30 días</option><option>Últimos 90 días</option><option>Este año</option></select></div><div className="chart-legend"><span><i className="legend-dot income-dot" />Ingresos</span><span><i className="legend-dot expense-dot" />Gastos</span></div><Chart /></section><section className="panel transactions-panel"><div className="panel-heading"><div><h2>Actividad reciente</h2><p>Últimos movimientos registrados</p></div><button className="text-button" onClick={() => setActiveView('Finanzas')}>Ver todo <ArrowUpRight size={15} /></button></div><div className="transaction-list">{transactions.slice(0, 3).map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}</div><button className="outline-button" onClick={() => setIsModalOpen(true)}><Plus size={16} /> Registrar movimiento</button></section></div>
    <section className="bottom-grid"><div className="insight-card"><div className="insight-icon"><Sparkles size={20} /></div><div><span className="eyebrow">RESUMEN INTELIGENTE</span><h2>Tu negocio va por buen camino</h2><p>Los ingresos crecieron un 12,8% este mes. Mantén el ritmo para alcanzar tu objetivo.</p></div><ArrowUpRight size={18} /></div><div className="goal-card"><div className="goal-header"><div><h2>Objetivo mensual</h2><p>Ingresos objetivo · Julio</p></div><strong>78%</strong></div><div className="progress-track"><span /></div><div className="goal-footer"><span>{formatMoney(totals.income)} recaudados</span><span>de $ 23.500</span></div></div></section>
  </>
}

function FinancePage({ transactions, totals, products, search, setSearch, transactionFilter, setTransactionFilter, categoryFilter, setCategoryFilter, setIsModalOpen, onDeleteTransaction }: { transactions: Transaction[]; totals: { income: number; expense: number }; products: Product[]; search: string; setSearch: (value: string) => void; transactionFilter: 'all' | TransactionType; setTransactionFilter: (value: 'all' | TransactionType) => void; categoryFilter: string; setCategoryFilter: (value: string) => void; setIsModalOpen: (value: boolean) => void; onDeleteTransaction: (id: number | string) => void }) {
  const [openMenuId, setOpenMenuId] = useState<number | string | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  return <><section className="welcome-row finance-heading"><div><p className="eyebrow">CONTROL FINANCIERO</p><h1>Finanzas</h1><p className="subheading">Administra ingresos, gastos, clientes y productos.</p></div><button className="primary-button" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Nueva operación</button></section><section className="finance-summary"><div><span>Ingresos</span><strong className="summary-income">{formatMoney(totals.income)}</strong><small>Este mes</small></div><div><span>Gastos</span><strong className="summary-expense">{formatMoney(totals.expense)}</strong><small>Este mes</small></div><div><span>Balance neto</span><strong>{formatMoney(getNetBalance(totals))}</strong><small>Ingresos menos gastos</small></div></section><section className="panel finance-table-panel"><div className="panel-heading"><div><h2>Movimientos</h2><p>{transactions.length} operaciones encontradas</p></div><button className="filter-button" type="button" aria-expanded={showFilters ? 'true' : 'false'} onClick={() => setShowFilters((current) => !current)}><Filter size={15} /> Filtros</button></div><div className={`finance-toolbar${showFilters ? '' : ' collapsed'}`}><label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente, producto..." /></label><div className="filter-tabs"><button className={transactionFilter === 'all' ? 'selected' : ''} onClick={() => setTransactionFilter('all')}>Todos</button><button className={transactionFilter === 'income' ? 'selected' : ''} onClick={() => setTransactionFilter('income')}>Ingresos</button><button className={transactionFilter === 'expense' ? 'selected' : ''} onClick={() => setTransactionFilter('expense')}>Gastos</button></div><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filtrar por categoría"><option>Todas las categorías</option><option>Ventas</option><option>Compras</option><option>Servicios</option><option>Marketing</option></select></div><div className="finance-table-wrap"><table><thead><tr><th>Operación</th><th>Producto</th><th className="align-right">Cantidad</th><th>Categoría</th><th>Fecha</th><th className="align-right">Total</th><th aria-label="Acciones" /></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction.id}><td><div className="table-operation"><span className={`transaction-icon ${transaction.type}`}><ReceiptText size={16} /></span><strong>{operationName(transaction)}</strong></div></td><td><span className="product-cell">{productName(transaction.productId, products)}</span></td><td className="align-right">{transaction.quantity}</td><td><span className="category-pill">{transaction.category}</span></td><td>{formatDate(transaction.date)}</td><td className={`align-right table-amount ${transaction.type === 'income' ? 'amount-income' : 'amount-expense'}`}>{transaction.type === 'income' ? '+' : '-'} {formatMoney(transaction.amount)}</td><td><div className="row-menu-wrap"><button type="button" className="row-menu" aria-label={`Opciones para ${operationName(transaction)}`} onClick={() => setOpenMenuId(openMenuId === transaction.id ? null : transaction.id)}>•••</button>{openMenuId === transaction.id && <div className="popover row-popover"><button type="button" className="popover-action danger" onClick={() => { if (!window.confirm('Eliminar esta operación?')) return; onDeleteTransaction(transaction.id); setOpenMenuId(null) }}>Eliminar</button></div>}</div></td></tr>)}</tbody></table>{transactions.length === 0 && <div className="no-results"><Search size={23} /><strong>No encontramos movimientos</strong><span>Prueba con otro filtro o término de búsqueda.</span></div>}</div></section></>
}

function TransactionRow({ transaction }: { transaction: Transaction }) { return <div className="transaction"><span className={`transaction-icon ${transaction.type}`}><ReceiptText size={16} /></span><div className="transaction-detail"><strong>{operationName(transaction)}</strong><span>{getRelativeDateLabel(transaction.date)}</span></div><strong className={transaction.type === 'income' ? 'amount-income' : 'amount-expense'}>{transaction.type === 'income' ? '+' : '-'} {formatMoney(transaction.amount)}</strong></div> }
function Chart() { return <div className="chart"><div className="y-axis"><span>$20k</span><span>$15k</span><span>$10k</span><span>$5k</span><span>$0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /><i /></div><div className="bars">{chartValues.map((value, index) => <div className="bar-group" key={index}><div className="bar income-bar" style={{ height: `${value}%` }} /><div className="bar expense-bar" style={{ height: `${Math.max(22, value - 30)}%` }} /></div>)}</div><div className="x-axis"><span>01 Jun</span><span>08 Jun</span><span>15 Jun</span><span>22 Jun</span><span>30 Jun</span></div></div></div> }
type AgendaEvent = { id: number; title: string; client: string; date: string; time: string; duration: string; type: 'reunion' | 'tarea' | 'recordatorio'; location: string; status: 'confirmada' | 'pendiente' }
function AgendaPage({ projectId }: { projectId: string | null }) {
  const [events, setEvents] = useState<any[]>(() => loadLocal(storageKeys.agenda, []))
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString())
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  useEffect(() => { window.localStorage.setItem(storageKeys.agenda, JSON.stringify(events)) }, [events])
  useEffect(() => {
    if (!supabase || !projectId) return
    getAgendaEvents(projectId).then(({ data, error }) => {
      if (error) window.alert(error.message)
      else if (data) setEvents(data.map((event) => ({ id: event.id, title: event.title, client: event.client, date: event.event_date, time: event.event_time.slice(0, 5), duration: event.duration, type: event.event_type, location: event.location, status: event.status })))
    })
  }, [projectId])
  const changeDate = (delta: number) => {
    const nextDate = new Date(`${selectedDate}T12:00:00`)
    nextDate.setDate(nextDate.getDate() + delta)
    const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
    setSelectedDate(nextDateStr)
  }
  const selectedEvents = events.filter((event) => event.date === selectedDate).sort((first, second) => first.time.localeCompare(second.time))
  const upcomingEvents = events.filter((event) => event.date >= selectedDate).sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`)).slice(0, 3)
  const addEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const newEvent = { title: String(form.get('title')), client: String(form.get('client')), date: String(form.get('date')), time: String(form.get('time')), duration: String(form.get('duration')), type: form.get('type') as AgendaEvent['type'], location: String(form.get('location')), status: 'pendiente' as const }
    if (supabase && projectId) {
      const { data, error } = await createAgendaEvent(projectId, { title: newEvent.title, client: newEvent.client, event_date: newEvent.date, event_time: newEvent.time, duration: newEvent.duration, event_type: newEvent.type, location: newEvent.location })
      if (error || !data) { window.alert(error?.message ?? 'La actividad no pudo guardarse.'); return }
      setEvents((current) => [...current, { id: data.id, title: data.title, client: data.client, date: data.event_date, time: data.event_time.slice(0, 5), duration: data.duration, type: data.event_type, location: data.location, status: data.status }])
    } else setEvents((current) => [...current, { id: Date.now(), ...newEvent }])
    setIsEventModalOpen(false)
    event.currentTarget.reset()
  }
  return <><section className="welcome-row finance-heading"><div><p className="eyebrow">ORGANIZACIÓN DEL NEGOCIO</p><h1>Agenda</h1><p className="subheading">Coordina reuniones, tareas y recordatorios importantes.</p></div><button className="primary-button" onClick={() => setIsEventModalOpen(true)}><Plus size={18} /> Nueva actividad</button></section><div className="agenda-toolbar"><div className="date-strip"><button className="date-arrow" aria-label="Día anterior" onClick={() => changeDate(-1)}>‹</button>{[...Array(5)].map((_, index) => {
      const day = new Date(`${selectedDate}T12:00:00`)
      day.setDate(day.getDate() - 2 + index)
      const value = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
      return <button key={value} className={`date-card ${selectedDate === value ? 'selected' : ''}`} onClick={() => setSelectedDate(value)}><span>{new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(day).toUpperCase()}</span><strong>{String(day.getDate()).padStart(2, '0')}</strong><small>{new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(day).toUpperCase()}</small></button>
    })}<button className="date-arrow" aria-label="Día siguiente" onClick={() => changeDate(1)}>›</button></div><div className="view-toggle"><button className={viewMode === 'day' ? 'selected' : ''} onClick={() => setViewMode('day')}>Día</button><button className={viewMode === 'week' ? 'selected' : ''} onClick={() => setViewMode('week')}>Semana</button></div></div><div className="agenda-layout"><section className="panel day-agenda"><div className="panel-heading"><div><h2>{selectedDate === getTodayDateString() ? `Hoy, ${formatLongDate(new Date(`${selectedDate}T12:00:00`)).toLowerCase()}` : `Agenda del ${formatDate(selectedDate)}`}</h2><p>{selectedEvents.length} actividades programadas</p></div><span className="agenda-status"><i /> {selectedEvents.length === 0 ? 'Sin eventos' : `${selectedEvents.length} pendientes`}</span></div><div className="timeline">{selectedEvents.map((event) => <AgendaEventCard event={event} key={event.id} />)}{selectedEvents.length === 0 && <div className="no-results"><CalendarDays size={23} /><strong>Día libre</strong><span>No hay actividades programadas para esta fecha.</span><button className="text-button" onClick={() => setIsEventModalOpen(true)}>Agregar actividad <Plus size={14} /></button></div>}</div></section><aside className="agenda-side"><section className="panel upcoming-panel"><div className="panel-heading"><div><h2>Próximamente</h2><p>Tus siguientes actividades</p></div><CalendarDays size={18} color="#6e9d7a" /></div>{upcomingEvents.map((event) => <div className="upcoming-item" key={event.id}><span className={`upcoming-date ${event.type}`}><strong>{event.date.slice(-2)}</strong><small>JUL</small></span><div><strong>{event.title}</strong><span>{event.time} · {event.client}</span></div></div>)}</section><section className="panel agenda-legend"><h2>Tipos de actividad</h2><span><i className="legend-reunion" /> Reuniones</span><span><i className="legend-tarea" /> Tareas</span><span><i className="legend-recordatorio" /> Recordatorios</span></section></aside></div>{isEventModalOpen && <AgendaEventModal onClose={() => setIsEventModalOpen(false)} onSubmit={addEvent} />}</>
}
function AgendaEventCard({ event }: { event: AgendaEvent }) { return <article className={`agenda-event ${event.type}`}><div className="event-time"><strong>{event.time}</strong><span>{event.duration}</span></div><div className="event-line" /><div className="event-content"><div className="event-title-row"><div><h3>{event.title}</h3><p>{event.client}</p></div><span className={`event-status ${event.status}`}>{event.status}</span></div><div className="event-meta"><span><UserRound size={13} /> {event.client}</span><span><MapPin size={13} /> {event.location}</span></div></div></article> }
function AgendaEventModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="agenda-modal-title"><div className="modal-heading"><div><p className="eyebrow">AGENDA LOCAL</p><h2 id="agenda-modal-title">Nueva actividad</h2></div><button className="close-button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div><form onSubmit={onSubmit}><label>Título de la actividad<input name="title" required placeholder="Ej. Reunión con cliente" /></label><div className="form-row"><label>Cliente o contacto<input name="client" required placeholder="Ej. Grupo Norte" /></label><label>Tipo<select name="type" defaultValue="reunion"><option value="reunion">Reunión</option><option value="tarea">Tarea</option><option value="recordatorio">Recordatorio</option></select></label></div><div className="form-row"><label>Fecha<input name="date" type="date" defaultValue={getTodayDateString()} required /></label><label>Hora<input name="time" type="time" defaultValue="09:00" required /></label></div><div className="form-row"><label>Duración<select name="duration" defaultValue="30 min"><option>15 min</option><option>30 min</option><option>45 min</option><option>60 min</option></select></label><label>Lugar<input name="location" required placeholder="Ej. Videollamada" /></label></div><div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button">Guardar actividad</button></div></form></section></div> }
function SettingsPage({ settings, setSettings }: { settings: BusinessSettings; setSettings: (settings: BusinessSettings) => void }) {
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)
  const update = (field: keyof BusinessSettings, value: string | boolean) => setDraft((current) => ({ ...current, [field]: value }))
  const saveSettings = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSettings(draft); setSaved(true); window.setTimeout(() => setSaved(false), 2200) }
  return <><section className="welcome-row settings-heading"><div><p className="eyebrow">PREFERENCIAS DEL ESPACIO</p><h1>Configuración</h1><p className="subheading">Personaliza la información y el funcionamiento de tu negocio.</p></div><button className="primary-button" onClick={() => setSettings(draft)}><Save size={17} /> Guardar cambios</button></section><form className="settings-layout" onSubmit={saveSettings}><div className="settings-main"><section className="panel settings-section"><div className="settings-section-heading"><div><h2>Información del negocio</h2><p>Estos datos identifican tu espacio de trabajo.</p></div><span className="settings-section-icon"><Settings size={17} /></span></div><div className="settings-form-grid"><label>Nombre del negocio<input value={draft.businessName} onChange={(event) => update('businessName', event.target.value)} /></label><label>Nombre del responsable<input value={draft.ownerName} onChange={(event) => update('ownerName', event.target.value)} /></label><label>Correo electrónico<input type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} /></label><label>Teléfono<input value={draft.phone} onChange={(event) => update('phone', event.target.value)} /></label></div></section><section className="panel settings-section"><div className="settings-section-heading"><div><h2>Preferencias regionales</h2><p>Define cómo se muestran fechas y valores.</p></div><span className="settings-section-icon"><WalletCards size={17} /></span></div><div className="settings-form-grid"><label>Moneda<select value={draft.currency} onChange={(event) => update('currency', event.target.value)}><option>USD - Dólar estadounidense</option><option>ARS - Peso argentino</option><option>COP - Peso colombiano</option><option>EUR - Euro</option></select></label><label>Zona horaria<select value={draft.timezone} onChange={(event) => update('timezone', event.target.value)}><option>GMT-3 · Buenos Aires</option><option>GMT-5 · Bogotá</option><option>GMT-6 · Ciudad de México</option></select></label><label>La semana comienza el<select value={draft.weekStartsOn} onChange={(event) => update('weekStartsOn', event.target.value)}><option>Lunes</option><option>Domingo</option></select></label></div></section></div><aside className="settings-side"><section className="panel settings-section"><div className="settings-section-heading"><div><h2>Agenda</h2><p>Controla tus avisos.</p></div><span className="settings-section-icon"><BellRing size={17} /></span></div><label className="switch-row"><span><strong>Recordatorios</strong><small>Recibe avisos de tus próximas actividades.</small></span><input type="checkbox" checked={draft.reminders} onChange={(event) => update('reminders', event.target.checked)} /><i /></label></section><section className="settings-save-card"><div className="settings-save-icon"><Save size={19} /></div><h2>Todo listo para trabajar</h2><p>Tus preferencias se aplican a este espacio de trabajo.</p><button className="primary-button" type="submit">{saved ? 'Cambios guardados' : 'Guardar configuración'}</button></section></aside></form></>
}
function InventoryPage({ projectId, products, setProducts, entries, exits, setEntries, setExits, onEditProduct, setIsProductModalOpen }: { projectId: string | null; products: Product[]; setProducts: (products: Product[]) => void; entries: InventoryMovement[]; exits: InventoryMovement[]; setEntries: (movements: InventoryMovement[]) => void; setExits: (movements: InventoryMovement[]) => void; onEditProduct: (product: Product) => void; setIsProductModalOpen: (value: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<'products' | 'entries' | 'exits' | 'stock'>('products')
  const [search, setSearch] = useState('')
  const [movementModal, setMovementModal] = useState<'entry' | 'exit' | null>(null)
  const [, setMovementError] = useState('')
  const visibleProducts = products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase()))
  const tabs = [{ id: 'products', label: 'Productos' }, { id: 'entries', label: 'Entradas' }, { id: 'exits', label: 'Salidas' }, { id: 'stock', label: 'Stock' }] as const
  const movementProductName = (movement: InventoryMovement) => productName(movement.productId, products)
  useEffect(() => {
    if (!supabase || !projectId) return
    Promise.all([getProducts(projectId), getInventoryMovements(projectId)]).then(([productResult, movementResult]) => {
      if (productResult.error) window.alert(productResult.error.message)
      else if (productResult.data) setProducts(productResult.data.map((product) => ({ id: product.id, name: product.name, sku: product.code, price: Number(product.sale_price) })))
      if (movementResult.error) window.alert(movementResult.error.message)
      else if (movementResult.data) {
        setEntries(movementResult.data.filter((movement) => movement.movement_type === 'entry').map((movement) => ({ id: movement.id, productId: movement.product_id, quantity: movement.quantity, date: movement.movement_date })))
        setExits(movementResult.data.filter((movement) => movement.movement_type === 'exit').map((movement) => ({ id: movement.id, productId: movement.product_id, quantity: movement.quantity, date: movement.movement_date })))
      }
    })
  }, [projectId, setEntries, setExits, setProducts])
  const stockFor = (productId: string) => ({ entries: entries.filter((item) => item.productId === productId).reduce((total, item) => total + item.quantity, 0), exits: exits.filter((item) => item.productId === productId).reduce((total, item) => total + item.quantity, 0) })
  const deleteProduct = async (product: Product) => {
    if (!window.confirm(`¿Eliminar el producto "${product.name}" del catálogo? Sus movimientos históricos se conservarán.`)) return
    if (supabase && projectId) {
      const { error } = await deleteProductRemote(product.id)
      if (error) { window.alert(error.message); return }
    }
    setProducts(products.filter((item) => item.id !== product.id))
  }
  const addMovement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const quantity = Number(form.get('quantity'))
    const productId = String(form.get('productId'))
    if (!quantity || quantity <= 0 || !productId || !movementModal) return
    if (movementModal === 'exit') {
      const stock = stockFor(productId)
      const available = stock.entries - stock.exits
      if (quantity > available) { window.alert(`Solo hay ${available} unidades disponibles para este producto.`); return }
    }
    const movement = { id: Date.now(), productId, quantity, date: String(form.get('date')) }
    if (supabase && projectId) {
      const { data, error } = await createInventoryMovement(projectId, { product_id: productId, movement_type: movementModal, quantity, movement_date: movement.date })
      if (error || !data) { window.alert(error?.message ?? 'No se pudo registrar el movimiento.'); return }
      movement.id = data.id
    }
    if (movementModal === 'entry') setEntries([...entries, movement])
    else setExits([...exits, movement])
    setMovementError('')
    setMovementModal(null)
    event.currentTarget.reset()
  }
  return <><section className="welcome-row finance-heading"><div><p className="eyebrow">CONTROL DE INVENTARIO</p><h1>Inventario</h1><p className="subheading">Organiza productos, movimientos y existencias de tu negocio.</p></div><button className="primary-button" onClick={() => activeTab === 'products' ? setIsProductModalOpen(true) : setMovementModal(activeTab === 'entries' ? 'entry' : 'exit')}><Plus size={18} /> {activeTab === 'products' ? 'Añadir producto' : activeTab === 'entries' ? 'Registrar entrada' : activeTab === 'exits' ? 'Registrar salida' : 'Nuevo movimiento'}</button></section><div className="inventory-tabs" role="tablist">{tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'selected' : ''} onClick={() => setActiveTab(tab.id)}>{tab.label}<span>{tab.id === 'products' ? products.length : tab.id === 'entries' ? entries.length : tab.id === 'exits' ? exits.length : products.length}</span></button>)}</div>{activeTab === 'products' && <section className="panel inventory-panel"><div className="panel-heading"><div><h2>Productos</h2><p>{visibleProducts.length} productos encontrados</p></div><label className="search-field inventory-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o código..." /></label></div><div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id}><div className="product-card-top"><span className="product-avatar"><Package size={18} /></span><span className="stock-status"><i /> Activo</span><div className="product-card-actions"><button className="edit-product-button" type="button" aria-label={`Editar ${product.name}`} title="Editar producto" onClick={() => onEditProduct(product)}><Edit3 size={14} /></button><button className="delete-product-button" type="button" aria-label={`Eliminar ${product.name}`} title="Eliminar producto" onClick={() => deleteProduct(product)}><Trash2 size={15} /></button></div></div><h3>{product.name}</h3><p>{product.sku}</p><strong>{formatMoney(product.price)}</strong><small>Precio de venta por unidad</small></article>)}{visibleProducts.length === 0 && <div className="no-results"><Search size={23} /><strong>No encontramos productos</strong><span>Prueba con otro nombre o código.</span></div>}</div></section>}{(activeTab === 'entries' || activeTab === 'exits') && <MovementTable title={activeTab === 'entries' ? 'Entradas de productos' : 'Salidas de productos'} movements={activeTab === 'entries' ? entries : exits} products={products} movementProductName={movementProductName} tone={activeTab === 'entries' ? 'income' : 'expense'} />}{activeTab === 'stock' && <StockTable products={products} getStock={stockFor} />}{movementModal && <MovementModal type={movementModal} products={products} onClose={() => setMovementModal(null)} onSubmit={addMovement} />}</>
}

function MovementTable({ title, movements, products, movementProductName, tone }: { title: string; movements: InventoryMovement[]; products: Product[]; movementProductName: (movement: InventoryMovement) => string; tone: 'income' | 'expense' }) { return <section className="panel inventory-table-panel"><div className="panel-heading"><div><h2>{title}</h2><p>{movements.length} movimientos registrados</p></div></div><div className="finance-table-wrap"><table><thead><tr><th>Producto</th><th>Código</th><th className="align-right">Cantidad</th><th>Fecha</th></tr></thead><tbody>{movements.map((movement) => <tr key={movement.id}><td><div className="table-operation"><span className={`transaction-icon ${tone}`}><Package size={16} /></span><strong>{movementProductName(movement)}</strong></div></td><td>{products.find((product) => product.id === movement.productId)?.sku ?? 'Sin código'}</td><td className={`align-right table-amount ${tone === 'expense' ? 'amount-expense' : 'amount-income'}`}>{tone === 'expense' ? '-' : '+'} {movement.quantity}</td><td>{formatDate(movement.date)}</td></tr>)}</tbody></table>{movements.length === 0 && <div className="no-results"><Package size={23} /><strong>No hay movimientos</strong><span>Registra el primero con el botón superior.</span></div>}</div></section> }

function StockTable({ products, getStock }: { products: Product[]; getStock: (productId: string) => { entries: number; exits: number } }) { return <section className="panel inventory-table-panel"><div className="panel-heading"><div><h2>Stock actual</h2><p>Entradas menos salidas por producto</p></div></div><div className="finance-table-wrap"><table><thead><tr><th>Código</th><th>Producto</th><th className="align-right">Entradas</th><th className="align-right">Salidas</th><th className="align-right">Stock</th></tr></thead><tbody>{products.map((product) => { const stock = getStock(product.id); const currentStock = stock.entries - stock.exits; return <tr key={product.id}><td>{product.sku}</td><td><div className="table-operation"><span className="product-avatar"><Package size={16} /></span><strong>{product.name}</strong>{currentStock <= 3 && <span className="low-stock-label">Stock bajo</span>}</div></td><td className="align-right amount-income">{stock.entries}</td><td className="align-right amount-expense">{stock.exits}</td><td className={`align-right stock-value ${currentStock <= 0 ? 'stock-empty' : currentStock <= 3 ? 'stock-low' : ''}`}>{currentStock}</td></tr> })}</tbody></table></div></section> }
function TransactionModal({ products, onClose, onSubmit }: { products: Product[]; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [transactionType, setTransactionType] = useState<TransactionType>('income')

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">NUEVO MOVIMIENTO</p>
            <h2 id="modal-title">Registrar operación</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="type-toggle">
            <label>
              <input
                type="radio"
                name="type"
                value="income"
                checked={transactionType === 'income'}
                onChange={() => setTransactionType('income')}
              />
              <span>Ingreso</span>
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={transactionType === 'expense'}
                onChange={() => setTransactionType('expense')}
              />
              <span>Gasto</span>
            </label>
          </div>

          <div className="form-row">
            <label>
              Descripción
              <input name="title" required placeholder="Ej. Pago de cliente" />
            </label>
            <label>
              Fecha
              <input name="date" type="date" defaultValue={getTodayDateString()} required />
            </label>
          </div>

          <div className="form-row">
            <label>
              Cantidad
              <input name="quantity" type="number" min="1" step="1" required placeholder="Ej. 3" />
            </label>
            <label>
              Monto
              <input name="amount" type="number" min="0" step="0.01" required placeholder="Ej. 1250.00" />
            </label>
          </div>

          {transactionType === 'income' ? (
            <>
              <div className="form-row">
                <label>
                  Cliente
                  <input name="client" placeholder="Ej. Grupo Norte" />
                </label>
                <label>
                  Producto
                  <select name="productId" defaultValue={products[0]?.id}>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} · {formatMoney(product.price)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Categoría
                  <select name="category" defaultValue="Ventas">
                    <option>Ventas</option>
                    <option>Compras</option>
                    <option>Servicios</option>
                    <option>Marketing</option>
                  </select>
                </label>
                <label>
                  Cuenta
                  <select name="account" defaultValue="Cuenta principal">
                    <option>Cuenta principal</option>
                    <option>Tarjeta corporativa</option>
                    <option>Efectivo</option>
                  </select>
                </label>
              </div>
            </>
          ) : (
            <div className="form-note">
              <small>Para un gasto, completa sólo Nombre del gasto, Monto, Cantidad y Fecha.</small>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Guardar movimiento
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
function MovementModal({ type, products, error = '', onClose, onSubmit }: { type: 'entry' | 'exit'; products: Product[]; error?: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const isEntry = type === 'entry'

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="movement-modal-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">INVENTARIO</p>
            <h2 id="movement-modal-title">Registrar {isEntry ? 'entrada' : 'salida'}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            Producto
            <select name="productId" defaultValue={products[0]?.id} required>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.sku} · {product.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              Cantidad
              <input name="quantity" type="number" min="1" step="1" required placeholder="Ej. 10" />
            </label>
            <label>
              Fecha
              <input name="date" type="date" defaultValue={getTodayDateString()} required />
            </label>
          </div>
          <div className={`movement-note ${isEntry ? 'entry-note' : 'exit-note'}`}>
            <Package size={16} />
            <span>{isEntry ? 'La cantidad se sumará al stock disponible.' : 'La cantidad se restará del stock disponible.'}</span>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Guardar {isEntry ? 'entrada' : 'salida'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
function ProductModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">CATÁLOGO LOCAL</p>
            <h2 id="product-modal-title">Agregar producto</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            Nombre del producto
            <input name="name" required placeholder="Ej. Plan empresarial" />
          </label>
          <div className="form-row">
            <label>
              SKU
              <input name="sku" required placeholder="Ej. SRV-004" />
            </label>
            <label>
              Precio por unidad
              <input name="price" type="number" min="0.01" step="0.01" required placeholder="0,00" />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Guardar producto
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default App
