import { BarChart3, Boxes, CircleCheckBig, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { HeroIllustration } from "@/components/hero-illustration";
import { PageShell } from "@/components/page-shell";
import { WelcomeNav } from "@/components/welcome-nav";

const modules = [
  {
    title: "Dashboard operacional",
    description:
      "Vista diaria con balance, ventas, ganancias, alertas de stock y accesos rápidos para tomar decisiones con claridad.",
    icon: BarChart3,
  },
  {
    title: "Inventario inteligente",
    description:
      "Controla productos, SKU, stock mínimo, entradas, salidas y movimientos de auditoría desde un solo lugar.",
    icon: Boxes,
  },
  {
    title: "Finanzas y agenda",
    description:
      "Registra ingresos, gastos y pedidos pendientes con flujo claro, seguimiento y control del negocio.",
    icon: Wallet,
  },
  {
    title: "Seguridad multiempresa",
    description:
      "Cada negocio cuenta con aislamiento total por business_id y permisos por rol para mantener todo ordenado.",
    icon: ShieldCheck,
  },
];

const testimonials = [
  {
    quote:
      "BusinessFlow nos ayudó a centralizar ventas, inventario y agenda sin tener que usar 4 herramientas distintas.",
    author: "María Ortiz",
    role: "Directora, Studio Norte",
  },
  {
    quote:
      "La claridad del panel nos permitió reducir errores y responder más rápido a los pedidos del día a día.",
    author: "Luis Salazar",
    role: "Gerente, Nexo Supply",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#ffffff_100%)] text-slate-900">
      <section className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <PageShell className="flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-slate-950 p-2 text-white">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">BusinessFlow</p>
              <p className="text-xs text-slate-500">ERP multiempresa</p>
            </div>
          </div>
          <WelcomeNav />
        </PageShell>
      </section>

      <section className="py-20 sm:py-24">
        <PageShell>
          <HeroIllustration />
        </PageShell>
      </section>

      <section className="pb-16">
        <PageShell>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-indigo-50 p-2 text-indigo-700">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Por qué elegir BusinessFlow
              </p>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Todo lo que tu negocio necesita, sin complicaciones.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Desde la apertura de caja hasta la gestión de inventario, ventas y agenda, BusinessFlow te da una vista clara y controlada de cada operación.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/register" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Comenzar ahora
                  </Link>
                  <Link href="/login" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                    Ya tengo cuenta
                  </Link>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                <div className="space-y-4">
                  {[
                    "Centraliza inventario, ventas y finanzas",
                    "Aísla cada negocio con seguridad multiempresa",
                    "Reduce errores con procesos claros y automatizados",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <CircleCheckBig className="mt-0.5 h-5 w-5 text-emerald-600" />
                      <p className="text-sm leading-7 text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageShell>
      </section>

      <section id="modulos" className="pb-20">
        <PageShell>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
              Arquitectura modular
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Cada módulo está pensado para ser claro, seguro y escalable.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {modules.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-14 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Testimonios</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Lo que dicen los equipos que ya lo usan</h3>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                +200 operaciones al día
              </div>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {testimonials.map((item) => (
                <div key={item.author} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-base leading-8 text-slate-700">“{item.quote}”</p>
                  <div className="mt-4">
                    <p className="font-semibold text-slate-950">{item.author}</p>
                    <p className="text-sm text-slate-500">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageShell>
      </section>
    </main>
  );
}
