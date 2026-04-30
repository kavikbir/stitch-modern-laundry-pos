import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Link, useNavigate } from 'react-router-dom';

const OrdersList = () => {
  const { orders, fetchOrdersPage, settings } = usePOS();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchOrdersPage(1);
  }, [fetchOrdersPage]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.customer_name || order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Received">Received</option>
            <option value="In Progress">In Progress</option>
            <option value="Quality Check">Quality Check</option>
            <option value="Ready">Ready</option>
            <option value="Collected">Collected</option>
          </select>
          <Link to="/pos/new-order" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">add</span> New Order
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-widest text-slate-500 font-bold">
              <th className="p-6">Order ID</th>
              <th className="p-6">Customer</th>
              <th className="p-6">Date</th>
              <th className="p-6">Status</th>
              <th className="p-6">Payment</th>
              <th className="p-6 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No orders found matching criteria.</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr 
                  key={order.id} 
                  onClick={() => navigate(`/pos/orders/${order.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="p-6 font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{order.id}</td>
                  <td className="p-6">
                    <p className="font-bold text-slate-700">{order.customer_name || order.customerName}</p>
                  </td>
                  <td className="p-6 text-slate-500 text-sm">
                    {new Date(order.created_at || order.date).toLocaleDateString()}
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Received' ? 'bg-slate-100 text-slate-600' :
                      order.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'Quality Check' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      (order.payment_status || order.paymentStatus) === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {order.payment_status || order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-6 text-right font-black text-slate-800">
                    {settings.currency}{order.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersList;
