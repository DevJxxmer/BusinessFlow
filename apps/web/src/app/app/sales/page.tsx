import { PageShell } from "@/components/page-shell";
import { financeEntries } from "@/lib/mock-data";

export default function SalesPage() {
  return (
    <PageShell className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Ventas</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Registra ventas y sigue el flujo</h1>
        </div>
        <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Nueva venta</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Resumen financiero</h2>
          <div className="mt-5 space-y-3">
            {financeEntries.map((entry) => (
              <div key={`${entry.type}-${entry.date}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{entry.category}</p>
                  <p className="text-sm text-slate-500">{entry.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${entry.type === "Gasto" ? "text-amber-600" : "text-emerald-600"}`}>{entry.amount}</p>
                  <p className="text-sm text-slate-500">{entry.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm text-slate-300">Método de pago</p>
          <p className="mt-2 text-2xl font-semibold">Transferencia y efectivo</p>
          <div className="mt-6 space-y-3">
            {[
              ["Cobros hoy", "$4.850"],
              ["Pendientes", "$1.320"],
              ["Ticket promedio", "$85"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
                <p className="text-sm text-slate-300">{label}</p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
