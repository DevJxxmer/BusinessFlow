from pathlib import Path

path = Path('src/App.tsx')
text = path.read_text(encoding='utf-8')
start = text.find('function TransactionModal')
end = text.find('function MovementModal', start)
if start == -1 or end == -1:
    raise SystemExit('Could not find TransactionModal or MovementModal in src/App.tsx')
replacement = '''function TransactionModal({ products, onClose, onSubmit }: { products: Product[]; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [transactionType, setTransactionType] = useState<TransactionType>('income')

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">NUEVO MOVIMIENTO</p>
            <h2 id="modal-title">Registrar operación</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="type-toggle">
            <label>
              <input
                type="radio"
                name="type"
                value="income"
                checked={transactionType === 'income'}
                onChange={() => setTransactionType('income')}
              />
              <span>Ingreso</span>
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={transactionType === 'expense'}
                onChange={() => setTransactionType('expense')}
              />
              <span>Gasto</span>
            </label>
          </div>

          <div className="form-row">
            <label>
              Descripción
              <input name="title" required placeholder="Ej. Pago de cliente" />
            </label>
            <label>
              Fecha
              <input name="date" type="date" defaultValue="2025-07-02" required />
            </label>
          </div>

          <div className="form-row">
            <label>
              Cantidad
              <input name="quantity" type="number" min="1" step="1" required placeholder="Ej. 3" />
            </label>
            <label>
              Monto
              <input name="amount" type="number" min="0" step="0.01" required placeholder="Ej. 1250.00" />
            </label>
          </div>

          {transactionType === 'income' ? (
            <>
              <div className="form-row">
                <label>
                  Cliente
                  <input name="client" placeholder="Ej. Grupo Norte" />
                </label>
                <label>
                  Producto
                  <select name="productId" defaultValue={products[0]?.id}>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} · {formatMoney(product.price)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Categoría
                  <select name="category" defaultValue="Ventas">
                    <option>Ventas</option>
                    <option>Compras</option>
                    <option>Servicios</option>
                    <option>Marketing</option>
                  </select>
                </label>
                <label>
                  Cuenta
                  <select name="account" defaultValue="Cuenta principal">
                    <option>Cuenta principal</option>
                    <option>Tarjeta corporativa</option>
                    <option>Efectivo</option>
                  </select>
                </label>
              </div>
            </>
          ) : (
            <div className="form-note">
              <small>Para un gasto, completa sólo Nombre del gasto, Monto, Cantidad y Fecha.</small>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Guardar movimiento
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
'''
new_text = text[:start] + replacement + text[end:]
path.write_text(new_text, encoding='utf-8')
print('TransactionModal replacement complete')
