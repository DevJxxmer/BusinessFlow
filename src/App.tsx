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

type View = 'Resumen' | 'Finanzas' | 'Inventario' | 'Agenda' | 'Configuración'
type PublicScreen = 'welcome' | 'login' | 'signup' | 'projects'
type TransactionType = 'income' | 'expense'
type Product = { id: string; name: string; sku: string; price: number }
type InventoryMovement = { id: number; productId: string; quantity: number; date: string }
type Transaction = { id: number; title: string; client: string; productId: string; quantity: number; category: string; date: string; amount: number; type: TransactionType; account: string }
type BusinessSettings = { businessName: string; ownerName: string; email: string; phone: string; currency: string; timezone: string; weekStartsOn: string; reminders: boolean }
type Project = { id: number; name: string; detail: string; initials: string; color: 'green' | 'coral' }

const navigation: { label: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Resumen', icon: LayoutDashboard },
  { label: 'Finanzas', icon: WalletCards },
  { label: 'Inventario', icon: Package },
  { label: 'Agenda', icon: CalendarDays },
]
const initialProducts: Product[] = [
  { id: 'consultoria-base', name: 'Consultoría base', sku: 'SRV-001', price: 850 },
  { id: 'plan-mensual', name: 'Plan mensual', sku: 'SRV-002', price: 129 },
  { id: 'kit-inicial', name: 'Kit inicial', sku: 'PRD-001', price: 420 },
  { id: 'soporte-premium', name: 'Soporte premium', sku: 'SRV-003', price: 320 },
]
const initialTransactions: Transaction[] = [
  { id: 1, title: 'Pago recibido', client: 'Grupo Norte', productId: 'consultoria-base', quantity: 5, category: 'Ventas', date: '2025-07-02', amount: 4280, type: 'income', account: 'Cuenta principal' },
  { id: 2, title: 'Compra de insumos', client: 'Proveedor Uno', productId: 'kit-inicial', quantity: 2, category: 'Compras', date: '2025-07-01', amount: 860.5, type: 'expense', account: 'Cuenta principal' },
  { id: 3, title: 'Suscripción software', client: 'BusinessFlow', productId: 'plan-mensual', quantity: 1, category: 'Servicios', date: '2025-06-28', amount: 129, type: 'expense', account: 'Tarjeta corporativa' },
  { id: 4, title: 'Factura', client: 'Estudio Creativo', productId: 'soporte-premium', quantity: 8, category: 'Ventas', date: '2025-06-26', amount: 2450, type: 'income', account: 'Cuenta principal' },
  { id: 5, title: 'Publicidad redes sociales', client: 'BusinessFlow', productId: 'soporte-premium', quantity: 1, category: 'Marketing', date: '2025-06-24', amount: 320, type: 'expense', account: 'Tarjeta corporativa' },
  { id: 6, title: 'Pago recibido', client: 'Café Central', productId: 'plan-mensual', quantity: 4, category: 'Ventas', date: '2025-06-22', amount: 1780, type: 'income', account: 'Cuenta principal' },
]
const initialEntries: InventoryMovement[] = [
  { id: 1, productId: 'kit-inicial', quantity: 18, date: '2025-07-01' },
  { id: 2, productId: 'plan-mensual', quantity: 12, date: '2025-06-28' },
  { id: 3, productId: 'soporte-premium', quantity: 10, date: '2025-06-26' },
]
const initialExits: InventoryMovement[] = [
  { id: 1, productId: 'kit-inicial', quantity: 4, date: '2025-07-02' },
  { id: 2, productId: 'plan-mensual', quantity: 5, date: '2025-07-02' },
  { id: 3, productId: 'soporte-premium', quantity: 3, date: '2025-06-27' },
]
const chartValues = [40, 54, 46, 68, 52, 78, 62, 88, 72, 96, 80, 100]
const currencyCodes: Record<string, string> = { 'USD - Dólar estadounidense': 'USD', 'ARS - Peso argentino': 'ARS', 'COP - Peso colombiano': 'COP', 'EUR - Euro': 'EUR' }
let activeCurrency = 'USD - Dólar estadounidense'
const formatMoney = (value: number) => { const code = currencyCodes[activeCurrency] ?? 'USD'; const decimals = code === 'COP' ? 0 : 2; return new Intl.NumberFormat(code === 'COP' ? 'es-CO' : 'es-AR', { style: 'currency', currency: code, minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value) }
const formatDate = (date: string) => new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`))
const productName = (productId: string, catalog: Product[]) => catalog.find((product) => product.id === productId)?.name ?? 'Producto no encontrado'
const operationName = (transaction: Transaction) => `${transaction.title} · ${transaction.client}`
const initialSettings: BusinessSettings = { businessName: 'Jeimer Negocios', ownerName: 'Jeimer Morales', email: 'jeimer@negocios.com', phone: '+54 11 5555 0101', currency: 'USD - Dólar estadounidense', timezone: 'GMT-3 · Buenos Aires', weekStartsOn: 'Lunes', reminders: true }
const storageKeys = { transactions: 'businessflow:transactions', products: 'businessflow:products', entries: 'businessflow:entries', exits: 'businessflow:exits', settings: 'businessflow:settings', agenda: 'businessflow:agenda', projects: 'businessflow:projects' } as const
function loadLocal<T>(key: string, fallback: T): T { try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback } }

function App() {
  const [publicScreen, setPublicScreen] = useState<PublicScreen>('welcome')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeView, setActiveView] = useState<View>('Resumen')
  const [period, setPeriod] = useState('Últimos 30 días')
  const [transactions, setTransactions] = useState(() => loadLocal(storageKeys.transactions, initialTransactions))
  const [products, setProducts] = useState(() => loadLocal(storageKeys.products, initialProducts))
  const [entries, setEntries] = useState(() => loadLocal(storageKeys.entries, initialEntries))
  const [exits, setExits] = useState(() => loadLocal(storageKeys.exits, initialExits))
  const [transactionFilter, setTransactionFilter] = useState<'all' | TransactionType>('all')
  const [categoryFilter, setCategoryFilter] = useState('Todas las categorías')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [settings, setSettings] = useState(() => loadLocal(storageKeys.settings, initialSettings))
  activeCurrency = settings.currency

  useEffect(() => { window.localStorage.setItem(storageKeys.transactions, JSON.stringify(transactions)) }, [transactions])
  useEffect(() => { window.localStorage.setItem(storageKeys.products, JSON.stringify(products)) }, [products])
  useEffect(() => { window.localStorage.setItem(storageKeys.entries, JSON.stringify(entries)) }, [entries])
  useEffect(() => { window.localStorage.setItem(storageKeys.exits, JSON.stringify(exits)) }, [exits])
  useEffect(() => { window.localStorage.setItem(storageKeys.settings, JSON.stringify(settings)) }, [settings])

  const totals = useMemo(() => transactions.reduce((result, item) => ({ ...result, [item.type]: result[item.type] + item.amount }), { income: 0, expense: 0 }), [transactions])
  const filteredTransactions = useMemo(() => transactions.filter((item) => {
    const matchesType = transactionFilter === 'all' || item.type === transactionFilter
    const matchesCategory = categoryFilter === 'Todas las categorías' || item.category === categoryFilter
    const searchableText = `${item.title} ${item.client} ${productName(item.productId, products)} ${item.category}`.toLowerCase()
    const matchesSearch = searchableText.includes(search.toLowerCase())
    return matchesType && matchesCategory && matchesSearch
  }), [categoryFilter, products, search, transactionFilter, transactions])

  if (!isAuthenticated) {
    if (publicScreen === 'welcome') return <WelcomeScreen onStart={() => setPublicScreen('login')} />
    if (publicScreen === 'login') return <LoginScreen onBack={() => setPublicScreen('welcome')} onSignup={() => setPublicScreen('signup')} onLogin={() => setPublicScreen('projects')} />
    if (publicScreen === 'signup') return <SignupScreen onBack={() => setPublicScreen('login')} onSignup={() => setPublicScreen('projects')} />
    return <ProjectScreen onBack={() => setPublicScreen('login')} onSelect={() => setIsAuthenticated(true)} />
  }

  const addTransaction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const quantity = Number(form.get('quantity'))
    const product = products.find((item) => item.id === form.get('productId'))
    if (!quantity || quantity <= 0 || !product) return
    setTransactions((current) => [{ id: Date.now(), title: String(form.get('title')), client: String(form.get('client')), productId: product.id, quantity, category: String(form.get('category')), date: String(form.get('date')), amount: quantity * product.price, type: form.get('type') as TransactionType, account: String(form.get('account')) }, ...current])
    setIsModalOpen(false)
    event.currentTarget.reset()
  }

  const addProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name')).trim()
    const sku = String(form.get('sku')).trim()
    const price = Number(form.get('price'))
    if (!name || !sku || !price || price <= 0) return
    setProducts((current) => [...current, { id: `${sku.toLowerCase()}-${Date.now()}`, name, sku, price }])
    setIsProductModalOpen(false)
    event.currentTarget.reset()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">b</span><span>business<span className="brand-accent">flow</span></span></div>
        <div className="workspace-switcher"><span className="workspace-dot">JN</span><span className="workspace-name">Jeimer Negocios<small>Plan profesional</small></span><ChevronDown size={15} /></div>
        <nav aria-label="Navegación principal"><span className="nav-label">Espacio de trabajo</span>{navigation.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeView === label ? 'active' : ''}`} onClick={() => setActiveView(label)}><Icon size={18} /><span>{label}</span></button>)}<span className="nav-label nav-label-lower">Cuenta</span><button className={`nav-item ${activeView === 'Configuración' ? 'active' : ''}`} onClick={() => setActiveView('Configuración')}><Settings size={18} /><span>Configuración</span></button></nav>
        <div className="sidebar-bottom"><div className="help-link"><CircleHelp size={17} /><span>Centro de ayuda</span></div><div className="user-card"><span className="avatar">JM</span><span><strong>Jeimer Morales</strong><small>Administrador</small></span><ChevronDown size={15} /></div></div>
      </aside>
      <main className="main-content"><header className="topbar"><div className="breadcrumb"><span>Espacio de trabajo</span><span>/</span><strong>{activeView}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notificaciones"><Bell size={19} /><span className="notification-dot" /></button><button className="profile-button"><span className="avatar avatar-small">JM</span><ChevronDown size={15} /></button></div></header>
        <div className="page-content">
          {activeView === 'Resumen' && <Dashboard transactions={transactions} totals={totals} period={period} setPeriod={setPeriod} setActiveView={setActiveView} setIsModalOpen={setIsModalOpen} />}
          {activeView === 'Finanzas' && <FinancePage transactions={filteredTransactions} totals={totals} products={products} search={search} setSearch={setSearch} transactionFilter={transactionFilter} setTransactionFilter={setTransactionFilter} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} setIsModalOpen={setIsModalOpen} />}
          {activeView === 'Inventario' && <InventoryPage products={products} setProducts={setProducts} entries={entries} exits={exits} setEntries={setEntries} setExits={setExits} setIsProductModalOpen={setIsProductModalOpen} />}
          {activeView === 'Agenda' && <AgendaPage />}
          {activeView === 'Configuración' && <SettingsPage settings={settings} setSettings={setSettings} />}
        </div>
      </main>
      {isModalOpen && <TransactionModal products={products} onClose={() => setIsModalOpen(false)} onSubmit={addTransaction} />}
      {isProductModalOpen && <ProductModal onClose={() => setIsProductModalOpen(false)} onSubmit={addProduct} />}
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

