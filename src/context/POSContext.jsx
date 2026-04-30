import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { auth, googleProvider } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendEmailVerification,
} from 'firebase/auth';
import Logger from '../utils/logger';
import { parseError, withRetry, safeSupabaseOp } from '../utils/errorHandler';
import {
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginAttempts,
  checkOrderCreationLimit,
} from '../utils/rateLimiter';
import { isWhitelistedAdmin, hasRoleSync } from '../utils/rbac';

const POSContext = createContext(null);
export const usePOS = () => useContext(POSContext);

const PAGE_SIZE = 10;

export const POSProvider = ({ children }) => {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [currentAdmin,    setCurrentAdmin]    = useState(null);
  const [userRole,        setUserRole]        = useState(null);
  const [authLoading,     setAuthLoading]     = useState(true);
  const [orders,          setOrders]          = useState([]);
  const [customers,       setCustomers]       = useState([]);
  const [notifications,   setNotifications]   = useState([]);
  const [settings,        setSettings]        = useState({    business_name: 'Stitch Modern Laundry',
    currency: '₹',
    tax_rate: 0,
    min_order: 100,
  });
  const [ordersPage,      setOrdersPage]      = useState(1);
  const [ordersTotal,     setOrdersTotal]     = useState(0);
  const [customersPage,   setCustomersPage]   = useState(1);
  const [customersTotal,  setCustomersTotal]  = useState(0);
  const [dashboardStats,  setDashboardStats]  = useState(null);
  const [notificationBell, setNotificationBell] = useState([]);

  const dashboardCacheRef = useRef({ data: null, lastFetched: 0 });
  const channelsRef = useRef([]);

  // ─────────────────────────────────────────────────────────
  // SECTION: FIREBASE AUTH LISTENER
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      handleAuthChange(user);
    });
    return () => {
      unsubscribe();
      cleanupSubscriptions();
    };
  }, []);

  async function handleAuthChange(user) {
    if (!user) {
      setCurrentCustomer(null);
      setCurrentAdmin(null);
      setUserRole(null);
      setAuthLoading(false);
      cleanupSubscriptions();
      return;
    }

    try {
      const isWhitelisted = isWhitelistedAdmin(user.email);
      console.log('[Auth] User:', user.email, 'Admin Status:', isWhitelisted);

      // 1. Fetch or create profile in Supabase using maybeSingle to avoid 406 on missing rows
      let { data: profile } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user.uid)
        .maybeSingle();

      // 2. If profile missing, admin needs role upgrade, OR verification status changed — upsert it
      if (!profile || (isWhitelisted && profile.role !== 'admin') || profile.is_verified !== (user.emailVerified || isWhitelisted)) {
        const userData = {
          id: user.uid,
          name: profile?.name || user.displayName || user.email?.split('@')[0] || 'New User',
          email: user.email || '',
          role: isWhitelisted ? 'admin' : (profile?.role || 'customer'),
          is_verified: user.emailVerified || isWhitelisted,
          is_active: true,
          is_deleted: false,
        };

        const { data: synced, error: syncErr } = await supabase
          .from('customers')
          .upsert(userData, { onConflict: 'id' })
          .select()
          .maybeSingle();

        if (syncErr) {
          console.error('[Auth] Supabase sync failed, using fallback:', syncErr.message);
          // If DB sync fails (e.g. RLS), we STILL allow the admin to proceed
          profile = { ...userData, role: isWhitelisted ? 'admin' : 'customer' };
        } else {
          profile = synced || userData;
        }
      }

      // 3. Set context state
      const role = profile?.role || (isWhitelisted ? 'admin' : 'customer');
      setUserRole(role);

      if (role === 'customer') {
        setCurrentCustomer(profile);
        setCurrentAdmin(null);
        subscribeToCustomerOrders(user.uid);
        subscribeToCustomerNotifications(user.uid);
      } else {
        setCurrentAdmin({ ...profile, email: user.email });
        setCurrentCustomer(null);
        subscribeToActiveOrders();
      }
    } catch (err) {
      console.error('[Auth] handleAuthChange crash:', err.message);
      // Graceful fallback — set minimal role so spinner clears
      const fallbackRole = isWhitelistedAdmin(user.email) ? 'admin' : 'customer';
      setUserRole(fallbackRole);
      if (fallbackRole === 'admin') {
        setCurrentAdmin({ id: user.uid, email: user.email, role: 'admin' });
      } else {
        setCurrentCustomer({ id: user.uid, email: user.email, role: 'customer' });
      }
    } finally {
      setAuthLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────
  // SECTION: Auth Operations (Firebase Auth)
  // ─────────────────────────────────────────────────────────

  /** Customer: Email/Password Login */
  const loginCustomerEmail = async (email, password) => {
    const limit = checkLoginRateLimit(email);
    if (!limit.allowed) throw new Error(limit.reason);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      clearLoginAttempts(email);
      return user;
    } catch (err) {
      recordFailedLogin(email);
      throw err;
    }
  };

  /** Customer: Email/Password Register */
  const registerCustomer = async (email, password, name) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    // Update profile in Supabase immediately or handleAuthChange will do it.
    // To ensure name is saved, we can pass it to handleAuthChange or upsert here.
    await supabase.from('customers').upsert({
      id: user.uid,
      name: name,
      email: email,
      role: 'customer'
    });
    await sendEmailVerification(user).catch(() => {}); // best-effort
    return user;
  };

  /** Send/Resend verification email */
  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      alert('Verification email sent! Please check your inbox (and spam folder).');
    }
  };

  /** Google Sign-In — uses Popup */
  const loginWithGoogle = async () => {
    try {
      console.log('[Auth] Attempting Google Popup...');
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.error('[Auth] Google Login Error:', err);
      alert('Login Error: ' + err.message);
      throw err;
    }
  };

  /** Phone OTP — Step 1: Send OTP */
  const loginWithPhone = async (phone, containerId) => {
    const verifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
    return signInWithPhoneNumber(auth, phone, verifier);
  };

  /** Phone OTP — Step 2: Verify OTP */
  const verifyOtp = async (confirmationResult, otp) => {
    const { user } = await confirmationResult.confirm(otp);
    return user;
  };

  /** Admin: Email Login (whitelist-gated) */
  const loginAdmin = async (email, password) => {
    if (!isWhitelistedAdmin(email)) {
      throw new Error('Access denied. This email is not an authorized admin.');
    }
    const limit = checkLoginRateLimit(email);
    if (!limit.allowed) throw new Error(limit.reason);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      clearLoginAttempts(email);
      await Logger.login(email).catch(() => {});
      return user;
    } catch (err) {
      recordFailedLogin(email);
      throw err;
    }
  };

  /** Logout — works for all user types */
  const logoutCustomer = async () => {
    cleanupSubscriptions();
    await signOut(auth);
  };

  const logoutAdmin = async () => {
    await Logger.logout().catch(() => {});
    cleanupSubscriptions();
    await signOut(auth);
  };

  // ─────────────────────────────────────────────────────────
  // SECTION: Realtime Subscriptions
  // ─────────────────────────────────────────────────────────
  function cleanupSubscriptions() {
    channelsRef.current.forEach(ch => supabase.removeChannel(ch));
    channelsRef.current = [];
  }

  function subscribeToCustomerOrders(userId) {
    const ch = supabase.channel(`cust-orders-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${userId}` }, (p) => {
        setOrders(prev => {
          if (p.eventType === 'INSERT') return [p.new, ...prev];
          if (p.eventType === 'UPDATE') return prev.map(o => o.id === p.new.id ? p.new : o);
          return prev;
        });
      }).subscribe();
    channelsRef.current.push(ch);
  }

  function subscribeToCustomerNotifications(userId) {
    const ch = supabase.channel(`cust-notif-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (p) => {
        setNotificationBell(prev => [p.new, ...prev]);
      }).subscribe();
    channelsRef.current.push(ch);
  }

  function subscribeToActiveOrders() {
    const ch = supabase.channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (p) => {
        setOrders(prev => {
          if (p.eventType === 'INSERT') return [p.new, ...prev];
          if (p.eventType === 'UPDATE') return prev.map(o => o.id === p.new.id ? p.new : o);
          return prev;
        });
      }).subscribe();
    channelsRef.current.push(ch);
  }

  // ─────────────────────────────────────────────────────────
  // SECTION: Data Operations (All use Supabase DB)
  // ─────────────────────────────────────────────────────────
  const fetchCustomerOrders = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setOrders(data);
    }
  }, []);

  const fetchOrdersPage = useCallback(async (page = 1, statusFilter = null) => {
    const { data, error } = await supabase.rpc('get_orders_paginated', { p_page: page, p_limit: PAGE_SIZE, p_status: statusFilter });
    if (!error) { setOrders(data || []); setOrdersTotal(data?.[0]?.total_count || 0); setOrdersPage(page); }
  }, []);

  const fetchOrderDetails = async (id) => {
    const { data, error } = await supabase.from('orders').select('*, customers(*)').eq('id', id).maybeSingle();
    return { data, error };
  };

  const updateOrderStatus = async (id, status) => {
    const { data, error } = await supabase.from('orders').update({ order_status: status }).eq('id', id).select().maybeSingle();
    return { data, error };
  };

  const createOrder = async (orderData) => {
    const limit = await checkOrderCreationLimit(orderData.customer_id);
    if (!limit.allowed) throw new Error(limit.reason);
    
    // Default status should be enum compliant
    const finalData = {
      ...orderData,
      order_status: 'Order Confirmed',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('orders').insert(finalData).select().single();
    return { data, error };
  };

  const fetchCustomersPage = useCallback(async (page = 1, search = '') => {
    let query = supabase.from('customers').select('*', { count: 'exact' });
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, error, count } = await query.range((page-1)*PAGE_SIZE, page*PAGE_SIZE-1).order('created_at', { ascending: false });
    if (!error) { setCustomers(data || []); setCustomersTotal(count || 0); setCustomersPage(page); }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    const now = Date.now();
    if (dashboardCacheRef.current.data && (now - dashboardCacheRef.current.lastFetched < 30000)) {
      setDashboardStats(dashboardCacheRef.current.data);
      return;
    }
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (!error) {
      setDashboardStats(data);
      dashboardCacheRef.current = { data, lastFetched: now };
    }
  }, []);

  const updateSettings = async (newSettings) => {
    // Local state update first
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Future: sync to DB
    return { success: true };
  };

  const value = {
    currentCustomer,
    currentAdmin,
    userRole,
    authLoading,
    orders,
    customers,
    notifications,
    settings,
    ordersPage,
    ordersTotal,
    customersPage,
    customersTotal,
    dashboardStats,
    notificationBell,
    loginCustomerEmail,
    registerCustomer,
    loginWithGoogle,
    resendVerificationEmail,
    loginWithPhone,
    verifyOtp,
    loginAdmin,
    logoutCustomer,
    logoutAdmin,
    fetchCustomerOrders,
    fetchOrdersPage,
    fetchOrderDetails,
    updateOrderStatus,
    createOrder,
    fetchCustomersPage,
    fetchDashboardStats,
    updateSettings,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};
