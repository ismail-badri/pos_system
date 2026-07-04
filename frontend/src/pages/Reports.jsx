import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const periods = ['daily', 'weekly', 'monthly', 'annual'];

export default function Reports() {
  const [period, setPeriod] = useState('daily');
  const [salesReport, setSalesReport] = useState([]);
  const [profitReport, setProfitReport] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    api.get('/reports/sales', { params: { period } }).then((res) => setSalesReport(res.data));
  }, [period]);

  useEffect(() => {
    api.get('/reports/profit').then((res) => setProfitReport(res.data));
    api.get('/reports/low-stock').then((res) => setLowStock(res.data));
  }, []);

  return (
    <Layout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Reports & Analytics</h1>

      <div className="bg-white rounded-xl border border-stone-100 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-ink">Sales Report</h2>
          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${
                  period === p ? 'bg-ink text-white' : 'bg-stone-50 text-ink/60'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-ink/50 text-xs uppercase">
            <tr>
              <th className="text-left py-2">Period</th>
              <th className="text-right py-2">Orders</th>
              <th className="text-right py-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {salesReport.map((row) => (
              <tr key={row.period} className="border-t border-stone-100">
                <td className="py-2 font-mono-num text-ink/70">{row.period}</td>
                <td className="py-2 text-right font-mono-num">{row.order_count}</td>
                <td className="py-2 text-right font-mono-num font-medium">{Number(row.revenue).toFixed(2)} TND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-stone-100 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Profit by Product</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {profitReport.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-ink/70">{p.name}</span>
                <span className="font-mono-num text-okgreen font-medium">{Number(p.profit).toFixed(2)} TND</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-100 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Low Stock Report</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {lowStock.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-ink/70">{p.name}</span>
                <span className="font-mono-num text-brick font-medium">{p.quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
