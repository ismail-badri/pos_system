import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanBarcode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(username, password);
    if (ok) navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-ink flex items-center justify-center mb-4">
            <ScanBarcode className="text-amber" size={24} />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">EL HAMDI</h1>
          <p className="text-sm text-ink/50 mt-1">Store Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="receipt-panel rounded-xl p-6 pb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-100 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber/50 text-sm"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-100 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber/50 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-brick">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white font-medium py-2.5 rounded-lg hover:bg-ink-light transition-colors disabled:opacity-60 text-sm"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-ink/40 mt-6">
          Default admin — username: admin · password: admin123
        </p>
      </div>
    </div>
  );
}
