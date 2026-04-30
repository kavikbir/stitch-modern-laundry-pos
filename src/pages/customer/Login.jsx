import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { loginCustomerEmail, registerCustomer, loginWithGoogle, loginWithPhone, verifyOtp, userRole, authLoading } = usePOS();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('email');
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect once role is known
  useEffect(() => {
    if (!authLoading && userRole) {
      if (userRole === 'admin' || userRole === 'manager' || userRole === 'staff') {
        navigate('/pos', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    }
  }, [userRole, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (method === 'email') {
        if (mode === 'login') {
          await loginCustomerEmail(email, password);
        } else {
          if (!name.trim()) throw new Error('Please enter your full name.');
          await registerCustomer(email, password, name);
          setSuccessMsg('Account created! Check your email to verify your address.');
          setLoading(false);
          return;
        }
      } else {
        if (!otpMode) {
          const result = await loginWithPhone(phone, 'recaptcha-container');
          setConfirmationResult(result);
          setOtpMode(true);
          setLoading(false);
          return;
        } else {
          await verifyOtp(confirmationResult, otp);
        }
      }
      // Navigation handled by the useEffect above when userRole updates
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    console.log('[Login] Google button clicked');
    try {
      if (typeof loginWithGoogle !== 'function') {
        throw new Error('Critical Error: loginWithGoogle function is missing from the system controller.');
      }
      
      const user = await loginWithGoogle();
      if (user) {
        alert('Success! Authenticated as: ' + user.email);
      }
    } catch (err) {
      console.error('[Login] Google Login Error:', err);
      setError('System Error: ' + (err.message || 'Unknown error'));
      alert('SYSTEM ERROR: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-8 md:px-16 min-h-screen bg-[#fafafc] flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-neutral-100 max-w-md w-full">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-blue-600">lock</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-neutral-500 text-sm mt-2">
            {mode === 'login' ? 'Access your orders and manage your laundry.' : 'Join Quick Dry to book and track orders.'}
          </p>
        </div>

        {/* Method Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setMethod('email'); setOtpMode(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${method === 'email' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            Email
          </button>
          <button
            onClick={() => { setMethod('phone'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${method === 'phone' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            Mobile
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && method === 'email' && (
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 ml-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>
          )}

          {method === 'email' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>
            </>
          ) : (
            <>
              {!otpMode ? (
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 ml-1">Mobile Number (with country code)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 ml-1">6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-600 text-center tracking-[1em] text-xl font-bold transition-all"
                  />
                </div>
              )}
              <div id="recaptcha-container"></div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg transform hover:-translate-y-1 mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : method === 'phone' && !otpMode ? 'Send OTP'
              : method === 'phone' && otpMode ? 'Verify & Login'
              : mode === 'login' ? 'Login Securely'
              : 'Create Account'}
          </button>
        </form>

        {/* Google Sign-In */}
        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-white px-4 text-neutral-400">Or continue with</span>
            </div>
          </div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-neutral-100 text-neutral-700 font-bold py-4 rounded-xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>

        {/* Toggle login/signup */}
        {method === 'email' && (
          <div className="mt-6 text-center pt-6 border-t border-neutral-100">
            <p className="text-neutral-500 text-sm">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccessMsg(''); }}
                className="ml-2 text-blue-600 font-bold hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
