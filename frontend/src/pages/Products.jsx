import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emptyForm = { barcode: '', name: '', description: '', price: '', cost_price: '', quantity: '', low_stock_threshold: 5 };

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadProducts() {
    const { data } = await api.get('/products', { params: { search } });
    setProducts(data.data);
  }

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(product) {
    setForm({ ...product });
    setEditingId(product.id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post('/products', form);
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
        {user?.role === 'admin' && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink-light"
          >
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-100 p-4 mb-4 flex items-center gap-3">
        <Search size={18} className="text-ink/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or barcode…"
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-ink/50 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Barcode</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">Stock</th>
              {user?.role === 'admin' && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-stone-100">
                <td className="px-4 py-3 font-mono-num text-ink/70">{p.barcode}</td>
                <td className="px-4 py-3 text-ink/80">{p.name}</td>
                <td className="px-4 py-3 text-ink/50">{p.category_name || '—'}</td>
                <td className="px-4 py-3 text-right font-mono-num">{Number(p.price).toFixed(2)} TND</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-mono-num ${p.quantity <= p.low_stock_threshold ? 'text-brick font-medium' : 'text-ink/70'}`}>
                    {p.quantity}
                  </span>
                </td>
                {user?.role === 'admin' && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-ink/50 hover:text-ink">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-brick/70 hover:text-brick">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-ink-dark/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-ink/40 hover:text-ink">
              <X size={18} />
            </button>
            <h2 className="font-display font-semibold text-lg text-ink mb-4">
              {editingId ? 'Edit Product' : 'New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Barcode" value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm font-mono-num" />
              <input required placeholder="Product name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm" />
              <textarea placeholder="Description (optional)" value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" placeholder="Price" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm font-mono-num" />
                <input type="number" step="0.01" placeholder="Cost price" value={form.cost_price || ''}
                  onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm font-mono-num" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Quantity" value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm font-mono-num" />
                <input type="number" placeholder="Low stock alert at" value={form.low_stock_threshold}
                  onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm font-mono-num" />
              </div>
              <button type="submit" className="w-full bg-ink text-white font-medium py-2.5 rounded-lg hover:bg-ink-light text-sm mt-2">
                {editingId ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
