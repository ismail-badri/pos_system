import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  ScanBarcode,
  Package,
  Users,
  Receipt,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, adminOnly: false },
  { to: '/pos', label: 'Point of Sale', icon: ScanBarcode, adminOnly: false },
  { to: '/products', label: 'Products', icon: Package, adminOnly: false },
  { to: '/customers', label: 'Customers', icon: Users, adminOnly: false },
  { to: '/sales', label: 'Sales History', icon: Receipt, adminOnly: false },
  { to: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-screen bg-ink text-stone-50 flex flex-col fixed left-0 top-0">
      <div className="px-6 py-6 border-b border-white/10">
        <p className="font-display font-700 text-xl tracking-tight">EL HAMDI</p>
        <p className="text-xs text-stone-100/60 mt-0.5">Store Management</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || user?.role === 'admin')
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber text-ink-dark'
                    : 'text-stone-100/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 mb-2">
          <p className="text-sm font-medium truncate">{user?.full_name}</p>
          <p className="text-xs text-stone-100/50 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-100/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
