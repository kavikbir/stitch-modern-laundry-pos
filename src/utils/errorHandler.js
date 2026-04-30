/**
 * Error Handler — Production Grade
 * Quick Dry Cleaning POS
 *
 * Centralized error handling with retry logic,
 * user-friendly messages, and automatic logging.
 */

import Logger from './logger';

// ─── Supabase Auth Error Messages ──────────────────────────
const SUPABASE_AUTH_ERRORS = {
  'Invalid login credentials':    'Incorrect email or password. Please try again.',
  'User not found':               'No account found with this email.',
  'Email not confirmed':          'Please confirm your email address before logging in.',
  'User already registered':      'An account with this email already exists.',
  'Password is too short':        'Password must be at least 6 characters.',
  'Too many requests':            'Too many attempts. Please wait and try again.',
};

// ─── Supabase PostgreSQL errors ───────────────────────────
const SUPABASE_DB_ERRORS = {
  '23505': 'This record already exists.',
  '23503': 'Related record not found.',
  '42501': 'You do not have permission to perform this action.',
  'PGRST116': 'Record not found.',
};

// ─── Parse Any Error into User-Friendly Message ───────────
export function parseError(error) {
  if (!error) return 'An unexpected error occurred.';

  const message = error.message || '';

  // Auth errors (often just messages in Supabase)
  for (const [key, val] of Object.entries(SUPABASE_AUTH_ERRORS)) {
    if (message.includes(key)) return val;
  }

  // Supabase PostgreSQL errors
  if (error.code && SUPABASE_DB_ERRORS[error.code]) {
    return SUPABASE_DB_ERRORS[error.code];
  }

  // Supabase hint/message
  if (message) {
    if (message.includes('JWT')) return 'Session expired. Please log in again.';
    if (message.includes('network')) return 'Network error. Please check your connection.';
    if (message.includes('duplicate')) return 'This record already exists.';
    if (message.includes('permission')) return 'You do not have permission for this action.';
    return message;
  }

  return 'An unexpected error occurred. Please try again.';
}

// ─── Retry Logic ─────────────────────────────────────────
export async function withRetry(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Don't retry auth errors or permission errors
      const message = err.message || '';
      if (Object.keys(SUPABASE_AUTH_ERRORS).some(k => message.includes(k))) throw err;
      if (err.code === '42501') throw err;

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
}

// ─── Safe Supabase Operation ──────────────────────────────
export async function safeSupabaseOp(fn, operationName = 'DB operation') {
  try {
    const result = await fn();
    if (result.error) {
      await Logger.systemError(`${operationName} failed: ${result.error.message}`, {
        code: result.error.code,
        details: result.error.details,
      });
      throw result.error;
    }
    return result.data;
  } catch (err) {
    const message = parseError(err);
    throw new Error(message);
  }
}

// ─── Handle Payment Failure ──────────────────────────────
export async function handlePaymentError(error, orderId) {
  await Logger.systemError(`Payment failed for order ${orderId}`, {
    error: error.message,
    orderId,
  });
  return parseError(error);
}

// ─── Global Error Boundary Helper ────────────────────────
export function logUnhandledError(error, context = 'Unknown') {
  Logger.systemError(`Unhandled error in ${context}: ${error.message}`, {
    stack: error.stack?.substring(0, 500),
    context,
  });
}
