import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  async function loadSales() {
    const { data } = await api.get('/sales', { params: { search } });
    setSales(data);
  }

  useEffect(() => {
    const timer = setTimeout(loadSales, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function viewInvoice(id) {
    const { data } = await api.get(`/sales/${id}`);
    setSelected(data);
  }

  return (
    <Layout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Sales History</h1>

      <div className="bg-white rounded-xl border border-stone-100 p-4 mb-4 flex items-center gap-3">
        <Search size={18} className="text-ink/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by invoice number…"
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-ink/50 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Invoice #</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Employee</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr
                key={s.id}
                onClick={() => viewInvoice(s.id)}
                className="border-t border-stone-100 cursor-pointer hover:bg-stone-50"
              >
                <td className="px-4 py-3 font-mono-num text-ink/70">{s.invoice_number}</td>
                <td className="px-4 py-3 text-ink/80">{s.customer_name || 'Walk-in customer'}</td>
                <td className="px-4 py-3 text-ink/60">{s.employee_name}</td>
                <td className="px-4 py-3 text-ink/50">{new Date(s.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono-num font-medium">{Number(s.total_price).toFixed(2)} TND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-ink-dark/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative receipt-panel">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-ink/40 hover:text-ink">
              <X size={18} />
            </button>
            <h2 className="font-display font-semibold text-lg text-ink mb-1">{selected.invoice_number}</h2>
            <p className="text-xs text-ink/40 mb-4">{new Date(selected.created_at).toLocaleString()}</p>

            <div className="text-sm text-ink/60 mb-4">
              <p>Customer: {selected.customer_name || 'Walk-in customer'}</p>
              <p>Cashier: {selected.employee_name}</p>
            </div>

            <div className="border-t border-dashed border-stone-100 pt-3 space-y-2 mb-3">
              {selected.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-ink/70">{item.product_name} × {item.quantity}</span>
                  <span className="font-mono-num">{Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-stone-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-ink/60">
                <span>Subtotal</span>
                <span className="font-mono-num">{Number(selected.subtotal).toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-ink/60">
                <span>Discount</span>
                <span className="font-mono-num">-{Number(selected.discount).toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between font-semibold text-ink text-base pt-1">
                <span>Total</span>
                <span className="font-mono-num">{Number(selected.total_price).toFixed(2)} TND</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
