/**
 * ProtectedRoute — RBAC Guard
 * Quick Dry Cleaning POS
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePOS } from '../context/POSContext';
import { hasRoleSync } from '../utils/rbac';

const ProtectedRoute = ({
  children,
  role        = null,   // minimum role for POS routes e.g. 'staff'
  customerOnly = false, // true = any logged-in user (customer or admin)
  adminOnly    = false, // true = only admin/manager/staff
}) => {
  const { userRole, authLoading } = usePOS();

  // Show spinner while Firebase resolves auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Any logged-in user (customer or admin can view customer pages)
  if (customerOnly) {
    if (!userRole) return <Navigate to="/login" replace />;
    return children;
  }

  // Admin-only flag
  if (adminOnly) {
    if (userRole !== 'admin') return <Navigate to="/pos/login" replace />;
    return children;
  }

  // Role-based POS access
  if (role) {
    if (!userRole) return <Navigate to="/pos/login" replace />;
    if (!hasRoleSync(userRole, role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="bg-white p-12 rounded-3xl shadow-lg text-center max-w-md">
            <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">block</span>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
            <p className="text-slate-500">
              You need <strong>{role}</strong> privileges to view this page.
              Your current role is <strong>{userRole}</strong>.
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
