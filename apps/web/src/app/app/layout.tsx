"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";
import { getStoredCurrency, storeCurrency } from "@/lib/utils";
import { BarChart3, Boxes, CalendarRange, CircleDollarSign, Menu, Settings, Sparkles, Users, Warehouse, X } from "lucide-react";

const navItems = [
  { href: "/app", label: "Dashboard", icon: BarChart3 },
  { href: "/app/inventory", label: "Inventario", icon: Boxes },
  { href: "/app/sales", label: "Finanzas", icon: CircleDollarSign },
  { href: "/app/agenda", label: "Agenda", icon: CalendarRange },
  { href: "/app/clients", label: "Clientes", icon: Users },
  { href: "/app/settings", label: "Configuración", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [businesses, setBusinesses] = useState<Array<{ business: { id: string; name: string; slug: string } }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newBusinessSlug, setNewBusinessSlug] = useState("");
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [currency, setCurrency] = useState(() => getStoredCurrency());

  const loadBusinesses = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.businesses.list();
      setBusinesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los negocios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // call asynchronously to avoid setState being called synchronously inside the effect
    const t = setTimeout(() => {
      loadBusinesses();
    }, 0);

    return () => clearTimeout(t);
  }, []);

  const generateSlug = useCallback((name: string) =>
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .slice(0, 32) || "nuevo-negocio",
  []);

  const handleBusinessName = useCallback((value: string) => {
    setNewBusinessName(value);
    setNewBusinessSlug(generateSlug(value));
  }, [generateSlug]);

  const handleCreateBusiness = useCallback(async () => {
    if (!newBusinessName.trim()) return;
    setSavingBusiness(true);

    try {
      await api.businesses.create({ name: newBusinessName.trim(), slug: newBusinessSlug });
      await loadBusinesses();
      setNewBusinessName("");
      setNewBusinessSlug("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el negocio");
    } finally {
      setSavingBusiness(false);
    }
  }, [newBusinessName, newBusinessSlug]);

  const handleCurrencyChange = (value: string) => {
    storeCurrency(value);
    setCurrency(value);
  };

  const businessCount = businesses.length;

  const onboarding = useMemo(() => {
    if (loading) return null;
    if (businessCount > 0) return null;

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.08),_transparent_28%),linear-gradient(180deg,_#eef4ff_0%,_#fbfbfe_100%)] px-6 py-16">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[40px] border border-slate-200 bg-white/95 shadow-[0_50px_150px_-70px_rgba(15,23,42,0.2)] backdrop-blur-xl">
          <div className="grid gap-8 p-10 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]">
                <p className="text-sm uppercase tracking-[0.32em] text-sky-300">Bienvenido a BusinessFlow</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight">Configura tu primer negocio</h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                  Empieza a administrar inventario, ventas, finanzas y agenda para tu empresa. Crea un negocio ahora y accede al panel completo.
                </p>
              </div>
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Nombre del negocio</p>
                    <input
                      value={newBusinessName}
                      onChange={(event) => handleBusinessName(event.target.value)}
                      className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      placeholder="Escribe el nombre de tu negocio"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">Slug sugerido</p>
                    <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">{newBusinessSlug}</div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={handleCreateBusiness}
                      disabled={savingBusiness}
                      className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingBusiness ? 'Creando negocio...' : 'Crear negocio'}
                    </button>
                    <p className="text-sm text-slate-500">
                      Una vez creado, podrás acceder a inventario, ventas y finanzas desde el panel.
                    </p>
                  </div>

                  {error ? <p className="text-sm text-rose-600">{error}</p> : null}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_20px_80px_-30px_rgba(15,23,42,0.3)]">
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-3xl bg-slate-900/60 p-4">
                  <Sparkles className="h-6 w-6 text-sky-300" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Flujo rápido</p>
                    <p className="mt-1 text-xl font-semibold">Negocio listo en segundos</p>
                  </div>
                </div>
                <div className="grid gap-4 rounded-3xl bg-slate-900/70 p-5">
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm text-slate-400">Inventario automatizado</p>
                    <p className="mt-2 text-lg font-semibold text-white">Productos, stock y alertas en un solo lugar.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm text-slate-400">Finanzas y reportes</p>
                    <p className="mt-2 text-lg font-semibold text-white">Controla ingresos, gastos y balance actual.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm text-slate-400">Agenda y clientes</p>
                    <p className="mt-2 text-lg font-semibold text-white">Pedidos, tareas y contactos sincronizados.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [businessCount, error, loading, newBusinessName, newBusinessSlug, savingBusiness, handleBusinessName, handleCreateBusiness]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="space-y-4 rounded-[32px] border border-white/10 bg-slate-900/95 p-10 text-center shadow-[0_30px_90px_-30px_rgba(15,23,42,0.8)]">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
          <p className="text-sm text-slate-300">Cargando tu espacio de trabajo...</p>
        </div>
      </div>
    );
  }

  if (!loading && businessCount === 0) {
    return onboarding;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-800 bg-slate-975/95 p-6 backdrop-blur lg:block">
        <div className="flex items-center gap-3">
          <div className="rounded-3xl bg-slate-100/10 p-3 text-sky-300 shadow-[0_20px_80px_-50px_rgba(56,189,248,0.9)]">
            <Warehouse className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">BusinessFlow</p>
            <p className="text-xs text-slate-400">Consola de negocios</p>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sky-300 transition group-hover:bg-slate-700">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 rounded-[28px] border border-slate-800 bg-slate-900/90 p-5 shadow-[0_15px_45px_-25px_rgba(15,23,42,0.8)]">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-sky-300" />
            <p className="text-sm font-semibold text-white">Resumen</p>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <div className="rounded-3xl bg-slate-950/80 px-4 py-3">
              <p className="font-medium text-slate-100">Negocios activos</p>
              <p className="mt-2 text-xl font-semibold text-white">{businessCount}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-4 py-3">
              <p className="font-medium text-slate-100">Moneda seleccionada</p>
              <p className="mt-2 text-xl font-semibold text-white">{currency}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:ml-72">
        <header className="border-b border-slate-800 bg-slate-975/95 px-6 py-5 backdrop-blur">
          <PageShell className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-400">Panel principal</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Controla tu negocio con claridad</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-slate-800 bg-slate-900/90 px-4 py-2 text-sm text-slate-300 shadow-sm">
                {businessCount} {businessCount === 1 ? 'negocio' : 'negocios'} activos
              </div>
              <select
                value={currency}
                onChange={(event) => handleCurrencyChange(event.target.value)}
                className="rounded-full border border-slate-800 bg-slate-900/90 px-4 py-2 text-sm text-slate-100 outline-none transition hover:border-slate-700"
              >
                <option value="USD">USD</option>
                <option value="COP">COP</option>
                <option value="EUR">EUR</option>
              </select>
              <button
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900/90 text-slate-300 transition hover:bg-slate-800 lg:hidden"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </PageShell>
        </header>

        {isMenuOpen && (
          <div className="border-b border-slate-800 bg-slate-975/95 px-6 py-4 lg:hidden">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sky-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <main className="px-6 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
