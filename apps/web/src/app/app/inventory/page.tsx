"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";

type Product = {
  id: string;
  name: string;
  sku: string;
  initialStock: number;
  minimumStock: number;
  salePrice: number;
  status: string;
  purchasePrice: number;
  category?: string;
  supplier?: string;
};

type ProductForm = {
  name: string;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  initialStock: number;
  minimumStock: number;
  category: string;
  supplier: string;
  status: 'ACTIVE' | 'INACTIVE';
};

type StockMovement = {
  id: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  createdAt: string;
  product: { id: string; name: string; sku: string };
};

type ProductEntryExitForm = {
  productId: string;
  quantity: number;
};

const emptyProductForm: ProductForm = {
  name: '',
  sku: '',
  purchasePrice: 0,
  salePrice: 0,
  initialStock: 0,
  minimumStock: 0,
  category: '',
  supplier: '',
  status: 'ACTIVE',
};

const emptyEntryForm: ProductEntryExitForm = {
  productId: '',
  quantity: 0,
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ENTRIES' | 'EXITS' | 'STOCK'>('PRODUCTS');
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormState, setProductFormState] = useState<ProductForm>(emptyProductForm);
  const [entryFormState, setEntryFormState] = useState<ProductEntryExitForm>(emptyEntryForm);
  const [exitFormState, setExitFormState] = useState<ProductEntryExitForm>(emptyEntryForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [productData, movementData] = await Promise.all([api.products.list(), api.stockMovements.list()]);
      setProducts(productData);
      setMovements(movementData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetProductForm = () => {
    setProductFormState(emptyProductForm);
    setFormError(null);
    setEditingProductId(null);
  };

  const handleProductField = <K extends keyof ProductForm>(field: K, value: ProductForm[K]) => {
    setProductFormState((current) => ({ ...current, [field]: value }));
  };

  const handleEdit = (product: Product) => {
    setShowProductForm(true);
    setEditingProductId(product.id);
    setProductFormState({
      name: product.name,
      sku: product.sku,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      initialStock: product.initialStock,
      minimumStock: product.minimumStock,
      category: product.category ?? '',
      supplier: product.supplier ?? '',
      status: product.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.products.remove(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    if (!productFormState.name.trim() || !productFormState.sku.trim()) {
      setFormError('El nombre y el SKU son obligatorios.');
      setSaving(false);
      return;
    }

    try {
      if (editingProductId) {
        await api.products.update(editingProductId, {
          name: productFormState.name,
          sku: productFormState.sku,
          purchasePrice: productFormState.purchasePrice,
          salePrice: productFormState.salePrice,
          initialStock: productFormState.initialStock,
          minimumStock: productFormState.minimumStock,
          category: productFormState.category || undefined,
          supplier: productFormState.supplier || undefined,
          status: productFormState.status,
        });
      } else {
        await api.products.create({
          name: productFormState.name,
          sku: productFormState.sku,
          purchasePrice: productFormState.purchasePrice,
          salePrice: productFormState.salePrice,
          initialStock: productFormState.initialStock,
          minimumStock: productFormState.minimumStock,
          category: productFormState.category || undefined,
          supplier: productFormState.supplier || undefined,
          status: productFormState.status,
        });
      }

      await loadData();
      resetProductForm();
      setShowProductForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleEntrySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    if (!entryFormState.productId || entryFormState.quantity <= 0) {
      setFormError('Selecciona un producto y una cantidad mayor a cero.');
      setSaving(false);
      return;
    }

    try {
      await api.stockMovements.create({
        productId: entryFormState.productId,
        type: 'ENTRY',
        quantity: entryFormState.quantity,
      });
      await loadData();
      setEntryFormState(emptyEntryForm);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo registrar la entrada');
    } finally {
      setSaving(false);
    }
  };

  const handleExitSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    if (!exitFormState.productId || exitFormState.quantity <= 0) {
      setFormError('Selecciona un producto y una cantidad mayor a cero.');
      setSaving(false);
      return;
    }

    try {
      await api.stockMovements.create({
        productId: exitFormState.productId,
        type: 'EXIT',
        quantity: exitFormState.quantity,
      });
      await loadData();
      setExitFormState(emptyEntryForm);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo registrar la salida');
    } finally {
      setSaving(false);
    }
  };

  const stockReport = useMemo(
    () =>
      products.map((product) => {
        const entries = movements
          .filter((movement) => movement.product.id === product.id && movement.type === 'ENTRY')
          .reduce((sum, movement) => sum + movement.quantity, 0);
        const exits = movements
          .filter((movement) => movement.product.id === product.id && movement.type === 'EXIT')
          .reduce((sum, movement) => sum + movement.quantity, 0);

        return {
          ...product,
          entries,
          exits,
          stock: product.initialStock + entries - exits,
        };
      }),
    [products, movements]
  );

  const tabButtons = [
    { id: 'PRODUCTS', label: 'Productos' },
    { id: 'ENTRIES', label: 'Entradas' },
    { id: 'EXITS', label: 'Salidas' },
    { id: 'STOCK', label: 'Stock' },
  ] as const;

  return (
    <PageShell className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Inventario</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Control de stock</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-full bg-slate-100 p-2">
        {tabButtons.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-white'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {activeTab === 'PRODUCTS'
                ? 'Productos'
                : activeTab === 'ENTRIES'
                ? 'Registrar entrada'
                : activeTab === 'EXITS'
                ? 'Registrar salida'
                : 'Stock disponible'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {activeTab === 'PRODUCTS'
                ? 'Administra los productos con código, nombre y precio.'
                : activeTab === 'ENTRIES'
                ? 'Registra las entradas de inventario para productos existentes.'
                : activeTab === 'EXITS'
                ? 'Registra las salidas de inventario para productos existentes.'
                : 'Consulta el stock real calculado por entradas y salidas.'}
            </p>
          </div>
          {activeTab === 'PRODUCTS' && (
            <button
              type="button"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={() => {
                setShowProductForm((current) => !current);
                resetProductForm();
              }}
            >
              {showProductForm ? 'Cerrar formulario' : editingProductId ? 'Editar producto' : 'Agregar producto'}
            </button>
          )}
        </div>

        {activeTab === 'PRODUCTS' && showProductForm && (
          <form className="mt-6 space-y-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6" onSubmit={handleProductSubmit}>
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">SKU</label>
                <input
                  value={productFormState.sku}
                  onChange={(event) => handleProductField('sku', event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nombre</label>
                <input
                  value={productFormState.name}
                  onChange={(event) => handleProductField('name', event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Precio de venta</label>
                <input
                  type="number"
                  step="0.01"
                  value={productFormState.salePrice}
                  onChange={(event) => handleProductField('salePrice', Number(event.target.value))}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Precio de compra</label>
                <input
                  type="number"
                  step="0.01"
                  value={productFormState.purchasePrice}
                  onChange={(event) => handleProductField('purchasePrice', Number(event.target.value))}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Stock inicial</label>
                <input
                  type="number"
                  value={productFormState.initialStock}
                  onChange={(event) => handleProductField('initialStock', Number(event.target.value))}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Stock mínimo</label>
                <input
                  type="number"
                  value={productFormState.minimumStock}
                  onChange={(event) => handleProductField('minimumStock', Number(event.target.value))}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Categoría</label>
                <input
                  value={productFormState.category}
                  onChange={(event) => handleProductField('category', event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Proveedor</label>
                <input
                  value={productFormState.supplier}
                  onChange={(event) => handleProductField('supplier', event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Estado</label>
              <select
                value={productFormState.status}
                onChange={(event) => handleProductField('status', event.target.value as 'ACTIVE' | 'INACTIVE')}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>

            {formError && <p className="text-sm text-rose-600">{formError}</p>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {editingProductId ? 'Guardar producto' : 'Agregar producto'}
              </button>
              <button
                type="button"
                disabled={saving}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => {
                  resetProductForm();
                  setShowProductForm(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {activeTab === 'ENTRIES' && (
          <form className="mt-6 space-y-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6" onSubmit={handleEntrySubmit}>
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_0.8fr]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Producto</label>
                <select
                  value={entryFormState.productId}
                  onChange={(event) => setEntryFormState((current) => ({ ...current, productId: event.target.value }))}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                >
                  <option value="">Selecciona producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={entryFormState.quantity}
                  onChange={(event) => setEntryFormState((current) => ({ ...current, quantity: Number(event.target.value) }))}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  Añadir entrada
                </button>
              </div>
            </div>
            {formError && <p className="text-sm text-rose-600">{formError}</p>}
          </form>
        )}

        {activeTab === 'EXITS' && (
          <form className="mt-6 space-y-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6" onSubmit={handleExitSubmit}>
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_0.8fr]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Producto</label>
                <select
                  value={exitFormState.productId}
                  onChange={(event) => setExitFormState((current) => ({ ...current, productId: event.target.value }))}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                >
                  <option value="">Selecciona producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={exitFormState.quantity}
                  onChange={(event) => setExitFormState((current) => ({ ...current, quantity: Number(event.target.value) }))}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
                >
                  Añadir salida
                </button>
              </div>
            </div>
            {formError && <p className="text-sm text-rose-600">{formError}</p>}
          </form>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                {activeTab === 'PRODUCTS' && (
                  <>
                    <th className="px-4 py-3 font-semibold">Código</th>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Precio</th>
                    <th className="px-4 py-3 font-semibold">Acciones</th>
                  </>
                )}
                {activeTab === 'ENTRIES' && (
                  <>
                    <th className="px-4 py-3 font-semibold">Código</th>
                    <th className="px-4 py-3 font-semibold">Producto</th>
                    <th className="px-4 py-3 font-semibold">Cantidad</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                  </>
                )}
                {activeTab === 'EXITS' && (
                  <>
                    <th className="px-4 py-3 font-semibold">Código</th>
                    <th className="px-4 py-3 font-semibold">Producto</th>
                    <th className="px-4 py-3 font-semibold">Cantidad</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                  </>
                )}
                {activeTab === 'STOCK' && (
                  <>
                    <th className="px-4 py-3 font-semibold">Producto</th>
                    <th className="px-4 py-3 font-semibold">Entradas</th>
                    <th className="px-4 py-3 font-semibold">Salidas</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Cargando datos...
                  </td>
                </tr>
              ) : activeTab === 'PRODUCTS' ? (
                products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      No hay productos registrados.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900">{product.sku}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(product.salePrice)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            onClick={() => handleEdit(product)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                            onClick={() => handleDelete(product.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : activeTab === 'ENTRIES' ? (
                movements.filter((movement) => movement.type === 'ENTRY').length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      No hay entradas registradas.
                    </td>
                  </tr>
                ) : (
                  movements
                    .filter((movement) => movement.type === 'ENTRY')
                    .map((movement) => (
                      <tr key={movement.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{movement.product.sku}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{movement.product.name}</td>
                        <td className="px-4 py-3 text-slate-600">{movement.quantity}</td>
                        <td className="px-4 py-3 text-slate-600">{new Date(movement.createdAt).toLocaleDateString('es-CO')}</td>
                      </tr>
                    ))
                )
              ) : activeTab === 'EXITS' ? (
                movements.filter((movement) => movement.type === 'EXIT').length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      No hay salidas registradas.
                    </td>
                  </tr>
                ) : (
                  movements
                    .filter((movement) => movement.type === 'EXIT')
                    .map((movement) => (
                      <tr key={movement.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{movement.product.sku}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{movement.product.name}</td>
                        <td className="px-4 py-3 text-slate-600">{movement.quantity}</td>
                        <td className="px-4 py-3 text-slate-600">{new Date(movement.createdAt).toLocaleDateString('es-CO')}</td>
                      </tr>
                    ))
                )
              ) : stockReport.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No hay productos para mostrar stock.
                  </td>
                </tr>
              ) : (
                stockReport.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.entries}</td>
                    <td className="px-4 py-3 text-slate-600">{item.exits}</td>
                    <td className="px-4 py-3 text-slate-600">{item.stock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
