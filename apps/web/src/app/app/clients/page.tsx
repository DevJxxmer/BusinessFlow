"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";

export default function ClientsPage() {
  const [clients, setClients] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await api.clients.list();
        setClients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los clientes");
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

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
        {loading ? (
          <div className="col-span-3 rounded-[24px] border border-slate-200 bg-white p-5 text-center text-slate-500 shadow-sm">
            Cargando clientes...
          </div>
        ) : error ? (
          <div className="col-span-3 rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-center text-amber-700 shadow-sm">
            {error}
          </div>
        ) : clients.length === 0 ? (
          <div className="col-span-3 rounded-[24px] border border-slate-200 bg-white p-5 text-center text-slate-500 shadow-sm">
            No hay clientes asociados.
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold text-slate-900">{client.name}</p>
              <p className="mt-1 text-sm text-slate-600">Slug: {client.slug}</p>
              <p className="mt-2 text-sm text-slate-500">ID: {client.id}</p>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}
