import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Orders', path: '/orders' },
    { name: 'Customers', path: '/customers' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <div className="min-h-screen bg-background font-body-lg text-on-surface">
      {/* Top Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-primary-container z-[100]"></div>
      
      {/* TopAppBar Global (Black Bar) */}
      <nav className="bg-neutral-950 dark:bg-black font-sans tracking-tight font-light flex justify-between items-center w-full px-8 h-12 fixed top-0 z-50">
        <div className="text-lg font-bold tracking-[0.2em] text-white uppercase">L'ARTISAN</div>
        <div className="flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-normal transition-colors duration-200 pb-1 ${
                location.pathname === link.path
                  ? 'text-white font-medium border-b-2 border-blue-600'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-neutral-400 hover:text-white transition-colors duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link to="/settings" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center">
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
      </nav>

      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
