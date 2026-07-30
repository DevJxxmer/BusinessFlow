import { PageShell } from "@/components/page-shell";
import { agendaItems } from "@/lib/mock-data";

export default function AgendaPage() {
  return (
    <PageShell className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Agenda</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Gestiona pedidos y entregas</h1>
        </div>
        <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Nuevo pedido</button>
      </div>

      <div className="grid gap-4">
        {agendaItems.map((item) => (
          <div key={`${item.client}-${item.item}`} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.client}</p>
                <p className="text-sm text-slate-600">{item.item}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{item.status}</span>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">{item.priority}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