function LoginScreen({ onBack, onSignup, onLogin }: { onBack: () => void; onSignup: () => void; onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return <main className="public-screen auth-screen"><div className="auth-decoration" /><button className="back-link" onClick={onBack}>← Volver al inicio</button><section className="auth-card"><div className="brand public-brand"><span className="brand-mark">b</span><span>business<span className="brand-accent">flow</span></span></div><div className="auth-heading"><p className="eyebrow">BIENVENIDO DE NUEVO</p><h1>Inicia sesión</h1><p>Continúa gestionando tu negocio con claridad.</p></div><form onSubmit={(event) => { event.preventDefault(); if (email && password) onLogin() }}><label>Correo electrónico<div className="input-with-icon"><Mail size={16} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@empresa.com" /></div></label><label>Contraseña<div className="input-with-icon"><LockKeyhole size={16} /><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" /></div></label><button className="primary-button auth-submit" type="submit">Iniciar sesión <ArrowRight size={16} /></button></form><button className="forgot-link">¿Olvidaste tu contraseña?</button><div className="auth-divider"><span>o continúa con</span></div><button className="secondary-auth-button" type="button" onClick={onLogin}>Acceso de demostración</button><p className="signup-prompt">¿Aún no tienes una cuenta? <button type="button" onClick={onSignup}>Crear cuenta</button></p><p className="auth-legal">Al continuar aceptas nuestros términos de uso y política de privacidad.</p></section></main>
}

function SignupScreen({ onBack, onSignup }: { onBack: () => void; onSignup: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  return <main className="public-screen auth-screen"><div className="auth-decoration signup-decoration" /><button className="back-link" onClick={onBack}>← Volver al inicio de sesión</button><section className="auth-card signup-card"><div className="brand public-brand"><span className="brand-mark">b</span><span>business<span className="brand-accent">flow</span></span></div><div className="auth-heading"><p className="eyebrow">EMPIEZA A ORGANIZARTE</p><h1>Crea tu cuenta</h1><p>Configura tu espacio de trabajo en pocos pasos.</p></div><form onSubmit={(event) => { event.preventDefault(); if (name && email && password && password === confirmation) onSignup() }}><label>Nombre completo<div className="input-with-icon"><UserRound size={16} /><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Jeimer Morales" /></div></label><label>Correo electrónico<div className="input-with-icon"><Mail size={16} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@empresa.com" /></div></label><div className="form-row"><label>Contraseña<div className="input-with-icon"><LockKeyhole size={16} /><input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" /></div></label><label>Confirmar contraseña<div className="input-with-icon"><LockKeyhole size={16} /><input type="password" required minLength={6} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Repite tu contraseña" /></div></label></div>{confirmation && password !== confirmation && <p className="form-error">Las contraseñas no coinciden.</p>}<button className="primary-button auth-submit" type="submit"><UserPlus size={16} /> Crear cuenta</button></form><p className="auth-legal">Al crear tu cuenta aceptas nuestros términos de uso y política de privacidad.</p></section></main>
}

function ProjectScreen({ onBack, onSelect }: { onBack: () => void; onSelect: () => void }) {
  const [projects, setProjects] = useState<Project[]>(() => loadLocal(storageKeys.projects, [{ id: 1, name: 'Jeimer Negocios', detail: 'Negocio principal', initials: 'JN', color: 'green' }, { id: 2, name: 'Estudio Creativo', detail: 'Proyecto compartido', initials: 'EC', color: 'coral' }]))
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const createProject = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const cleanName = name.trim(); if (!cleanName) return; const initials = cleanName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); setProjects((current) => [...current, { id: Date.now(), name: cleanName, detail: 'Proyecto nuevo', initials, color: 'green' }]); setName(''); setCreating(false) }
  useEffect(() => { window.localStorage.setItem(storageKeys.projects, JSON.stringify(projects)) }, [projects])
  return <main className="public-screen project-screen"><div className="project-topbar"><div className="brand public-brand"><span className="brand-mark">b</span><span>business<span className="brand-accent">flow</span></span></div><span className="project-user"><span className="avatar avatar-small">JM</span> Jeimer Morales</span></div><section className="project-content"><p className="eyebrow">TU ESPACIO DE TRABAJO</p><h1>Elige un proyecto</h1><p className="subheading">Selecciona el negocio que quieres gestionar.</p><div className="project-list">{projects.map((project) => <button className="project-card" key={project.id} onClick={onSelect}><span className={`project-icon ${project.color}`}>{project.initials}</span><span><strong>{project.name}</strong><small>{project.detail}</small></span><ArrowRight size={18} /></button>)}{creating ? <form className="new-project-form" onSubmit={createProject}><label>Nombre del proyecto<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Mi empresa" /></label><div><button type="button" className="cancel-button" onClick={() => setCreating(false)}>Cancelar</button><button type="submit" className="primary-button">Crear proyecto</button></div></form> : <button className="new-project-card" onClick={() => setCreating(true)}><Plus size={17} /><span>Crear un nuevo proyecto</span></button>}</div><button className="back-link project-back" onClick={onBack}>← Volver al inicio de sesión</button></section></main>
}

function Dashboard({ transactions, totals, period, setPeriod, setActiveView, setIsModalOpen }: { transactions: Transaction[]; totals: { income: number; expense: number }; period: string; setPeriod: (value: string) => void; setActiveView: (view: View) => void; setIsModalOpen: (value: boolean) => void }) {
  return <>
    <section className="welcome-row"><div><p className="eyebrow">MIÉRCOLES, 02 DE JULIO DE 2025</p><h1>Buenos días, Jeimer</h1><p className="subheading">Aquí tienes el estado de tu negocio en un vistazo.</p></div><button className="primary-button" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Nueva operación</button></section>
    <section className="metric-grid"><article className="metric-card featured"><div className="metric-top"><span>Saldo disponible</span><WalletCards size={19} /></div><strong>{formatMoney(24680.5 + (totals.income - 8510) - (totals.expense - 1309.5))}</strong><div className="metric-change positive"><ArrowUpRight size={15} /> 12,8% <span>vs. mes anterior</span></div><div className="mini-bars">{[35, 48, 42, 62, 50, 72, 57, 84, 70, 89].map((height) => <i key={height} style={{ height: `${height}%` }} />)}</div></article><article className="metric-card"><div className="metric-top"><span>Ingresos este mes</span><span className="metric-icon green"><TrendingUp size={18} /></span></div><strong>{formatMoney(totals.income)}</strong><div className="metric-change positive"><ArrowUpRight size={15} /> 8,4% <span>vs. mes anterior</span></div></article><article className="metric-card"><div className="metric-top"><span>Gastos este mes</span><span className="metric-icon coral"><CreditCard size={18} /></span></div><strong>{formatMoney(totals.expense)}</strong><div className="metric-change negative"><ArrowDownRight size={15} /> 3,2% <span>vs. mes anterior</span></div></article></section>
    <div className="content-grid"><section className="panel cashflow-panel"><div className="panel-heading"><div><h2>Flujo de caja</h2><p>Ingresos y gastos a lo largo del tiempo</p></div><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Periodo del flujo de caja"><option>Últimos 30 días</option><option>Últimos 90 días</option><option>Este año</option></select></div><div className="chart-legend"><span><i className="legend-dot income-dot" />Ingresos</span><span><i className="legend-dot expense-dot" />Gastos</span></div><Chart /></section><section className="panel transactions-panel"><div className="panel-heading"><div><h2>Actividad reciente</h2><p>Últimos movimientos registrados</p></div><button className="text-button" onClick={() => setActiveView('Finanzas')}>Ver todo <ArrowUpRight size={15} /></button></div><div className="transaction-list">{transactions.slice(0, 3).map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}</div><button className="outline-button" onClick={() => setIsModalOpen(true)}><Plus size={16} /> Registrar movimiento</button></section></div>
    <section className="bottom-grid"><div className="insight-card"><div className="insight-icon"><Sparkles size={20} /></div><div><span className="eyebrow">RESUMEN INTELIGENTE</span><h2>Tu negocio va por buen camino</h2><p>Los ingresos crecieron un 12,8% este mes. Mantén el ritmo para alcanzar tu objetivo.</p></div><ArrowUpRight size={18} /></div><div className="goal-card"><div className="goal-header"><div><h2>Objetivo mensual</h2><p>Ingresos objetivo · Julio</p></div><strong>78%</strong></div><div className="progress-track"><span /></div><div className="goal-footer"><span>{formatMoney(totals.income)} recaudados</span><span>de $ 23.500</span></div></div></section>
  </>
}

function FinancePage({ transactions, totals, products, search, setSearch, transactionFilter, setTransactionFilter, categoryFilter, setCategoryFilter, setIsModalOpen }: { transactions: Transaction[]; totals: { income: number; expense: number }; products: Product[]; search: string; setSearch: (value: string) => void; transactionFilter: 'all' | TransactionType; setTransactionFilter: (value: 'all' | TransactionType) => void; categoryFilter: string; setCategoryFilter: (value: string) => void; setIsModalOpen: (value: boolean) => void }) {
  return <><section className="welcome-row finance-heading"><div><p className="eyebrow">CONTROL FINANCIERO</p><h1>Finanzas</h1><p className="subheading">Administra ingresos, gastos, clientes y productos.</p></div><button className="primary-button" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Nueva operación</button></section><section className="finance-summary"><div><span>Ingresos</span><strong className="summary-income">{formatMoney(totals.income)}</strong><small>Este mes</small></div><div><span>Gastos</span><strong className="summary-expense">{formatMoney(totals.expense)}</strong><small>Este mes</small></div><div><span>Balance neto</span><strong>{formatMoney(totals.income - totals.expense)}</strong><small>Ingresos menos gastos</small></div></section><section className="panel finance-table-panel"><div className="panel-heading"><div><h2>Movimientos</h2><p>{transactions.length} operaciones encontradas</p></div><button className="filter-button"><Filter size={15} /> Filtros</button></div><div className="finance-toolbar"><label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente, producto..." /></label><div className="filter-tabs"><button className={transactionFilter === 'all' ? 'selected' : ''} onClick={() => setTransactionFilter('all')}>Todos</button><button className={transactionFilter === 'income' ? 'selected' : ''} onClick={() => setTransactionFilter('income')}>Ingresos</button><button className={transactionFilter === 'expense' ? 'selected' : ''} onClick={() => setTransactionFilter('expense')}>Gastos</button></div><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filtrar por categoría"><option>Todas las categorías</option><option>Ventas</option><option>Compras</option><option>Servicios</option><option>Marketing</option></select></div><div className="finance-table-wrap"><table><thead><tr><th>Operación</th><th>Producto</th><th className="align-right">Cantidad</th><th>Categoría</th><th>Fecha</th><th className="align-right">Total</th><th aria-label="Acciones" /></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction.id}><td><div className="table-operation"><span className={`transaction-icon ${transaction.type}`}><ReceiptText size={16} /></span><strong>{operationName(transaction)}</strong></div></td><td><span className="product-cell">{productName(transaction.productId, products)}</span></td><td className="align-right">{transaction.quantity}</td><td><span className="category-pill">{transaction.category}</span></td><td>{formatDate(transaction.date)}</td><td className={`align-right table-amount ${transaction.type === 'income' ? 'amount-income' : 'amount-expense'}`}>{transaction.type === 'income' ? '+' : '-'} {formatMoney(transaction.amount)}</td><td><button className="row-menu" aria-label={`Opciones para ${operationName(transaction)}`}>•••</button></td></tr>)}</tbody></table>{transactions.length === 0 && <div className="no-results"><Search size={23} /><strong>No encontramos movimientos</strong><span>Prueba con otro filtro o término de búsqueda.</span></div>}</div></section></>
}

