import { PageShell } from "@/components/page-shell";

export default function SettingsPage() {
  return (
    <PageShell className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Configuración</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Personaliza la plataforma</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Negocio</h2>
          <p className="mt-2 text-sm text-slate-600">Nombre, moneda, zona horaria y configuración principal.</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Seguridad</h2>
          <p className="mt-2 text-sm text-slate-600">Roles, permisos, accesos y auditoría de usuarios.</p>
        </div>
      </div>
    </PageShell>
  );
}
