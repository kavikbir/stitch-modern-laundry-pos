import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePOS } from '../context/POSContext';

const POSLayout = ({ children }) => {
  const { userRole, notifications, markNotificationRead, settings, logoutAdmin } = usePOS();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const navItems = [
    { name: 'Dashboard', path: '/pos', icon: 'dashboard', roles: ['staff', 'manager', 'admin'] },
    { name: 'New Order', path: '/pos/new-order', icon: 'add_circle', roles: ['staff', 'manager', 'admin'] },
    { name: 'Orders', path: '/pos/orders', icon: 'receipt_long', roles: ['staff', 'manager', 'admin'] },
    { name: 'Customers', path: '/pos/customers', icon: 'group', roles: ['manager', 'admin'] },
    { name: 'Reports', path: '/pos/reports', icon: 'analytics', roles: ['manager', 'admin'] },
    { name: 'Settings', path: '/pos/settings', icon: 'settings', roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <span className="material-symbols-outlined text-blue-500 mr-2">local_laundry_service</span>
          <span className="text-white font-bold tracking-widest uppercase text-sm">{settings?.business_name || settings?.businessName || 'Laundry POS'}</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {filteredNav.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/pos' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Status indicator */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-400">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[18px] mr-2">cloud_done</span>
              Online Syncing
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {location.pathname === '/pos' ? 'Dashboard' : location.pathname.split('/').pop().replace('-', ' ')}
          </h1>
          
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {(notifications || []).length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${!n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{n.title}</h4>
                            <span className="text-[10px] text-slate-400">{n.created_at ? new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                          </div>
                          <p className="text-xs text-slate-500">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {(userRole || 's').charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-bold text-slate-700 capitalize">{userRole}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider">{settings?.business_name || 'Quick Dry'}</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  await logoutAdmin();
                  navigate('/pos/login');
                }}
                className="ml-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default POSLayout;
