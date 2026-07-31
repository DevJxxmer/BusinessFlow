"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";

type Sale = {
  id: string;
  customerName: string;
  paymentMethod: string;
  subtotal: number;
  total: number;
  createdAt: string;
  items: Array<{ id: string; quantity: number; unitPrice: number; total: number; product: { name: string } }>;
};

type SaleForm = {
  customerName: string;
  paymentMethod: string;
  subtotal: number;
  total: number;
  discount: number;
  notes: string;
};

const emptySaleForm: SaleForm = {
  customerName: '',
  paymentMethod: 'Efectivo',
  subtotal: 0,
  total: 0,
  discount: 0,
  notes: '',
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<SaleForm>(emptySaleForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSales() {
      try {
        const data = await api.sales.list();
        setSales(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar las ventas");
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, []);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  const handleField = <K extends keyof SaleForm>(field: K, value: SaleForm[K]) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    if (!formState.customerName.trim()) {
      setFormError('El nombre del cliente es obligatorio.');
      setSaving(false);
      return;
    }

    try {
      await api.sales.create({
        customerName: formState.customerName,
        paymentMethod: formState.paymentMethod,
        subtotal: formState.subtotal,
        total: formState.total,
        discount: formState.discount || undefined,
        notes: formState.notes || undefined,
        items: [],
      });

      const data = await api.sales.list();
      setSales(data);
      setFormState(emptySaleForm);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo registrar la venta');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('¿Eliminar esta venta?')) {
      return;
    }
    setSaving(true);
    setError(null);

    try {
      await api.sales.remove(id);
      const data = await api.sales.list();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la venta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Ventas</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Registra ventas y sigue el flujo</h1>
        </div>
        <button
          type="button"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? 'Cerrar formulario' : 'Nueva venta'}
        </button>
      </div>

      {showForm && (
        <form className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Cliente</label>
              <input
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                value={formState.customerName}
                onChange={(event) => handleField('customerName', event.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Método de pago</label>
              <select
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                value={formState.paymentMethod}
                onChange={(event) => handleField('paymentMethod', event.target.value)}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subtotal</label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                value={formState.subtotal}
                onChange={(event) => handleField('subtotal', Number(event.target.value))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Total</label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                value={formState.total}
                onChange={(event) => handleField('total', Number(event.target.value))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Descuento</label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                value={formState.discount}
                onChange={(event) => handleField('discount', Number(event.target.value))}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Notas</label>
              <textarea
                className="min-h-[120px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                value={formState.notes}
                onChange={(event) => handleField('notes', event.target.value)}
              />
            </div>
          </div>

          {formError && <p className="text-sm text-rose-600">{formError}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Registrar venta
            </button>
            <button
              type="button"
              disabled={saving}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                setFormState(emptySaleForm);
                setFormError(null);
                setShowForm(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Resumen de ventas</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Ventas registradas</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{sales.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Ingresos totales</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(totalRevenue)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Última venta</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {sales[0]
                  ? new Date(sales[0].createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'Sin ventas aún'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm text-slate-300">Método de pago</p>
          <p className="mt-2 text-2xl font-semibold">Transferencia y efectivo</p>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
              <p className="text-sm text-slate-300">Cobros hoy</p>
              <p className="mt-1 font-semibold">{sales.length ? `${sales.length} ventas` : '0 ventas'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
              <p className="text-sm text-slate-300">Pendientes</p>
              <p className="mt-1 font-semibold">{sales.length ? 'Revisión' : 'Sin actividad'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
              <p className="text-sm text-slate-300">Ticket promedio</p>
              <p className="mt-1 font-semibold">
                {sales.length
                  ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(totalRevenue / sales.length)
                  : '$0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Método</th>
              <th className="px-4 py-3 font-semibold">Productos</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Cargando ventas...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-amber-600">
                  {error}
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No hay ventas registradas.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{sale.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(sale.total)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{sale.paymentMethod}</td>
                  <td className="px-4 py-3 text-slate-600">{sale.items.length}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(sale.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <button
                      type="button"
                      disabled={saving}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => handleRemove(sale.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
