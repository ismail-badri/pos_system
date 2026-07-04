import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
