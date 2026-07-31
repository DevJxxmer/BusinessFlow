"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Wallet, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Modal } from "@/components/modal";
import { api } from "@/lib/api";
import { formatCurrency, getStoredCurrency } from "@/lib/utils";

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

type Transaction = {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  date: string;
};

type ExpenseForm = {
  category: string;
  description: string;
  amount: number;
  date: string;
};

const emptySaleForm: SaleForm = {
  customerName: '',
  paymentMethod: 'Efectivo',
  subtotal: 0,
  total: 0,
  discount: 0,
  notes: '',
};

const emptyExpenseForm: ExpenseForm = {
  category: '',
  description: '',
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [saleForm, setSaleForm] = useState<SaleForm>(emptySaleForm);
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>(emptyExpenseForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    async function loadData() {
      try {
        const [salesData, transactionData] = await Promise.all([api.sales.list(), api.transactions.list()]);
        setSales(salesData);
        setTransactions(transactionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos de ventas');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const [currency] = useState(() => getStoredCurrency());

  const totalRevenue = useMemo(() => sales.reduce((sum, sale) => sum + sale.total, 0), [sales]);
  const totalExpenses = useMemo(
    () => transactions.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  );
  const balance = totalRevenue + totalExpenses;
  const averageTicket = sales.length ? totalRevenue / sales.length : 0;
  const recentTransactions = transactions.slice(0, 5);
  const totalItems = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.items.reduce((count, item) => count + item.quantity, 0), 0),
    [sales],
  );

  const handleSaleField = <K extends keyof SaleForm>(field: K, value: SaleForm[K]) => {
    setSaleForm((current) => ({ ...current, [field]: value }));
  };

  const handleExpenseField = <K extends keyof ExpenseForm>(field: K, value: ExpenseForm[K]) => {
    setExpenseForm((current) => ({ ...current, [field]: value }));
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesData, transactionData] = await Promise.all([api.sales.list(), api.transactions.list()]);
      setSales(salesData);
      setTransactions(transactionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos de ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    if (!saleForm.customerName.trim()) {
      setFormError('El nombre del cliente es obligatorio.');
      setSaving(false);
      return;
    }

    try {
      await api.sales.create({
        customerName: saleForm.customerName,
        paymentMethod: saleForm.paymentMethod,
        subtotal: saleForm.subtotal,
        total: saleForm.total,
        discount: saleForm.discount || undefined,
        notes: saleForm.notes || undefined,
        items: [],
      });
      await loadAllData();
      setSaleForm(emptySaleForm);
      setShowSaleModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo registrar la venta');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    if (!expenseForm.category.trim() || !expenseForm.description.trim() || expenseForm.amount <= 0) {
      setFormError('Completa la categoría, descripción y monto.');
      setSaving(false);
      return;
    }

    try {
      await api.transactions.create({
        type: 'Gasto',
        category: expenseForm.category,
        description: expenseForm.description,
        amount: -Math.abs(expenseForm.amount),
        date: expenseForm.date,
      });
      await loadAllData();
      setExpenseForm(emptyExpenseForm);
      setShowExpenseModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo registrar el gasto');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSale = async (id: string) => {
    if (!confirm('¿Eliminar esta venta?')) return;
    setSaving(true);
    setError(null);

    try {
      await api.sales.remove(id);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la venta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Finanzas</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Ventas y flujo de caja</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Controla ventas, ingresos y gastos desde un solo lugar con métricas claras.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setSaleForm(emptySaleForm);
              setShowSaleModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" /> Registrar venta
          </button>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setExpenseForm(emptyExpenseForm);
              setShowExpenseModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Wallet className="h-4 w-4" /> Registrar gasto
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm text-slate-500">Balance actual</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{formatCurrency(balance, currency)}</p>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm text-slate-500">Ingresos</p>
          <p className="mt-4 text-3xl font-semibold text-emerald-600">{formatCurrency(totalRevenue, currency)}</p>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm text-slate-500">Gastos</p>
          <p className="mt-4 text-3xl font-semibold text-rose-600">{formatCurrency(totalExpenses, currency)}</p>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm text-slate-500">Ticket promedio</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{formatCurrency(averageTicket, currency)}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Movimientos de ventas</h2>
              <p className="mt-2 text-sm text-slate-500">Detalle de ventas registradas y su impacto en el resultado.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{totalItems} productos vendidos</div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Productos</th>
                  <th className="px-4 py-3 font-semibold">Cantidad</th>
                  <th className="px-4 py-3 font-semibold">Precio total</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Cargando movimientos...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-rose-600">
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
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 text-slate-600">{new Date(sale.createdAt).toLocaleDateString('es-CO')}</td>
                      <td className="px-4 py-4 font-medium text-slate-900">{sale.customerName}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.items.map((item) => item.product.name).join(', ') || 'Sin productos'}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.items.reduce((count, item) => count + item.quantity, 0)}</td>
                      <td className="px-4 py-4 font-semibold text-slate-950">{formatCurrency(sale.total, currency)}</td>
                      <td className="px-4 py-4 text-slate-600">
                        <button
                          type="button"
                          disabled={saving}
                          className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => handleRemoveSale(sale.id)}
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
        </div>

        <aside className="space-y-4">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Informe rápido</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Resumen de caja</h2>
              </div>
              <TrendingUp className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Ingresos</p>
                <p className="mt-2 text-xl font-semibold text-emerald-600">{formatCurrency(totalRevenue, currency)}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Gastos</p>
                <p className="mt-2 text-xl font-semibold text-rose-600">{formatCurrency(totalExpenses, currency)}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Balance</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(balance, currency)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-300">Actividad reciente</p>
            <div className="mt-6 space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-400">No hay movimientos recientes.</p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-3xl bg-slate-900/80 p-4 transition hover:bg-slate-800">
                    <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                      <span>{transaction.category}</span>
                      <span className={transaction.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}>{formatCurrency(transaction.amount, currency)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{transaction.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">{new Date(transaction.date).toLocaleDateString('es-CO')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <Modal open={showSaleModal} onClose={() => setShowSaleModal(false)} title="Registrar nueva venta" footer={null}>
        <form className="space-y-6" onSubmit={handleCreateSale}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Cliente</label>
              <input
                value={saleForm.customerName}
                onChange={(event) => handleSaleField('customerName', event.target.value)}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Método de pago</label>
              <select
                value={saleForm.paymentMethod}
                onChange={(event) => handleSaleField('paymentMethod', event.target.value)}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Subtotal</label>
              <input
                type="number"
                step="0.01"
                value={saleForm.subtotal}
                onChange={(event) => handleSaleField('subtotal', Number(event.target.value))}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Total</label>
              <input
                type="number"
                step="0.01"
                value={saleForm.total}
                onChange={(event) => handleSaleField('total', Number(event.target.value))}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Descuento</label>
              <input
                type="number"
                step="0.01"
                value={saleForm.discount}
                onChange={(event) => handleSaleField('discount', Number(event.target.value))}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">Notas de la venta</label>
              <textarea
                value={saleForm.notes}
                onChange={(event) => handleSaleField('notes', event.target.value)}
                className="min-h-[120px] w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
                placeholder="Anota detalles adicionales"
              />
            </div>
          </div>

          {formError && <p className="text-sm text-rose-400">{formError}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Guardar venta
            </button>
            <button
              type="button"
              onClick={() => setShowSaleModal(false)}
              className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Registrar nuevo gasto" footer={null}>
        <form className="space-y-6" onSubmit={handleCreateExpense}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Categoría</label>
              <input
                value={expenseForm.category}
                onChange={(event) => handleExpenseField('category', event.target.value)}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/20"
                placeholder="Ej: Marketing, Operaciones"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Monto</label>
              <input
                type="number"
                step="0.01"
                value={expenseForm.amount}
                onChange={(event) => handleExpenseField('amount', Number(event.target.value))}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/20"
                placeholder="Monto del gasto"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">Descripción</label>
              <textarea
                value={expenseForm.description}
                onChange={(event) => handleExpenseField('description', event.target.value)}
                className="min-h-[120px] w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/20"
                placeholder="Describe el gasto"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Fecha</label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={(event) => handleExpenseField('date', event.target.value)}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {formError && <p className="text-sm text-rose-400">{formError}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Guardar gasto
            </button>
            <button
              type="button"
              onClick={() => setShowExpenseModal(false)}
              className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
