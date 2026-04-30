/**
 * Audit Logger — Production Grade
 * Quick Dry Cleaning POS
 *
 * Logs all admin actions, auth events, and system errors
 * to Supabase admin_logs and system_audit_logs tables.
 */

import { supabase } from '../supabase';
import { auth } from '../firebase';

// ─── Action Constants ─────────────────────────────────────
export const LOG_ACTIONS = {
  // Auth
  LOGIN:                'LOGIN',
  LOGOUT:               'LOGOUT',
  LOGIN_FAILED:         'LOGIN_FAILED',
  // Orders
  CREATE_ORDER:         'CREATE_ORDER',
  UPDATE_ORDER_STATUS:  'UPDATE_ORDER_STATUS',
  DELETE_ORDER:         'DELETE_ORDER',
  PRINT_RECEIPT:        'PRINT_RECEIPT',
  // Customers
  CREATE_CUSTOMER:      'CREATE_CUSTOMER',
  UPDATE_CUSTOMER:      'UPDATE_CUSTOMER',
  DELETE_CUSTOMER:      'DELETE_CUSTOMER',
  // Payments
  RECORD_PAYMENT:       'RECORD_PAYMENT',
  REFUND_PAYMENT:       'REFUND_PAYMENT',
  // Settings
  UPDATE_SETTINGS:      'UPDATE_SETTINGS',
  // System
  SEED_DATA:            'SEED_DATA',
  EXPORT_DATA:          'EXPORT_DATA',
};

// ─── Core Admin Log ──────────────────────────────────────
export async function logAdminAction({
  action,
  targetType = null,
  targetId   = null,
  oldValue   = null,
  newValue   = null,
}) {
  try {
    const user = auth.currentUser;
    const adminId = user?.uid || 'system';
    const adminEmail = user?.email || 'unknown';

    await supabase.from('admin_logs').insert({
      admin_id:    adminId,
      admin_email: adminEmail,
      action,
      target_type: targetType,
      target_id:   targetId   ? String(targetId)   : null,
      old_value:   oldValue   ? JSON.parse(JSON.stringify(oldValue)) : null,
      new_value:   newValue   ? JSON.parse(JSON.stringify(newValue)) : null,
    });
  } catch (err) {
    // Logging should never crash the app
    console.warn('[Logger] Failed to write admin log:', err.message);
  }
}

// ─── System Audit Log (Critical Events) ──────────────────
export async function logSystemEvent({
  eventType,
  severity = 'INFO',
  message,
  metadata = null,
}) {
  try {
    const user = auth.currentUser;
    await supabase.from('system_audit_logs').insert({
      event_type: eventType,
      severity,
      message,
      user_id:    user?.uid || null,
      metadata:   metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    });
  } catch (err) {
    console.warn('[Logger] Failed to write system log:', err.message);
  }
}

// ─── Convenience Wrappers ────────────────────────────────
export const Logger = {

  login(email) {
    return Promise.all([
      logAdminAction({ action: LOG_ACTIONS.LOGIN }),
      logSystemEvent({ eventType: 'AUTH', severity: 'INFO', message: `Admin login: ${email}` }),
    ]);
  },

  logout() {
    return logAdminAction({ action: LOG_ACTIONS.LOGOUT });
  },

  loginFailed(email) {
    return logSystemEvent({
      eventType: 'SECURITY',
      severity: 'WARNING',
      message: `Failed login attempt for: ${email}`,
      metadata: { email },
    });
  },

  createOrder(orderId, orderData) {
    return logAdminAction({
      action:     LOG_ACTIONS.CREATE_ORDER,
      targetType: 'order',
      targetId:   orderId,
      newValue:   orderData,
    });
  },

  updateOrderStatus(orderId, oldStatus, newStatus) {
    return logAdminAction({
      action:     LOG_ACTIONS.UPDATE_ORDER_STATUS,
      targetType: 'order',
      targetId:   orderId,
      oldValue:   { status: oldStatus },
      newValue:   { status: newStatus },
    });
  },

  deleteOrder(orderId) {
    return logAdminAction({
      action:     LOG_ACTIONS.DELETE_ORDER,
      targetType: 'order',
      targetId:   orderId,
    });
  },

  printReceipt(orderId) {
    return logAdminAction({
      action:     LOG_ACTIONS.PRINT_RECEIPT,
      targetType: 'order',
      targetId:   orderId,
    });
  },

  createCustomer(customerId) {
    return logAdminAction({
      action:     LOG_ACTIONS.CREATE_CUSTOMER,
      targetType: 'customer',
      targetId:   customerId,
    });
  },

  deleteCustomer(customerId) {
    return logAdminAction({
      action:     LOG_ACTIONS.DELETE_CUSTOMER,
      targetType: 'customer',
      targetId:   customerId,
    });
  },

  recordPayment(orderId, amount, method) {
    return logAdminAction({
      action:     LOG_ACTIONS.RECORD_PAYMENT,
      targetType: 'payment',
      targetId:   orderId,
      newValue:   { amount, method },
    });
  },

  updateSettings(oldSettings, newSettings) {
    return logAdminAction({
      action:     LOG_ACTIONS.UPDATE_SETTINGS,
      targetType: 'settings',
      targetId:   '1',
      oldValue:   oldSettings,
      newValue:   newSettings,
    });
  },

  systemError(message, metadata = null) {
    return logSystemEvent({
      eventType: 'ERROR',
      severity:  'ERROR',
      message,
      metadata,
    });
  },

  securityEvent(message, metadata = null) {
    return logSystemEvent({
      eventType: 'SECURITY',
      severity:  'CRITICAL',
      message,
      metadata,
    });
  },
};

export default Logger;