function TransactionRow({ transaction }: { transaction: Transaction }) { return <div className="transaction"><span className={`transaction-icon ${transaction.type}`}><ReceiptText size={16} /></span><div className="transaction-detail"><strong>{operationName(transaction)}</strong><span>{transaction.date === '2025-07-02' ? 'Hoy, 10:42' : formatDate(transaction.date)}</span></div><strong className={transaction.type === 'income' ? 'amount-income' : 'amount-expense'}>{transaction.type === 'income' ? '+' : '-'} {formatMoney(transaction.amount)}</strong></div> }
function Chart() { return <div className="chart"><div className="y-axis"><span>$20k</span><span>$15k</span><span>$10k</span><span>$5k</span><span>$0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /><i /></div><div className="bars">{chartValues.map((value, index) => <div className="bar-group" key={index}><div className="bar income-bar" style={{ height: `${value}%` }} /><div className="bar expense-bar" style={{ height: `${Math.max(22, value - 30)}%` }} /></div>)}</div><div className="x-axis"><span>01 Jun</span><span>08 Jun</span><span>15 Jun</span><span>22 Jun</span><span>30 Jun</span></div></div></div> }
type AgendaEvent = { id: number; title: string; client: string; date: string; time: string; duration: string; type: 'reunion' | 'tarea' | 'recordatorio'; location: string; status: 'confirmada' | 'pendiente' }
const initialAgendaEvents: AgendaEvent[] = [
  { id: 1, title: 'Revisión de propuesta', client: 'Grupo Norte', date: '2025-07-02', time: '09:30', duration: '45 min', type: 'reunion', location: 'Videollamada', status: 'confirmada' },
  { id: 2, title: 'Entrega de materiales', client: 'Proveedor Uno', date: '2025-07-02', time: '12:00', duration: '30 min', type: 'tarea', location: 'Oficina principal', status: 'pendiente' },
  { id: 3, title: 'Llamada de seguimiento', client: 'Café Central', date: '2025-07-02', time: '15:30', duration: '30 min', type: 'recordatorio', location: 'Videollamada', status: 'confirmada' },
  { id: 4, title: 'Cierre mensual', client: 'BusinessFlow', date: '2025-07-03', time: '10:00', duration: '60 min', type: 'tarea', location: 'Oficina principal', status: 'pendiente' },
]
function AgendaPage() {
  const [events, setEvents] = useState(() => loadLocal(storageKeys.agenda, initialAgendaEvents))
  const [selectedDate, setSelectedDate] = useState('2025-07-02')
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  useEffect(() => { window.localStorage.setItem(storageKeys.agenda, JSON.stringify(events)) }, [events])
  const selectedEvents = events.filter((event) => event.date === selectedDate).sort((first, second) => first.time.localeCompare(second.time))
  const upcomingEvents = events.filter((event) => event.date >= selectedDate).sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`)).slice(0, 3)
  const addEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setEvents((current) => [...current, { id: Date.now(), title: String(form.get('title')), client: String(form.get('client')), date: String(form.get('date')), time: String(form.get('time')), duration: String(form.get('duration')), type: form.get('type') as AgendaEvent['type'], location: String(form.get('location')), status: 'pendiente' }])
    setIsEventModalOpen(false)
    event.currentTarget.reset()
  }
  return <><section className="welcome-row finance-heading"><div><p className="eyebrow">ORGANIZACIÓN DEL NEGOCIO</p><h1>Agenda</h1><p className="subheading">Coordina reuniones, tareas y recordatorios importantes.</p></div><button className="primary-button" onClick={() => setIsEventModalOpen(true)}><Plus size={18} /> Nueva actividad</button></section><div className="agenda-toolbar"><div className="date-strip"><button className="date-arrow" aria-label="Día anterior" onClick={() => setSelectedDate('2025-07-01')}>‹</button><button className={`date-card ${selectedDate === '2025-07-01' ? 'selected' : ''}`} onClick={() => setSelectedDate('2025-07-01')}><span>MAR</span><strong>01</strong><small>JUL</small></button><button className={`date-card ${selectedDate === '2025-07-02' ? 'selected' : ''}`} onClick={() => setSelectedDate('2025-07-02')}><span>MIÉ</span><strong>02</strong><small>JUL</small></button><button className={`date-card ${selectedDate === '2025-07-03' ? 'selected' : ''}`} onClick={() => setSelectedDate('2025-07-03')}><span>JUE</span><strong>03</strong><small>JUL</small></button><button className={`date-card ${selectedDate === '2025-07-04' ? 'selected' : ''}`} onClick={() => setSelectedDate('2025-07-04')}><span>VIE</span><strong>04</strong><small>JUL</small></button><button className="date-arrow" aria-label="Día siguiente" onClick={() => setSelectedDate('2025-07-03')}>›</button></div><div className="view-toggle"><button className={viewMode === 'day' ? 'selected' : ''} onClick={() => setViewMode('day')}>Día</button><button className={viewMode === 'week' ? 'selected' : ''} onClick={() => setViewMode('week')}>Semana</button></div></div><div className="agenda-layout"><section className="panel day-agenda"><div className="panel-heading"><div><h2>{selectedDate === '2025-07-02' ? 'Hoy, miércoles 02 de julio' : `Agenda del ${formatDate(selectedDate)}`}</h2><p>{selectedEvents.length} actividades programadas</p></div><span className="agenda-status"><i /> {selectedEvents.length} pendientes</span></div><div className="timeline">{selectedEvents.map((event) => <AgendaEventCard event={event} key={event.id} />)}{selectedEvents.length === 0 && <div className="no-results"><CalendarDays size={23} /><strong>Día libre</strong><span>No hay actividades programadas para esta fecha.</span><button className="text-button" onClick={() => setIsEventModalOpen(true)}>Agregar actividad <Plus size={14} /></button></div>}</div></section><aside className="agenda-side"><section className="panel upcoming-panel"><div className="panel-heading"><div><h2>Próximamente</h2><p>Tus siguientes actividades</p></div><CalendarDays size={18} color="#6e9d7a" /></div>{upcomingEvents.map((event) => <div className="upcoming-item" key={event.id}><span className={`upcoming-date ${event.type}`}><strong>{event.date.slice(-2)}</strong><small>JUL</small></span><div><strong>{event.title}</strong><span>{event.time} · {event.client}</span></div></div>)}</section><section className="panel agenda-legend"><h2>Tipos de actividad</h2><span><i className="legend-reunion" /> Reuniones</span><span><i className="legend-tarea" /> Tareas</span><span><i className="legend-recordatorio" /> Recordatorios</span></section></aside></div>{isEventModalOpen && <AgendaEventModal onClose={() => setIsEventModalOpen(false)} onSubmit={addEvent} />}</>
}
function AgendaEventCard({ event }: { event: AgendaEvent }) { return <article className={`agenda-event ${event.type}`}><div className="event-time"><strong>{event.time}</strong><span>{event.duration}</span></div><div className="event-line" /><div className="event-content"><div className="event-title-row"><div><h3>{event.title}</h3><p>{event.client}</p></div><span className={`event-status ${event.status}`}>{event.status}</span></div><div className="event-meta"><span><UserRound size={13} /> {event.client}</span><span><MapPin size={13} /> {event.location}</span></div></div></article> }
function AgendaEventModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="agenda-modal-title"><div className="modal-heading"><div><p className="eyebrow">AGENDA LOCAL</p><h2 id="agenda-modal-title">Nueva actividad</h2></div><button className="close-button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div><form onSubmit={onSubmit}><label>Título de la actividad<input name="title" required placeholder="Ej. Reunión con cliente" /></label><div className="form-row"><label>Cliente o contacto<input name="client" required placeholder="Ej. Grupo Norte" /></label><label>Tipo<select name="type" defaultValue="reunion"><option value="reunion">Reunión</option><option value="tarea">Tarea</option><option value="recordatorio">Recordatorio</option></select></label></div><div className="form-row"><label>Fecha<input name="date" type="date" defaultValue="2025-07-02" required /></label><label>Hora<input name="time" type="time" defaultValue="09:00" required /></label></div><div className="form-row"><label>Duración<select name="duration" defaultValue="30 min"><option>15 min</option><option>30 min</option><option>45 min</option><option>60 min</option></select></label><label>Lugar<input name="location" required placeholder="Ej. Videollamada" /></label></div><div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button">Guardar actividad</button></div></form></section></div> }
function SettingsPage({ settings, setSettings }: { settings: BusinessSettings; setSettings: (settings: BusinessSettings) => void }) {
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)
  const update = (field: keyof BusinessSettings, value: string | boolean) => setDraft((current) => ({ ...current, [field]: value }))
  const saveSettings = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSettings(draft); setSaved(true); window.setTimeout(() => setSaved(false), 2200) }
  return <><section className="welcome-row settings-heading"><div><p className="eyebrow">PREFERENCIAS DEL ESPACIO</p><h1>Configuración</h1><p className="subheading">Personaliza la información y el funcionamiento de tu negocio.</p></div><button className="primary-button" onClick={() => setSettings(draft)}><Save size={17} /> Guardar cambios</button></section><form className="settings-layout" onSubmit={saveSettings}><div className="settings-main"><section className="panel settings-section"><div className="settings-section-heading"><div><h2>Información del negocio</h2><p>Estos datos identifican tu espacio de trabajo.</p></div><span className="settings-section-icon"><Settings size={17} /></span></div><div className="settings-form-grid"><label>Nombre del negocio<input value={draft.businessName} onChange={(event) => update('businessName', event.target.value)} /></label><label>Nombre del responsable<input value={draft.ownerName} onChange={(event) => update('ownerName', event.target.value)} /></label><label>Correo electrónico<input type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} /></label><label>Teléfono<input value={draft.phone} onChange={(event) => update('phone', event.target.value)} /></label></div></section><section className="panel settings-section"><div className="settings-section-heading"><div><h2>Preferencias regionales</h2><p>Define cómo se muestran fechas y valores.</p></div><span className="settings-section-icon"><WalletCards size={17} /></span></div><div className="settings-form-grid"><label>Moneda<select value={draft.currency} onChange={(event) => update('currency', event.target.value)}><option>USD - Dólar estadounidense</option><option>ARS - Peso argentino</option><option>COP - Peso colombiano</option><option>EUR - Euro</option></select></label><label>Zona horaria<select value={draft.timezone} onChange={(event) => update('timezone', event.target.value)}><option>GMT-3 · Buenos Aires</option><option>GMT-5 · Bogotá</option><option>GMT-6 · Ciudad de México</option></select></label><label>La semana comienza el<select value={draft.weekStartsOn} onChange={(event) => update('weekStartsOn', event.target.value)}><option>Lunes</option><option>Domingo</option></select></label></div></section></div><aside className="settings-side"><section className="panel settings-section"><div className="settings-section-heading"><div><h2>Agenda</h2><p>Controla tus avisos.</p></div><span className="settings-section-icon"><BellRing size={17} /></span></div><label className="switch-row"><span><strong>Recordatorios</strong><small>Recibe avisos de tus próximas actividades.</small></span><input type="checkbox" checked={draft.reminders} onChange={(event) => update('reminders', event.target.checked)} /><i /></label></section><section className="settings-save-card"><div className="settings-save-icon"><Save size={19} /></div><h2>Todo listo para trabajar</h2><p>Tus preferencias se aplican a este espacio de trabajo.</p><button className="primary-button" type="submit">{saved ? 'Cambios guardados' : 'Guardar configuración'}</button></section></aside></form></>
}
function InventoryPage({ products, setProducts, entries, exits, setEntries, setExits, setIsProductModalOpen }: { products: Product[]; setProducts: (products: Product[]) => void; entries: InventoryMovement[]; exits: InventoryMovement[]; setEntries: (movements: InventoryMovement[]) => void; setExits: (movements: InventoryMovement[]) => void; setIsProductModalOpen: (value: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<'products' | 'entries' | 'exits' | 'stock'>('products')
  const [search, setSearch] = useState('')
  const [movementModal, setMovementModal] = useState<'entry' | 'exit' | null>(null)
  const [, setMovementError] = useState('')
  const visibleProducts = products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase()))
  const tabs = [{ id: 'products', label: 'Productos' }, { id: 'entries', label: 'Entradas' }, { id: 'exits', label: 'Salidas' }, { id: 'stock', label: 'Stock' }] as const
  const movementProductName = (movement: InventoryMovement) => productName(movement.productId, products)
  const stockFor = (productId: string) => ({ entries: entries.filter((item) => item.productId === productId).reduce((total, item) => total + item.quantity, 0), exits: exits.filter((item) => item.productId === productId).reduce((total, item) => total + item.quantity, 0) })
  const deleteProduct = (product: Product) => {
    if (!window.confirm(`¿Eliminar el producto "${product.name}" del catálogo? Sus movimientos históricos se conservarán.`)) return
    setProducts(products.filter((item) => item.id !== product.id))
  }
  const addMovement = (event: FormEvent<HTMLFormElement>) => {
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
    if (movementModal === 'entry') setEntries([...entries, movement])
    else setExits([...exits, movement])
    setMovementError('')
    setMovementModal(null)
    event.currentTarget.reset()
  }
  return <><section className="welcome-row finance-heading"><div><p className="eyebrow">CONTROL DE INVENTARIO</p><h1>Inventario</h1><p className="subheading">Organiza productos, movimientos y existencias de tu negocio.</p></div><button className="primary-button" onClick={() => activeTab === 'products' ? setIsProductModalOpen(true) : setMovementModal(activeTab === 'entries' ? 'entry' : 'exit')}><Plus size={18} /> {activeTab === 'products' ? 'Añadir producto' : activeTab === 'entries' ? 'Registrar entrada' : activeTab === 'exits' ? 'Registrar salida' : 'Nuevo movimiento'}</button></section><div className="inventory-tabs" role="tablist">{tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'selected' : ''} onClick={() => setActiveTab(tab.id)}>{tab.label}<span>{tab.id === 'products' ? products.length : tab.id === 'entries' ? entries.length : tab.id === 'exits' ? exits.length : products.length}</span></button>)}</div>{activeTab === 'products' && <section className="panel inventory-panel"><div className="panel-heading"><div><h2>Productos</h2><p>{visibleProducts.length} productos encontrados</p></div><label className="search-field inventory-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o código..." /></label></div><div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id}><div className="product-card-top"><span className="product-avatar"><Package size={18} /></span><span className="stock-status"><i /> Activo</span><button className="delete-product-button" type="button" aria-label={`Eliminar ${product.name}`} title="Eliminar producto" onClick={() => deleteProduct(product)}><Trash2 size={15} /></button></div><h3>{product.name}</h3><p>{product.sku}</p><strong>{formatMoney(product.price)}</strong><small>Precio de venta por unidad</small></article>)}{visibleProducts.length === 0 && <div className="no-results"><Search size={23} /><strong>No encontramos productos</strong><span>Prueba con otro nombre o código.</span></div>}</div></section>}{(activeTab === 'entries' || activeTab === 'exits') && <MovementTable title={activeTab === 'entries' ? 'Entradas de productos' : 'Salidas de productos'} movements={activeTab === 'entries' ? entries : exits} products={products} movementProductName={movementProductName} tone={activeTab === 'entries' ? 'income' : 'expense'} />}{activeTab === 'stock' && <StockTable products={products} getStock={stockFor} />}{movementModal && <MovementModal type={movementModal} products={products} onClose={() => setMovementModal(null)} onSubmit={addMovement} />}</>
}

function MovementTable({ title, movements, products, movementProductName, tone }: { title: string; movements: InventoryMovement[]; products: Product[]; movementProductName: (movement: InventoryMovement) => string; tone: 'income' | 'expense' }) { return <section className="panel inventory-table-panel"><div className="panel-heading"><div><h2>{title}</h2><p>{movements.length} movimientos registrados</p></div></div><div className="finance-table-wrap"><table><thead><tr><th>Producto</th><th>Código</th><th className="align-right">Cantidad</th><th>Fecha</th></tr></thead><tbody>{movements.map((movement) => <tr key={movement.id}><td><div className="table-operation"><span className={`transaction-icon ${tone}`}><Package size={16} /></span><strong>{movementProductName(movement)}</strong></div></td><td>{products.find((product) => product.id === movement.productId)?.sku ?? 'Sin código'}</td><td className={`align-right table-amount ${tone === 'expense' ? 'amount-expense' : 'amount-income'}`}>{tone === 'expense' ? '-' : '+'} {movement.quantity}</td><td>{formatDate(movement.date)}</td></tr>)}</tbody></table>{movements.length === 0 && <div className="no-results"><Package size={23} /><strong>No hay movimientos</strong><span>Registra el primero con el botón superior.</span></div>}</div></section> }

function StockTable({ products, getStock }: { products: Product[]; getStock: (productId: string) => { entries: number; exits: number } }) { return <section className="panel inventory-table-panel"><div className="panel-heading"><div><h2>Stock actual</h2><p>Entradas menos salidas por producto</p></div></div><div className="finance-table-wrap"><table><thead><tr><th>Código</th><th>Producto</th><th className="align-right">Entradas</th><th className="align-right">Salidas</th><th className="align-right">Stock</th></tr></thead><tbody>{products.map((product) => { const stock = getStock(product.id); const currentStock = stock.entries - stock.exits; return <tr key={product.id}><td>{product.sku}</td><td><div className="table-operation"><span className="product-avatar"><Package size={16} /></span><strong>{product.name}</strong>{currentStock <= 3 && <span className="low-stock-label">Stock bajo</span>}</div></td><td className="align-right amount-income">{stock.entries}</td><td className="align-right amount-expense">{stock.exits}</td><td className={`align-right stock-value ${currentStock <= 0 ? 'stock-empty' : currentStock <= 3 ? 'stock-low' : ''}`}>{currentStock}</td></tr> })}</tbody></table></div></section> }
function TransactionModal({ products, onClose, onSubmit }: { products: Product[]; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><p className="eyebrow">NUEVO MOVIMIENTO</p><h2 id="modal-title">Registrar operación</h2></div><button className="close-button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div><form onSubmit={onSubmit}><div className="type-toggle"><label><input type="radio" name="type" value="income" defaultChecked /> <span>Ingreso</span></label><label><input type="radio" name="type" value="expense" /> <span>Gasto</span></label></div><div className="form-row"><label>Cliente<input name="client" required placeholder="Ej. Grupo Norte" /></label><label>Producto<select name="productId" defaultValue={products[0]?.id} required>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {formatMoney(product.price)}</option>)}</select></label></div><label>Descripción<input name="title" required placeholder="Ej. Pago de cliente" /></label><div className="form-row"><label>Cantidad<input name="quantity" type="number" min="1" step="1" required placeholder="Ej. 3" /><small className="field-hint">El total se calcula con el precio del producto.</small></label><label>Fecha<input name="date" type="date" defaultValue="2025-07-02" required /></label></div><div className="form-row"><label>Categoría<select name="category" defaultValue="Ventas"><option>Ventas</option><option>Compras</option><option>Servicios</option><option>Marketing</option></select></label><label>Cuenta<select name="account" defaultValue="Cuenta principal"><option>Cuenta principal</option><option>Tarjeta corporativa</option><option>Efectivo</option></select></label></div><div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button">Guardar operación</button></div></form></section></div> }
function MovementModal({ type, products, error = '', onClose, onSubmit }: { type: 'entry' | 'exit'; products: Product[]; error?: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { const isEntry = type === 'entry'; return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="movement-modal-title"><div className="modal-heading"><div><p className="eyebrow">INVENTARIO</p><h2 id="movement-modal-title">Registrar {isEntry ? 'entrada' : 'salida'}</h2></div><button className="close-button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div><form onSubmit={onSubmit}><label>Producto<select name="productId" defaultValue={products[0]?.id} required>{products.map((product) => <option key={product.id} value={product.id}>{product.sku} · {product.name}</option>)}</select></label><div className="form-row"><label>Cantidad<input name="quantity" type="number" min="1" step="1" required placeholder="Ej. 10" /></label><label>Fecha<input name="date" type="date" defaultValue="2025-07-02" required /></label></div><div className={`movement-note ${isEntry ? 'entry-note' : 'exit-note'}`}><Package size={16} /><span>{isEntry ? 'La cantidad se sumará al stock disponible.' : 'La cantidad se restará del stock disponible.'}</span></div>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button">Guardar {isEntry ? 'entrada' : 'salida'}</button></div></form></section></div> }
function ProductModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><div className="modal-heading"><div><p className="eyebrow">CATÁLOGO LOCAL</p><h2 id="product-modal-title">Agregar producto</h2></div><button className="close-button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div><form onSubmit={onSubmit}><label>Nombre del producto<input name="name" required placeholder="Ej. Plan empresarial" /></label><div className="form-row"><label>SKU<input name="sku" required placeholder="Ej. SRV-004" /></label><label>Precio por unidad<input name="price" type="number" min="0.01" step="0.01" required placeholder="0,00" /></label></div><div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button">Guardar producto</button></div></form></section></div> }

export default App
