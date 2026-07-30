import { PageShell } from "@/components/page-shell";
import Link from "next/link";
import { BarChart3, Boxes, CalendarRange, CircleDollarSign, Settings, Users, Warehouse } from "lucide-react";

const navItems = [
  { href: "/app", label: "Dashboard", icon: BarChart3 },
  { href: "/app/inventory", label: "Inventario", icon: Boxes },
  { href: "/app/sales", label: "Ventas", icon: CircleDollarSign },
  { href: "/app/agenda", label: "Agenda", icon: CalendarRange },
  { href: "/app/clients", label: "Clientes", icon: Users },
  { href: "/app/settings", label: "Configuración", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white/90 p-6 backdrop-blur lg:block">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-950 p-2 text-white">
            <Warehouse className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">BusinessFlow</p>
            <p className="text-xs text-slate-500">Panel de negocio</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:ml-72">
        <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
          <PageShell className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">Bienvenido de nuevo</p>
              <p className="text-sm text-slate-500">Tu centro de operaciones listo para crecer</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              Negocio principal · 24 miembros
            </div>
          </PageShell>
        </header>

        <main className="px-6 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
