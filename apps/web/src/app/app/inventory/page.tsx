import { PageShell } from "@/components/page-shell";
import { inventoryItems } from "@/lib/mock-data";

export default function InventoryPage() {
  return (
    <PageShell className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Inventario</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Controla tus productos y stock</h1>
        </div>
        <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Agregar producto</button>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {inventoryItems.map((item) => (
              <tr key={item.sku} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-slate-600">{item.sku}</td>
                <td className="px-4 py-3 text-slate-600">{item.stock}</td>
                <td className="px-4 py-3 text-slate-600">{item.price}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Activo
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
