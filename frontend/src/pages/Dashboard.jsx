import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';
import { TrendingUp, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

function StatCard({ label, value, icon: Icon, accent = false }) {
  return (
    <div className={`rounded-xl p-5 border ${accent ? 'receipt-panel' : 'bg-white border-stone-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-ink/50 uppercase tracking-wide">{label}</p>
        <Icon size={16} className="text-amber-dark" />
      </div>
      <p className="font-mono-num text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((res) => setData(res.data)).catch(console.error);
  }, []);

  if (!data) {
    return (
      <Layout>
        <p className="text-ink/50">Loading dashboard…</p>
      </Layout>
    );
  }

  const chartData = {
    labels: data.monthlySales.map((m) => m.month),
    datasets: [
      {
        label: 'Revenue',
        data: data.monthlySales.map((m) => m.revenue),
        borderColor: '#14323A',
        backgroundColor: 'rgba(232,163,61,0.15)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-ink/50">Today's overview of EL HAMDI store performance</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's Revenue" value={`${Number(data.todayRevenue).toFixed(2)} TND`} icon={TrendingUp} accent />
        <StatCard label="Today's Orders" value={data.todayOrders} icon={ShoppingCart} />
        <StatCard label="Total Products" value={data.totalProducts} icon={Package} />
        <StatCard label="Low Stock Items" value={data.lowStock.length} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-stone-100 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Revenue — Last 6 Months</h2>
          <Line data={chartData} options={{ plugins: { legend: { display: false } } }} />
        </div>

        <div className="bg-white rounded-xl border border-stone-100 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Low Stock Alerts</h2>
          <div className="space-y-3">
            {data.lowStock.length === 0 && <p className="text-sm text-ink/40">All stock levels look healthy.</p>}
            {data.lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">{p.name}</span>
                <span className="font-mono-num text-brick font-medium">{p.quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-xl border border-stone-100 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Best Selling Products</h2>
          <div className="space-y-3">
            {data.bestSellers.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">
                  <span className="font-mono-num text-ink/40 mr-2">{String(i + 1).padStart(2, '0')}</span>
                  {p.name}
                </span>
                <span className="font-mono-num text-ink font-medium">{p.units_sold} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-100 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {data.recentSales.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-ink/80">{s.invoice_number}</p>
                  <p className="text-xs text-ink/40">{s.customer_name || 'Walk-in customer'}</p>
                </div>
                <span className="font-mono-num text-ink font-medium">{Number(s.total_price).toFixed(2)} TND</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
