"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [businesses, setBusinesses] = useState<Array<{ business: { id: string; name: string; slug: string } }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [meResponse, businessResponse] = await Promise.all([api.auth.me(), api.businesses.list()]);
        setUser(meResponse.user);
        setBusinesses(businessResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la configuración");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  return (
    <PageShell className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Configuración</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Personaliza la plataforma</h1>
      </div>

      {loading ? (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm text-slate-500">Cargando configuración...</div>
      ) : error ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 shadow-sm text-amber-700">{error}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Cuenta</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Nombre:</span> {user?.name}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Correo:</span> {user?.email}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Rol:</span> {user?.role}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Negocios asociados</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {businesses.length === 0 ? (
                <p>No tienes negocios asociados.</p>
              ) : (
                businesses.map((entry) => (
                  <div key={entry.business.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{entry.business.name}</p>
                    <p className="mt-1">Slug: {entry.business.slug}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
