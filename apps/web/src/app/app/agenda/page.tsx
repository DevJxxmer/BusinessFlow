"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";

export default function AgendaPage() {
  const [items, setItems] = useState<Array<{ id: string; type: string; category: string; description: string; amount: number; date: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgenda() {
      try {
        const data = await api.transactions.list();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la agenda");
      } finally {
        setLoading(false);
      }
    }

    loadAgenda();
  }, []);

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
        {loading ? (
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm text-slate-500">Cargando agenda...</div>
        ) : error ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 shadow-sm text-amber-700">{error}</div>
        ) : items.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm text-slate-500">No hay elementos en la agenda.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.type}</p>
                  <p className="text-sm text-slate-600">{item.category}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{new Date(item.date).toLocaleDateString('es-CO')}</span>
              </div>
              <p className="mt-3 text-slate-700">{item.description}</p>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(item.amount)}</span>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">{item.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}
