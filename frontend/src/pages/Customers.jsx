import React, { useEffect, useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';

const emptyForm = { name: '', phone: '', email: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function loadCustomers() {
    const { data } = await api.get('/customers', { params: { search } });
    setCustomers(data);
  }

  useEffect(() => {
    const timer = setTimeout(loadCustomers, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/customers', form);
      setShowForm(false);
      setForm(emptyForm);
      loadCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save customer.');
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Customers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink-light"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-100 p-4 mb-4 flex items-center gap-3">
        <Search size={18} className="text-ink/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email…"
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-ink/50 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-right px-4 py-3">Loyalty Points</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-stone-100">
                <td className="px-4 py-3 text-ink/80">{c.name}</td>
                <td className="px-4 py-3 font-mono-num text-ink/60">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-ink/60">{c.email || '—'}</td>
                <td className="px-4 py-3 text-right font-mono-num text-amber-dark font-medium">{c.loyalty_points}</td>
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
            <h2 className="font-display font-semibold text-lg text-ink mb-4">New Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Full name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm" />
              <input placeholder="Phone number" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm" />
              <input placeholder="Email address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm" />
              <input placeholder="Address" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-sm" />
              <button type="submit" className="w-full bg-ink text-white font-medium py-2.5 rounded-lg hover:bg-ink-light text-sm mt-2">
                Create Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
