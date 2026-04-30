import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';

import { hasRoleSync } from '../../utils/rbac';

const Reports = () => {
  const { orders, settings, userRole } = usePOS();
  const [dateFilter, setDateFilter] = useState('Today'); // Today, Week, Month, All

  if (!hasRoleSync(userRole, 'manager')) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl shadow-lg text-center max-w-md border border-red-100">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">lock</span>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500">
            Business Analytics are restricted to <strong>Managers</strong> and <strong>Admins</strong> only.
          </p>
        </div>
      </div>
    );
  }

  // Very basic filtering simulation
  const filterDate = (dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    if (dateFilter === 'Today') return d.toDateString() === now.toDateString();
    if (dateFilter === 'All') return true;
    return true; // Simplified for simulation
  };

  const filteredOrders = (orders || []).filter(o => filterDate(o.created_at || o.date));
  const totalRevenue = filteredOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrders = filteredOrders.length;
  
  const handleExport = () => {
    alert('Simulated Export: CSV file downloading...');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">Business Analytics</h2>
        <div className="flex gap-4">
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option>Today</option>
            <option>Week</option>
            <option>Month</option>
            <option>All</option>
          </select>
          {userRole === 'owner' && (
            <button onClick={handleExport} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-500 transition-colors">
              <span className="material-symbols-outlined">download</span> Export
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[200px]">
          <span className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-4">Total Revenue ({dateFilter})</span>
          <h3 className="text-6xl font-black text-slate-800">{settings.currency}{totalRevenue}</h3>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[200px]">
          <span className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-4">Total Orders ({dateFilter})</span>
          <h3 className="text-6xl font-black text-blue-600">{totalOrders}</h3>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-6">Recent Transactions Summary</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 font-bold">
              <th className="p-4">Date</th>
              <th className="p-4">Order ID</th>
              <th className="p-4">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.slice(0, 10).map(o => (
              <tr key={o.id}>
                <td className="p-4 text-slate-600">{new Date(o.created_at || o.date).toLocaleDateString()}</td>
                <td className="p-4 font-bold">{o.id}</td>
                <td className="p-4 text-slate-800 font-bold">{settings.currency}{o.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
