import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { auth, googleProvider } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
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

export const ORDER_STATUSES = [
  'Order Confirmed', 
  'Picked Up', 
  'In Cleaning', 
  'Final Finishing', 
  'Final Inspection', 
  'Ready for Dispatch', 
  'Out for Delivery', 
  'Completed & Delivered', 
  'Cancelled'
];

const PAGE_SIZE = 20;
const CACHE_TTL_MS = 8000;

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
          console.error('[Auth] Supabase sync error:', syncErr.message, syncErr.details);
          // Use a local fallback so the app still works
          profile = profile || {
            id: user.uid,
            name: user.displayName || user.email,
            email: user.email,
            role: isWhitelisted ? 'admin' : 'customer',
            is_verified: user.emailVerified || isWhitelisted,
          };
        } else {
          profile = synced;
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

  /** Google Sign-In — uses popup (works in all environments) */
  const loginWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider);
    return user;
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

  const fetchCustomersPage = useCallback(async (page = 1) => {
    const from = (page - 1) * PAGE_SIZE;
    const { data, count, error } = await supabase.from('customers')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false)
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (!error) { setCustomers(data || []); setCustomersTotal(count || 0); setCustomersPage(page); }
  }, []);

  const fetchOrderLogs = useCallback(async (orderId) => {
    const { data, error } = await supabase
      .from('order_status_logs')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, timeline: data.map(l => ({ status: l.new_status, time: l.created_at, by: l.updated_by_name || 'System' })) } : o));
    }
  }, []);

  const fetchOrderById = useCallback(async (id) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('[POS] fetchOrderById error:', error);
      throw error;
    }
    
    if (data) {
      setOrders(prev => {
        const exists = prev.find(o => o.id === id);
        if (exists) return prev.map(o => o.id === id ? { ...o, ...data } : o);
        return [data, ...prev];
      });
      return data;
    }
    return null;
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    const now = Date.now();
    if (dashboardCacheRef.current.data && now - dashboardCacheRef.current.lastFetched < CACHE_TTL_MS) {
      setDashboardStats(dashboardCacheRef.current.data); return;
    }
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (!error) { dashboardCacheRef.current = { data, lastFetched: now }; setDashboardStats(data); }
  }, []);

  useEffect(() => {
    if (currentAdmin) {
      fetchDashboardStats();
      const i = setInterval(fetchDashboardStats, CACHE_TTL_MS);
      return () => clearInterval(i);
    }
  }, [currentAdmin, fetchDashboardStats]);

  const createOrder = async (orderData) => {
    // Use Firebase current user (NOT Supabase auth)
    const user = auth.currentUser;
    if (!user) throw new Error('Not logged in.');

    const limit = checkOrderCreationLimit(user.uid);
    if (!limit.allowed) throw new Error(limit.reason);

    const order = {
      ...orderData,
      customer_id: user.uid,
      status: 'Order Confirmed',
      payment_status: 'Pending',
      created_at: new Date().toISOString(),
    };
    console.log('[POS] Creating order:', order);
    return await withRetry(async () => {
      const { data, error } = await supabase.from('orders').insert(order).select().single();
      if (error) throw error;
      await Logger.createOrder(data.id, order).catch(() => {});
      return data;
    });
  };

  const updateOrderStatus = async (orderId, newStatus, updatedByName = '') => {
    // 1. Ensure we have the target order data
    let order = orders.find(o => o.id === orderId);
    if (!order) order = await fetchOrderById(orderId);
    
    return await withRetry(async () => {
      // 2. Perform the update (use maybeSingle to avoid 406/PGRST116 errors)
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Order record not found in database.');
      
      // 3. Optimistic Update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));

      // 4. Record the log entry (best effort)
      await supabase.from('order_status_logs').insert({
        order_id: orderId,
        old_status: order?.status || 'Unknown',
        new_status: newStatus,
        updated_by: currentAdmin?.id,
        updated_by_name: updatedByName || currentAdmin?.name || 'Admin',
      }).catch(err => console.warn('[POS] Log failed:', err));

      await Logger.updateOrderStatus(orderId, order?.status, newStatus).catch(() => {});
      return data;
    });
  };

  const recordPayment = async (orderId, method) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      // If not in cache, try fetching first (for direct navigation)
      const freshOrder = await fetchOrderById(orderId);
      if (!freshOrder) throw new Error('Order not found');
    }
    
    const targetOrder = order || orders.find(o => o.id === orderId);

    const payData = {
      order_id: orderId,
      customer_id: targetOrder.customer_id,
      amount: targetOrder.total,
      method: method,
      status: 'Completed',
      created_at: new Date().toISOString()
    };

    return await withRetry(async () => {
      const data = await safeSupabaseOp(() =>
        supabase.from('payments').insert(payData).select().single(),
        'Record Payment'
      );

      // Update local order state to reflected Paid status
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: 'Paid', payment_method: method } : o));
      
      await Logger.recordPayment(payData.order_id, payData.amount, payData.method).catch(() => {});
      return data;
    });
  };

  const addCustomer = async (custData) => {
    const newId = 'MAN-' + Math.random().toString(36).substr(2, 9);
    const customer = {
      ...custData,
      id: newId,
      role: 'customer',
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('customers').insert(customer).select().single();
    if (error) throw error;
    setCustomers(prev => [data, ...prev]);
    return data;
  };

  const updateCustomer = async (customerId, updatedData) => {
    const { data, error } = await supabase.from('customers').update(updatedData).eq('id', customerId).select().single();
    if (error) throw error;
    setCustomers(prev => prev.map(c => c.id === customerId ? data : c));
    return data;
  };

  const updateSettings = async (newSettings) => {
    await safeSupabaseOp(() => supabase.from('settings').update(newSettings).eq('id', 1), 'Update Settings');
    setSettings(newSettings);
    addNotification('Settings Saved', 'System configurations updated.');
  };

  const addNotification = (title, message, type = 'info') => {
    setNotificationBell(prev => [{ id: Date.now(), title, message, type, is_read: false }, ...prev.slice(0, 19)]);
  };

  const markNotificationRead = async (id) => {
    setNotificationBell(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    if (typeof id === 'string') await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const seedTestData = async () => {
    addNotification('Seed Started', 'Generating realistic test data...', 'info');
    
    try {
      // 1. Generate Dummy Customers
      const dummyCusts = Array.from({ length: 15 }).map((_, i) => ({
        id: 'SEED-CUST-' + Math.random().toString(36).substr(2, 9),
        name: ['Rajesh Kumar', 'Anita Singh', 'Kritagya K.', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Rao', 'Sonia Gupta'][i % 8] + ' ' + (i + 1),
        phone: '98765' + Math.floor(10000 + Math.random() * 90000),
        email: `testuser${i}@example.com`,
        role: 'customer',
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      await supabase.from('customers').insert(dummyCusts);

      // 2. Generate Dummy Orders
      const statuses = [
        'Order Confirmed', 
        'Pickup Completed', 
        'Cleaning & Care', 
        'Expert Pressing', 
        'Final Inspection', 
        'Ready for Delivery', 
        'Dispatched', 
        'Order Delivered'
      ];
      const dummyOrders = Array.from({ length: 30 }).map((_, i) => {
        const cust = dummyCusts[Math.floor(Math.random() * dummyCusts.length)];
        const orderDate = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000);
        return {
          customer_id: cust.id,
          customer_name: cust.name,
          customer_phone: cust.phone,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          payment_status: Math.random() > 0.3 ? 'Paid' : 'Pending',
          total: Math.floor(200 + Math.random() * 1500),
          items: [{ service: 'Wash & Fold', quantity: 2, weight: 5 }],
          created_at: orderDate.toISOString()
        };
      });

      await supabase.from('orders').insert(dummyOrders);
      
      addNotification('Seed Success', '30 test orders and 15 customers added!', 'success');
      fetchOrdersPage(1);
      fetchCustomersPage(1);
      fetchDashboardStats();
    } catch (err) {
      console.error('[Seed] Error:', err);
      addNotification('Seed Failed', err.message, 'error');
    }
  };

  // ─────────────────────────────────────────────────────────
  // SECTION: Context Value
  // ─────────────────────────────────────────────────────────
  const value = {
    currentCustomer, currentAdmin, userRole, authLoading,
    orders, customers, notifications: notificationBell, settings, stats: dashboardStats,
    ordersPage, ordersTotal, customersPage, customersTotal, pageSize: PAGE_SIZE,
    fetchOrdersPage, fetchCustomersPage,
    loginCustomerEmail, registerCustomer, loginWithGoogle, loginWithPhone, verifyOtp,
    loginAdmin, logoutAdmin, logoutCustomer,
    createOrder, updateOrderStatus, recordPayment, processPayment: recordPayment, updateSettings,
    addCustomer, updateCustomer,
    addNotification, markNotificationRead, seedTestData, fetchDashboardStats, fetchOrderLogs, fetchCustomerOrders, fetchOrderById
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};
