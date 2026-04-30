/**
 * RBAC — Role-Based Access Control Middleware
 * Quick Dry Cleaning POS | Production Grade
 *
 * Roles: customer < staff < manager < admin
 * Usage: import { requireRole, checkUserRole } from './rbac';
 */

import { supabase } from '../supabase';
import { auth } from '../firebase';

// ─── Role Hierarchy ────────────────────────────────────────
const ROLE_HIERARCHY = {
  customer: 0,
  staff: 1,
  manager: 2,
  admin: 3,
};

// Routes accessible only by role
const PROTECTED_POS_ROUTES = [
  '/pos/dashboard',
  '/pos/orders',
  '/pos/customers',
  '/pos/settings',
  '/pos/new-order',
];

// ─── Get Current User Role from Supabase ──────────────────
export async function getCurrentUserRole() {
  const user = auth.currentUser;
  if (!user) return null;

  const { data, error } = await supabase
    .from('customers')
    .select('role, is_active, is_deleted')
    .eq('id', user.uid)
    .single();

  if (error || !data || data.is_deleted || !data.is_active) return null;
  return data.role;
}

// ─── Check if current user has minimum role ────────────────
export async function hasRole(minimumRole) {
  const role = await getCurrentUserRole();
  if (!role) return false;
  return (ROLE_HIERARCHY[role] ?? -1) >= (ROLE_HIERARCHY[minimumRole] ?? 999);
}

// ─── Synchronous check using cached role ──────────────────
export function hasRoleSync(userRole, minimumRole) {
  return (ROLE_HIERARCHY[userRole] ?? -1) >= (ROLE_HIERARCHY[minimumRole] ?? 999);
}

// ─── Check if route is accessible by role ─────────────────
export function canAccessPOS(role) {
  return hasRoleSync(role, 'staff');
}

export function canManageOrders(role) {
  return hasRoleSync(role, 'staff');
}

export function canManageCustomers(role) {
  return hasRoleSync(role, 'manager');
}

export function canChangeSettings(role) {
  return hasRoleSync(role, 'admin');
}

export function canViewReports(role) {
  return hasRoleSync(role, 'manager');
}

export function isAdmin(role) {
  return role === 'admin';
}

// ─── Admin Email Whitelist ────────────────────────────────
// Add your authorized admin emails here
const ADMIN_WHITELIST = [
  'ucss.kriatgya@gmail.com',
];

export function isWhitelistedAdmin(email) {
  if (!email) return false;
  return ADMIN_WHITELIST.some(
    (allowed) => allowed.toLowerCase() === email.toLowerCase()
  );
}

// ─── Verify Email Before Booking ─────────────────────────
// Updated for Firebase Auth
export async function isEmailVerified() {
  const user = auth.currentUser;
  if (!user) return false;
  // Google users are pre-verified
  const isSocial = user.providerData.some(p => p.providerId === 'google.com');
  return !!user.emailVerified || isSocial;
}

// ─── React Route Guard Hook ───────────────────────────────
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePOS } from '../context/POSContext';

export function useRequireRole(minimumRole) {
  const { userRole, currentAdmin } = usePOS();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === null) return; // Still loading
    if (!hasRoleSync(userRole, minimumRole)) {
      navigate('/pos/login', { replace: true });
    }
  }, [userRole, minimumRole, navigate]);

  return hasRoleSync(userRole, minimumRole);
}

export function useRequireVerification() {
  const { currentCustomer } = usePOS();
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const verified = await isEmailVerified();
      if (!verified) {
        navigate('/account', { replace: true });
      }
    };
    if (currentCustomer) check();
  }, [currentCustomer, navigate]);
}
