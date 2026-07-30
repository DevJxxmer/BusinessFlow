import { PageShell } from "@/components/page-shell";

const clients = [
  { name: "María López", company: "Comercial Flores", email: "maria@flores.com", status: "Activo" },
  { name: "Luis Ortega", company: "Artes S.A.", email: "luis@artes.com", status: "Nuevo" },
  { name: "Diana Torres", company: "North Studio", email: "diana@north.com", status: "Activo" },
];

export default function ClientsPage() {
  return (
    <PageShell className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Clientes</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Gestiona tu base de clientes</h1>
        </div>
        <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Agregar cliente</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((client) => (
          <div key={client.email} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-900">{client.name}</p>
            <p className="mt-1 text-sm text-slate-600">{client.company}</p>
            <p className="mt-2 text-sm text-slate-500">{client.email}</p>
            <span className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              {client.status}
            </span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
