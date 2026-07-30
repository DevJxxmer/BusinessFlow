export const dashboardStats = [
  { label: "Balance actual", value: "$84.250", change: "+12.4%", tone: "emerald" },
  { label: "Ingresos del mes", value: "$128.400", change: "+8.1%", tone: "blue" },
  { label: "Gastos del mes", value: "$44.150", change: "-3.2%", tone: "slate" },
  { label: "Ventas cerradas", value: "184", change: "+21", tone: "violet" },
];

export const inventoryItems = [
  { name: "Café Premium", sku: "CF-001", stock: 24, minStock: 10, price: "$8.50" },
  { name: "Lápiz Negro", sku: "LP-104", stock: 6, minStock: 10, price: "$1.20" },
  { name: "Tinta Sublimación", sku: "SB-302", stock: 18, minStock: 12, price: "$14.90" },
  { name: "Tornillo 3/8", sku: "TR-221", stock: 4, minStock: 8, price: "$0.35" },
];

export const recentMovements = [
  { title: "Venta confirmada", detail: "Cliente: María López • 2 productos", time: "Hace 10 min" },
  { title: "Ingreso registrado", detail: "Categoría: Servicios • $1.250", time: "Hace 36 min" },
  { title: "Pedido actualizado", detail: "Estado: En proceso • Entrega mañana", time: "Hace 1h" },
];

export const agendaItems = [
  { client: "Ana Gómez", item: "Pedido de uniformes", status: "Pendiente", priority: "Alta" },
  { client: "Luis Rojas", item: "Revisión de stock", status: "En proceso", priority: "Media" },
  { client: "Sofía Vega", item: "Entrega de kits", status: "Listo", priority: "Baja" },
];

export const financeEntries = [
  { type: "Ingreso", category: "Servicios", amount: "$1.250", date: "2026-07-30" },
  { type: "Gasto", category: "Logística", amount: "$320", date: "2026-07-29" },
  { type: "Ingreso", category: "Venta", amount: "$4.800", date: "2026-07-28" },
];

export const salesSummary = [
  { label: "Hoy", value: "$4.850" },
  { label: "Semana", value: "$19.540" },
  { label: "Mes", value: "$84.250" },
];
