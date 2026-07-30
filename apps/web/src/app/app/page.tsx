import { PageShell } from "@/components/page-shell";
import { dashboardStats, inventoryItems, recentMovements, salesSummary } from "@/lib/mock-data";

export default function AppDashboardPage() {
  return (
    <PageShell className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Resumen del negocio</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Tu operación tiene un excelente ritmo.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Monitorea ingresos, gastos, movimientos recientes y stock crítico sin salir del panel principal.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {dashboardStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold text-slate-950">{item.value}</p>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm text-slate-300">Ventas del mes</p>
          <p className="mt-2 text-4xl font-semibold">$84.250</p>
          <div className="mt-6 space-y-3">
            {salesSummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Productos con poco stock</h2>
              <p className="text-sm text-slate-500">Revisa el inventario crítico antes de que se agote.</p>
            </div>
            <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300">
              Ver inventario
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {inventoryItems.map((item) => (
              <div key={item.sku} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.sku} • {item.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">Stock {item.stock}</p>
                  <p className="text-sm text-amber-600">Mínimo {item.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Movimientos recientes</h2>
          <div className="mt-5 space-y-3">
            {recentMovements.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
