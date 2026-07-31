"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, BarChart3, Boxes, CircleDollarSign, Users, Activity } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";

export function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Array<{ business: { id: string; name: string; slug: string } }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string; initialStock: number; minimumStock: number; salePrice: number; status: string }>>([]);
  const [sales, setSales] = useState<Array<{ id: string; customerName: string; paymentMethod: string; subtotal: number; total: number; createdAt: string }>>([]);
  const [transactions, setTransactions] = useState<Array<{ id: string; type: string; category: string; description: string; amount: number; date: string }>>([]);

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
  const lowStockProducts = products.filter((product) => product.status === "ACTIVE" && product.initialStock <= product.minimumStock);

  return (
    <PageShell className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Resumen del negocio</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Visión general actualizada</h1>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              {businesses.length} negocio{businesses.length === 1 ? "" : "s"}
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Accede a tu operación real con ingresos, productos, clientes y movimientos del día.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Productos registrados</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{products.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Ventas registradas</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{sales.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Ingresos totales</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(totalRevenue)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Stock crítico</p>
              <p className="mt-2 text-2xl font-semibold text-amber-600">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Movimientos recientes</p>
              <p className="mt-2 text-4xl font-semibold">{transactions.length}</p>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-2 text-sm text-slate-200">Actualizado</div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
              <p className="text-sm text-slate-300">Ventas hoy</p>
              <p className="mt-1 text-xl font-semibold">{sales.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
              <p className="text-sm text-slate-300">Negocios activos</p>
              <p className="mt-1 text-xl font-semibold">{businesses.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
              <p className="text-sm text-slate-300">Alertas de stock</p>
              <p className="mt-1 text-xl font-semibold">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Productos con poco stock</h2>
              <p className="text-sm text-slate-500">Controla el inventario antes de que se agote.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">{lowStockProducts.length} alertas</div>
          </div>
          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Cargando inventario...</p>
            ) : lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-500">No hay productos con stock crítico.</p>
            ) : (
              lowStockProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">SKU {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">Stock {product.initialStock}</p>
                    <p className="text-sm text-amber-600">Mínimo {product.minimumStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Actividad reciente</h2>
              <p className="text-sm text-slate-500">Últimos movimientos y ventas.</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Cargando movimientos...</p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-slate-500">No hay movimientos registrados.</p>
            ) : (
              transactions.slice(0, 5).map((movement) => (
                <div key={movement.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{movement.category}</p>
                      <p className="text-sm text-slate-500">{movement.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(movement.amount)}
                    </span>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">{new Date(movement.date).toLocaleDateString('es-CO')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-amber-700 shadow-sm">
          {error}
        </div>
      ) : null}
    </PageShell>
  );
}
