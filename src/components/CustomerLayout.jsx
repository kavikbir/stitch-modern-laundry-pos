import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePOS } from '../context/POSContext';

const CustomerLayout = ({ children }) => {
  const { userRole, logoutCustomer } = usePOS();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    ...(userRole ? [{ name: 'My Account', path: '/account' }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] font-sans text-neutral-900 transition-colors duration-300">

      {/* Fixed Background pattern (non-home) */}
      {location.pathname !== '/' && (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
          <img src="/bg_pattern.png" alt="" className="w-full h-full object-cover opacity-[0.08] mix-blend-luminosity" />
        </div>
      )}

      {/* Nav */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-sm py-4'
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-[1440px] mx-auto px-8 md:px-16 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="text-blue-600 material-symbols-outlined text-3xl animate-float">dry_cleaning</span>
            Quick Dry
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-all hover:-translate-y-0.5 ${
                  location.pathname === link.path
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {userRole ? (
              <button onClick={logoutCustomer} className="text-sm font-medium text-red-500 hover:text-red-700 transition-all">
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="text-sm font-medium text-neutral-500 hover:text-blue-600 transition-all">
                Login
              </Link>
            )}

            <Link
              to="/book"
              className="bg-neutral-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      <main className="w-full relative z-10">
        {children}
      </main>

      <footer className="bg-neutral-950 text-white pt-20 pb-10 px-8 md:px-16 relative z-10">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-neutral-800 pb-12 mb-8">
          <div>
            <Link to="/" className="text-xl font-bold tracking-widest uppercase flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <span className="text-blue-500 material-symbols-outlined animate-float">dry_cleaning</span>
              Quick Dry
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Premium laundry and dry cleaning services delivered directly to your door. High quality care and perfect washing for all your clothes.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li><Link to="/services" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Dry Cleaning</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Wash & Fold</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Ironing</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Alterations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors hover:translate-x-1 inline-block">About Us</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Pricing</Link></li>
              <li><Link to="/sustainability" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Sustainability</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">mail</span> hello@quickdry.com
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">call</span> +1 (800) 123-4567
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto text-neutral-500 text-sm text-center">
          © {new Date().getFullYear()} Quick Dry Cleaning. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
