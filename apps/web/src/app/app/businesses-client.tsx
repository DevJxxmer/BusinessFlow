"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function BusinessesClient() {
  const [businesses, setBusinesses] = useState<Array<{ business: { id: string; name: string; slug: string } }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.businesses.list();
        setBusinesses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los negocios");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando negocios...</p>;
  }

  if (error) {
    return <p className="text-sm text-amber-600">{error}</p>;
  }

  return (
    <div className="space-y-3">
      {businesses.length === 0 ? (
        <p className="text-sm text-slate-500">No tienes negocios asociados todavía.</p>
      ) : (
        businesses.map((entry) => (
          <div key={entry.business.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">{entry.business.name}</p>
            <p className="mt-1 text-sm text-slate-600">Slug: {entry.business.slug}</p>
          </div>
        ))
      )}
    </div>
  );
}
