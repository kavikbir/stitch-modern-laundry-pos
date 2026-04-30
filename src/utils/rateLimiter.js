/**
 * Rate Limiter — Production Grade
 * Quick Dry Cleaning POS
 *
 * - OTP: max 3/min, 10/hour (via Supabase)
 * - Login: max 5 attempts then 15-min lockout (localStorage)
 * - Order creation: max 10/min per user
 */

import { supabase } from '../supabase';

// ─── In-Memory Store (per session) ──────────────────────
const memoryStore = new Map();

function getEntry(key) {
  return memoryStore.get(key) || { count: 0, windowStart: Date.now() };
}

function setEntry(key, entry) {
  memoryStore.set(key, entry);
}

// ─── Generic In-Memory Rate Limiter ──────────────────────
function checkMemoryLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = getEntry(key);

  if (now - entry.windowStart > windowMs) {
    // Reset window
    setEntry(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSeconds: retryAfter, remaining: 0 };
  }

  entry.count += 1;
  setEntry(key, entry);
  return { allowed: true, remaining: maxRequests - entry.count };
}

// ─── OTP Rate Limiter (Supabase-backed) ──────────────────
export async function checkOTPRateLimit(phone) {
  try {
    const { data, error } = await supabase
      .rpc('check_otp_rate_limit', { p_phone: phone });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[RateLimit] OTP check failed, using fallback:', err.message);
    // Fallback to in-memory if DB unavailable
    const result = checkMemoryLimit(`otp:${phone}`, 3, 60 * 1000);
    return {
      allowed: result.allowed,
      reason: result.allowed ? null : 'Too many OTP requests. Please wait.',
    };
  }
}

// ─── Login Rate Limiter (localStorage-backed) ────────────
const LOGIN_MAX = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(email) {
  const key = `login_limit:${email.toLowerCase()}`;
  try {
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { count: 0, lockedUntil: null };

    // Check if currently locked out
    if (data.lockedUntil && Date.now() < data.lockedUntil) {
      const remaining = Math.ceil((data.lockedUntil - Date.now()) / 60000);
      return {
        allowed: false,
        reason: `Too many failed logins. Try again in ${remaining} minute(s).`,
      };
    }

    // Reset if lockout expired
    if (data.lockedUntil && Date.now() >= data.lockedUntil) {
      localStorage.removeItem(key);
      return { allowed: true };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordFailedLogin(email) {
  const key = `login_limit:${email.toLowerCase()}`;
  try {
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { count: 0, lockedUntil: null };

    data.count = (data.count || 0) + 1;

    if (data.count >= LOGIN_MAX) {
      data.lockedUntil = Date.now() + LOGIN_LOCKOUT_MS;
    }

    localStorage.setItem(key, JSON.stringify(data));
    return data.count;
  } catch {
    return 0;
  }
}

export function clearLoginAttempts(email) {
  const key = `login_limit:${email.toLowerCase()}`;
  try {
    localStorage.removeItem(key);
  } catch {}
}

// ─── Order Creation Rate Limiter ─────────────────────────
export function checkOrderCreationLimit(userId) {
  const result = checkMemoryLimit(`order:${userId}`, 10, 60 * 1000);
  return {
    allowed: result.allowed,
    reason: result.allowed ? null : 'Too many orders created. Please wait 1 minute.',
  };
}

// ─── Global API Rate Limiter (for any action) ────────────
export function checkGlobalRateLimit(key, maxRequests = 20, windowMs = 60000) {
  const result = checkMemoryLimit(key, maxRequests, windowMs);
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    reason: result.allowed ? null : 'Rate limit exceeded. Please slow down.',
  };
}
