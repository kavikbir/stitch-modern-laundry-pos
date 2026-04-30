import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePOS } from '../../context/POSContext';

const POSLogin = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { loginAdmin, loginWithGoogle, userRole, authLoading } = usePOS();
  const navigate = useNavigate();

  // Redirect once role is confirmed as admin/manager/staff
  useEffect(() => {
    if (!authLoading && userRole) {
      if (userRole === 'admin' || userRole === 'manager' || userRole === 'staff') {
        navigate('/pos', { replace: true });
      } else {
        // Logged in but not admin — deny access
        setError('Access denied. Your account does not have admin privileges.');
      }
    }
  }, [userRole, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(email, password);
      // Navigation handled by useEffect
    } catch (err) {
      setError(err.message || 'Invalid credentials. Access denied.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    console.log('[POSLogin] Google button clicked');
    try {
      if (typeof loginWithGoogle !== 'function') {
        throw new Error('Critical Error: loginWithGoogle function is missing from the system controller.');
      }
      
      const user = await loginWithGoogle();
      if (user) {
        alert('Success! Authenticated as: ' + user.email);
      } else {
        console.warn('[POSLogin] Google login returned no user');
      }
    } catch (err) {
      console.error('[POSLogin] Google Login Error:', err);
      setError('System Error: ' + (err.message || 'Unknown error'));
      alert('SYSTEM ERROR: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3 hover:rotate-0 transition-transform">
              <span className="material-symbols-outlined text-white text-3xl">local_laundry_service</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quick Dry Cleaning</h1>
            <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Admin Terminal</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 transition-all font-medium text-slate-900"
                  placeholder="ucss.kritagya@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 transition-all font-medium text-slate-900"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  Access Terminal
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg-white px-4 text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-slate-100 text-slate-700 font-bold py-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Restricted Access — Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};

export default POSLogin;
