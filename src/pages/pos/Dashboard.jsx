import React from 'react';
import { usePOS } from '../../context/POSContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { dashboardStats, orders, fetchOrdersPage, fetchDashboardStats, settings } = usePOS();

  React.useEffect(() => {
    fetchDashboardStats();
    fetchOrdersPage(1);
  }, [fetchDashboardStats, fetchOrdersPage]);

  // Use dashboardStats instead of stats
  const stats = dashboardStats;

  if (!stats) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const recentOrders = (orders || []).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Today's Revenue</span>
          <h2 className="text-3xl font-black text-slate-800">{settings.currency}{stats.today_revenue || 0}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Today's Orders</span>
          <h2 className="text-3xl font-black text-blue-600">{stats.orders_today || 0}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Active Orders</span>
          <h2 className="text-3xl font-black text-amber-500">{stats.active_orders || 0}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Total Customers</span>
          <h2 className="text-3xl font-black text-emerald-500">{stats.total_customers || 0}</h2>
        </div>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
              <Link to="/pos/orders" className="text-blue-600 text-sm font-bold hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No orders yet today.</div>
              ) : (
                recentOrders.map(order => (
                  <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        order.status === 'Collected' ? 'bg-emerald-100 text-emerald-600' :
                        order.status === 'Ready' ? 'bg-blue-100 text-blue-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {order.status === 'Collected' ? <span className="material-symbols-outlined text-[18px]">check</span> : <span className="material-symbols-outlined text-[18px]">pending</span>}
                      </div>
                      <div>
                        <Link to={`/pos/orders/${order.id}`} className="font-bold text-slate-800 hover:text-blue-600 transition-colors">{order.id}</Link>
                        <p className="text-sm text-slate-500">
                          {order.customer_name || order.customerName}
                          {order.customer_phone && <span className="ml-2 text-xs text-slate-400">({order.customer_phone})</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{settings.currency}{order.total}</p>
                      <p className="text-xs text-slate-400">{new Date(order.created_at || order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-2">Create Order</h3>
              <p className="text-slate-400 text-sm mb-6">Start a new transaction for a customer.</p>
              <Link to="/pos/new-order" className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-500 transition-colors w-full text-center">
                Start Process
              </Link>
            </div>
            <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-8xl text-white/5 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">add_circle</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4">System Alerts</h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">warning</span>
                <div>
                  <p className="text-sm font-bold text-slate-700">Low Supplies</p>
                  <p className="text-xs text-slate-500">Detergent stock is running below 20%.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-blue-500 text-[20px]">info</span>
                <div>
                  <p className="text-sm font-bold text-slate-700">System Update</p>
                  <p className="text-xs text-slate-500">Loundra AI sync completed successfully.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
