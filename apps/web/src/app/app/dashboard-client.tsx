"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";
import { formatCurrency, getStoredCurrency } from "@/lib/utils";

export function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Array<{ business: { id: string; name: string; slug: string } }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string; initialStock: number; minimumStock: number; salePrice: number; status: string }>>([]);
  const [sales, setSales] = useState<Array<{ id: string; customerName: string; paymentMethod: string; subtotal: number; total: number; createdAt: string }>>([]);
  const [transactions, setTransactions] = useState<Array<{ id: string; type: string; category: string; description: string; amount: number; date: string }>>([]);
  const [currency] = useState(() => getStoredCurrency());

  useEffect(() => {
    async function loadData() {
      try {
        const [businessData, productData, salesData, transactionData] = await Promise.all([
          api.businesses.list(),
          api.products.list(),
          api.sales.list(),
          api.transactions.list(),
        ]);

        setBusinesses(businessData);
        setProducts(productData);
        setSales(salesData);
        setTransactions(transactionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = transactions.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = totalRevenue + totalExpenses;
  const lowStockProducts = products.filter((product) => product.status === "ACTIVE" && product.initialStock <= product.minimumStock);
  const recentTransactions = transactions.slice(0, 5);
  const averageTicket = sales.length ? totalRevenue / sales.length : 0;

  return (
    <PageShell className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_-40px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-500">Finanzas</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Balance actual y rendimiento</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Obtén una visión clara de ingresos, gastos y flujo de caja para tu negocio en tiempo real.
              </p>
            </div>
            <div className="rounded-full bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">
              Moneda activa: {currency}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-slate-500">Balance actual</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(balance, currency)}</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-slate-500">Ingresos totales</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-600">{formatCurrency(totalRevenue, currency)}</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-slate-500">Gastos totales</p>
              <p className="mt-3 text-3xl font-semibold text-rose-600">{formatCurrency(totalExpenses, currency)}</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-slate-500">Ventas registradas</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{sales.length}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-300">Ticket promedio</p>
                  <p className="mt-3 text-3xl font-semibold">{formatCurrency(averageTicket, currency)}</p>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-2 text-sm text-slate-200">Rendimiento</div>
              </div>
              <div className="mt-6 rounded-[24px] bg-slate-900/80 p-4 text-sm text-slate-300">
                <p>Monitorea las ventas promedio y ajusta precios para maximizar ganancias.</p>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-800">Productos con poco stock</p>
              <p className="mt-2 text-sm text-slate-500">Alertas activas para evitar rupturas de inventario.</p>
              <div className="mt-4 space-y-3">
                {lowStockProducts.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No hay productos con stock crítico.</div>
                ) : (
                  lowStockProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-500">SKU {product.sku} · Stock {product.initialStock}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Actividad</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Movimientos recientes</h2>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-6 space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500">Cargando movimientos...</p>
              ) : recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-500">No hay movimientos registrados.</p>
              ) : (
                recentTransactions.map((movement) => (
                  <div key={movement.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{movement.category}</p>
                        <p className="mt-1 text-sm text-slate-500">{movement.description}</p>
                      </div>
                      <span className={`text-sm font-semibold ${movement.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(movement.amount, currency)}
                      </span>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">{new Date(movement.date).toLocaleDateString('es-CO')}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-300">Negocios</p>
            <p className="mt-3 text-3xl font-semibold">{businesses.length}</p>
            <p className="mt-2 text-sm text-slate-400">Negocios activos con acceso al panel y a reportes en tiempo real.</p>
          </div>
        </aside>
      </section>

      {error ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          {error}
        </div>
      ) : null}
    </PageShell>
  );
}
