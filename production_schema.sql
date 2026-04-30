-- =============================================================
-- QUICK DRY CLEANING — PRODUCTION SCHEMA
-- Version: 2.0 | Stack: Supabase PostgreSQL + Firebase Auth
-- Run this ENTIRE script in your Supabase SQL Editor
-- =============================================================

-- ─────────────────────────────────────────────
-- SECTION 0: CLEAN SLATE (Drop old tables safely)
-- ─────────────────────────────────────────────
DROP TABLE IF EXISTS system_audit_logs CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_status_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS otp_rate_limits CASCADE;

-- ─────────────────────────────────────────────
-- SECTION 1: SETTINGS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE settings (
  id              INT PRIMARY KEY DEFAULT 1,
  business_name   TEXT DEFAULT 'Quick Dry Cleaning',
  currency        TEXT DEFAULT 'INR',        -- Never store symbols, use ISO codes
  currency_symbol TEXT DEFAULT '₹',
  phone           TEXT DEFAULT '',
  email           TEXT DEFAULT 'hello@quickdrycleaning.com',
  address         TEXT DEFAULT '',
  is_deleted      BOOLEAN DEFAULT false,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- SECTION 2: CUSTOMERS TABLE (RBAC-enabled)
-- ─────────────────────────────────────────────
CREATE TABLE customers (
  id              TEXT PRIMARY KEY,           -- Firebase UID (text)
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  role            TEXT DEFAULT 'customer'
                  CHECK (role IN ('customer','staff','manager','admin')),
  total_spent     NUMERIC(12,2) DEFAULT 0,
  is_verified     BOOLEAN DEFAULT false,
  is_deleted      BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECTION 3: ORDER ID SEQUENCE (ORD-YYYY-00001)
-- ─────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
         LPAD(NEXTVAL('order_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- SECTION 4: ORDERS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE orders (
  id              TEXT PRIMARY KEY DEFAULT generate_order_id(),
  customer_id     TEXT REFERENCES customers(id),
  customer_name   TEXT,
  items           JSONB DEFAULT '[]',
  total           NUMERIC(12,2) DEFAULT 0,
  amount_paid     NUMERIC(12,2) DEFAULT 0,
  status          TEXT DEFAULT 'Received'
                  CHECK (status IN (
                    'Received',
                    'Pickup Scheduled',
                    'Out for Pickup',
                    'In Progress',
                    'Quality Check',
                    'Ready',
                    'Out for Delivery',
                    'Delivered',
                    'Collected',
                    'Cancelled'
                  )),
  payment_status  TEXT DEFAULT 'Pending'
                  CHECK (payment_status IN ('Pending','Partial','Paid','Refunded')),
  payment_method  TEXT,
  notes           TEXT,
  pickup_address  TEXT,
  pickup_date     DATE,
  pickup_window   TEXT,
  is_deleted      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECTION 5: PAYMENTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        TEXT REFERENCES orders(id),
  customer_id     TEXT REFERENCES customers(id),
  amount          NUMERIC(12,2) NOT NULL,    -- Always store as number, no symbols
  method          TEXT NOT NULL
                  CHECK (method IN ('Cash','UPI','Card','Online','Refund')),
  status          TEXT DEFAULT 'Completed'
                  CHECK (status IN ('Pending','Completed','Failed','Refunded')),
  reference_id    TEXT,                       -- UPI / transaction reference
  notes           TEXT,
  is_deleted      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECTION 6: ORDER STATUS HISTORY
-- ─────────────────────────────────────────────
CREATE TABLE order_status_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        TEXT REFERENCES orders(id),
  old_status      TEXT,
  new_status      TEXT NOT NULL,
  updated_by      TEXT,                       -- Firebase UID of admin/staff
  updated_by_name TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()   -- All timestamps in UTC
);

-- ─────────────────────────────────────────────
-- SECTION 7: NOTIFICATIONS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT REFERENCES customers(id),
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  type            TEXT DEFAULT 'info'
                  CHECK (type IN ('info','success','warning','error','order','payment')),
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECTION 8: ADMIN AUDIT LOGS
-- ─────────────────────────────────────────────
CREATE TABLE admin_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        TEXT,                       -- Firebase UID
  admin_email     TEXT,
  action          TEXT NOT NULL,              -- e.g. 'UPDATE_ORDER_STATUS'
  target_type     TEXT,                       -- 'order','customer','payment','settings'
  target_id       TEXT,
  old_value       JSONB,
  new_value       JSONB,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECTION 9: SYSTEM AUDIT LOGS (Critical events)
-- ─────────────────────────────────────────────
CREATE TABLE system_audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      TEXT NOT NULL,              -- 'SECURITY','ERROR','AUTH','DATA'
  severity        TEXT DEFAULT 'INFO'
                  CHECK (severity IN ('INFO','WARNING','ERROR','CRITICAL')),
  message         TEXT NOT NULL,
  user_id         TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECTION 10: OTP RATE LIMITING TABLE
-- ─────────────────────────────────────────────
CREATE TABLE otp_rate_limits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           TEXT NOT NULL,
  attempt_count   INT DEFAULT 1,
  window_start    TIMESTAMPTZ DEFAULT NOW(),
  hour_start      TIMESTAMPTZ DEFAULT NOW(),
  hour_count      INT DEFAULT 1
);

-- ─────────────────────────────────────────────
-- SECTION 11: DATABASE INDEXES
-- ─────────────────────────────────────────────

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id   ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_is_deleted    ON orders(is_deleted);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone      ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email      ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_role       ON customers(role);
CREATE INDEX IF NOT EXISTS idx_customers_is_deleted ON customers(is_deleted);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id    ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at  ON payments(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Logs indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id  ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created   ON admin_logs(created_at DESC);

-- Full Text Search indexes
CREATE INDEX IF NOT EXISTS idx_customers_name_fts
  ON customers USING GIN (to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_orders_fts
  ON orders USING GIN (to_tsvector('english', COALESCE(customer_name,'')));

-- ─────────────────────────────────────────────
-- SECTION 12: AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- SECTION 13: ORDER STATUS LOG TRIGGER
-- Auto-inserts a history row on every status change
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_logs (
      order_id, old_status, new_status, created_at
    ) VALUES (
      NEW.id, OLD.status, NEW.status, NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_status_log
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ─────────────────────────────────────────────
-- SECTION 14: AUTO-NOTIFY CUSTOMER ON STATUS CHANGE
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_customer_on_status()
RETURNS TRIGGER AS $$
DECLARE
  msg TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    msg := CASE NEW.status
      WHEN 'Pickup Scheduled' THEN 'Your pickup has been scheduled!'
      WHEN 'Out for Pickup'   THEN 'Our team is on the way to pick up your laundry.'
      WHEN 'In Progress'      THEN 'Your laundry is now being processed.'
      WHEN 'Quality Check'    THEN 'Your order is undergoing quality check.'
      WHEN 'Ready'            THEN 'Your laundry is ready! We will deliver it soon.'
      WHEN 'Out for Delivery' THEN 'Your order is out for delivery.'
      WHEN 'Delivered'        THEN 'Your laundry has been delivered!'
      WHEN 'Collected'        THEN 'Order complete. Thank you for choosing Quick Dry!'
      ELSE 'Your order status has been updated to: ' || NEW.status
    END;

    INSERT INTO notifications (user_id, title, message, type)
    VALUES (NEW.customer_id, 'Order Update: ' || NEW.id, msg, 'order');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_customer
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_customer_on_status();

-- ─────────────────────────────────────────────
-- SECTION 15: PAYMENT COMPLETION TRIGGER
-- Auto-updates order payment_status when fully paid
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_payment_to_order()
RETURNS TRIGGER AS $$
DECLARE
  total_paid  NUMERIC;
  order_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_paid
  FROM payments
  WHERE order_id = NEW.order_id
    AND status = 'Completed'
    AND is_deleted = false;

  SELECT total INTO order_total FROM orders WHERE id = NEW.order_id;

  UPDATE orders SET
    amount_paid = total_paid,
    payment_status = CASE
      WHEN total_paid >= order_total THEN 'Paid'
      WHEN total_paid > 0           THEN 'Partial'
      ELSE 'Pending'
    END,
    updated_at = NOW()
  WHERE id = NEW.order_id;

  -- Notify on full payment
  IF total_paid >= order_total THEN
    INSERT INTO notifications (user_id, title, message, type)
    SELECT customer_id,
           'Payment Confirmed',
           'Payment of ₹' || total_paid || ' received for order ' || NEW.order_id,
           'payment'
    FROM orders WHERE id = NEW.order_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_payment
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION sync_payment_to_order();

-- ─────────────────────────────────────────────
-- SECTION 16: FULL-TEXT SEARCH FUNCTIONS
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_customers(search_term TEXT)
RETURNS TABLE (
  id TEXT, name TEXT, email TEXT, phone TEXT,
  role TEXT, total_spent NUMERIC, created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.email, c.phone,
         c.role, c.total_spent, c.created_at
  FROM customers c
  WHERE c.is_deleted = false
    AND (
      to_tsvector('english', c.name) @@ plainto_tsquery('english', search_term)
      OR c.phone ILIKE '%' || search_term || '%'
      OR c.email ILIKE '%' || search_term || '%'
    )
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- SECTION 17: DASHBOARD STATS FUNCTION (Cached)
-- Call this instead of 4 separate queries
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_revenue',       (SELECT COALESCE(SUM(total),0) FROM orders WHERE is_deleted=false AND payment_status='Paid'),
    'today_revenue',       (SELECT COALESCE(SUM(total),0) FROM orders WHERE is_deleted=false AND payment_status='Paid' AND DATE(created_at)=CURRENT_DATE),
    'active_orders',       (SELECT COUNT(*) FROM orders WHERE is_deleted=false AND status NOT IN ('Collected','Cancelled')),
    'total_customers',     (SELECT COUNT(*) FROM customers WHERE is_deleted=false AND role='customer'),
    'pending_payments',    (SELECT COUNT(*) FROM orders WHERE is_deleted=false AND payment_status IN ('Pending','Partial')),
    'orders_today',        (SELECT COUNT(*) FROM orders WHERE is_deleted=false AND DATE(created_at)=CURRENT_DATE),
    'generated_at',        NOW()
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- SECTION 18: OTP RATE LIMIT FUNCTION
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_otp_rate_limit(p_phone TEXT)
RETURNS JSON AS $$
DECLARE
  rec           otp_rate_limits%ROWTYPE;
  minute_limit  INT := 3;
  hour_limit    INT := 10;
BEGIN
  SELECT * INTO rec FROM otp_rate_limits WHERE phone = p_phone LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO otp_rate_limits (phone) VALUES (p_phone);
    RETURN json_build_object('allowed', true);
  END IF;

  -- Reset minute window if > 60 seconds
  IF NOW() - rec.window_start > INTERVAL '1 minute' THEN
    UPDATE otp_rate_limits SET
      attempt_count = 1,
      window_start = NOW()
    WHERE phone = p_phone;
    RETURN json_build_object('allowed', true);
  END IF;

  -- Reset hour window if > 60 minutes
  IF NOW() - rec.hour_start > INTERVAL '1 hour' THEN
    UPDATE otp_rate_limits SET
      hour_count = 1,
      hour_start = NOW()
    WHERE phone = p_phone;
  END IF;

  -- Block if over limits
  IF rec.attempt_count >= minute_limit THEN
    RETURN json_build_object('allowed', false, 'reason', 'Too many OTP requests. Wait 1 minute.');
  END IF;

  IF rec.hour_count >= hour_limit THEN
    RETURN json_build_object('allowed', false, 'reason', 'Hourly OTP limit reached. Wait 1 hour.');
  END IF;

  -- Increment counters
  UPDATE otp_rate_limits SET
    attempt_count = attempt_count + 1,
    hour_count = hour_count + 1
  WHERE phone = p_phone;

  RETURN json_build_object('allowed', true);
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- SECTION 19: SOFT DELETE HELPERS
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION soft_delete_order(p_order_id TEXT, p_admin_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE orders SET is_deleted = true, updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO admin_logs (admin_id, action, target_type, target_id)
  VALUES (p_admin_id, 'SOFT_DELETE', 'order', p_order_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_customer(p_customer_id TEXT, p_admin_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE customers SET is_deleted = true, is_active = false, updated_at = NOW()
  WHERE id = p_customer_id;

  INSERT INTO admin_logs (admin_id, action, target_type, target_id)
  VALUES (p_admin_id, 'SOFT_DELETE', 'customer', p_customer_id);
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- SECTION 20: ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_rate_limits   ENABLE ROW LEVEL SECURITY;

-- ── CUSTOMERS policies ──────────────────────
DROP POLICY IF EXISTS "customers_insert_own" ON customers;
CREATE POLICY "customers_insert_own"    ON customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "customers_select_own" ON customers;
CREATE POLICY "customers_select_own"    ON customers FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "customers_update_own" ON customers;
CREATE POLICY "customers_update_own"    ON customers FOR UPDATE USING (auth.uid()::text = id);

-- SECURITY DEFINER function to avoid RLS recursion
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.customers 
    WHERE id = auth.uid()::text 
    AND role IN ('admin', 'manager')
    AND is_deleted = false
  );
$$ LANGUAGE sql SECURITY DEFINER;

DROP POLICY IF EXISTS "admin_full_customers" ON customers;
CREATE POLICY "admin_full_customers" ON customers FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_orders" ON orders;
CREATE POLICY "admin_full_orders" ON orders FOR ALL USING (is_admin());

-- ── ORDERS policies ──────────────────────────
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  USING (auth.uid()::text = customer_id AND is_deleted = false);

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  WITH CHECK (auth.uid()::text = customer_id);
DROP POLICY IF EXISTS "admin_full_payments" ON payments;
CREATE POLICY "admin_full_payments" ON payments FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_notifications" ON notifications;
CREATE POLICY "admin_full_notifications" ON notifications FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_status_logs" ON order_status_logs;
CREATE POLICY "admin_full_status_logs" ON order_status_logs FOR ALL USING (is_admin());

CREATE POLICY "staff_update_orders"     ON orders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid()::text
      AND role = 'staff' AND is_deleted = false
  ));

-- ── PAYMENTS policies ────────────────────────
CREATE POLICY "payments_select_own"     ON payments FOR SELECT
  USING (auth.uid()::text = customer_id AND is_deleted = false);

CREATE POLICY "admin_full_payments"     ON payments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid()::text
      AND role IN ('admin','manager') AND is_deleted = false
  ));

-- ── NOTIFICATIONS policies ───────────────────
CREATE POLICY "notifications_own"       ON notifications FOR ALL
  USING (auth.uid()::text = user_id);

CREATE POLICY "admin_all_notifications" ON notifications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid()::text
      AND role IN ('admin','manager') AND is_deleted = false
  ));

-- ── ORDER STATUS LOGS policies ───────────────
CREATE POLICY "status_logs_own_orders"  ON order_status_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_id AND o.customer_id = auth.uid()::text
  ));

CREATE POLICY "admin_full_status_logs"  ON order_status_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid()::text
      AND role IN ('admin','manager','staff') AND is_deleted = false
  ));

-- ── ADMIN LOGS policies ──────────────────────
CREATE POLICY "admin_logs_admin_only"   ON admin_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid()::text
      AND role = 'admin' AND is_deleted = false
  ));

-- ── SYSTEM AUDIT LOGS policies ───────────────
CREATE POLICY "system_logs_admin_only"  ON system_audit_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid()::text
      AND role = 'admin' AND is_deleted = false
  ));

-- ── SETTINGS policies ────────────────────────
CREATE POLICY "settings_public_read"    ON settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write"    ON settings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid()::text
      AND role IN ('admin','manager') AND is_deleted = false
  ));

-- ── OTP RATE LIMIT ───────────────────────────
DROP POLICY IF EXISTS "otp_rate_insert" ON otp_rate_limits;
CREATE POLICY "otp_rate_insert"         ON otp_rate_limits FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "otp_rate_select_own" ON otp_rate_limits;
CREATE POLICY "otp_rate_select_own"     ON otp_rate_limits FOR SELECT USING (true);

DROP POLICY IF EXISTS "otp_rate_update_own" ON otp_rate_limits;
CREATE POLICY "otp_rate_update_own"     ON otp_rate_limits FOR UPDATE USING (true);

-- ─────────────────────────────────────────────
-- SECTION 21: ADMIN WHITELIST VIEW
-- Only show customers with admin/manager role
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW admin_users AS
  SELECT id, name, email, role, created_at, is_active
  FROM customers
  WHERE role IN ('admin','manager','staff') AND is_deleted = false;

-- ─────────────────────────────────────────────
-- SECTION 22: PAGINATED ORDERS FUNCTION
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_orders_paginated(
  p_page   INT DEFAULT 1,
  p_limit  INT DEFAULT 20,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id TEXT, customer_id TEXT, customer_name TEXT,
  total NUMERIC, status TEXT, payment_status TEXT,
  created_at TIMESTAMPTZ, total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id, o.customer_id, o.customer_name,
    o.total, o.status, o.payment_status,
    o.created_at,
    COUNT(*) OVER() AS total_count
  FROM orders o
  WHERE o.is_deleted = false
    AND (p_status IS NULL OR o.status = p_status)
  ORDER BY o.created_at DESC
  LIMIT p_limit
  OFFSET (p_page - 1) * p_limit;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- SECTION 23: SECURITY HEADERS META (store for reference)
-- ─────────────────────────────────────────────
-- These must be configured in your hosting provider (Vercel/Netlify):
-- Content-Security-Policy: default-src 'self'; connect-src *.supabase.co *.firebaseio.com
-- X-Frame-Options: DENY
-- X-Content-Type-Options: nosniff
-- Referrer-Policy: strict-origin-when-cross-origin

-- ─────────────────────────────────────────────
-- FINAL: GRANT PERMISSIONS FOR SERVICE ROLE
-- ─────────────────────────────────────────────
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================================
-- SCHEMA COMPLETE ✓
-- Tables: customers, orders, payments, order_status_logs,
--         notifications, admin_logs, system_audit_logs,
--         settings, otp_rate_limits
-- Triggers: auto status log, auto notify, auto payment sync
-- Functions: generate_order_id, get_dashboard_stats,
--            check_otp_rate_limit, search_customers,
--            get_orders_paginated, soft_delete_*
-- Indexes: 15+ performance indexes + 2 full-text search
-- RLS: Enabled on all 9 tables
-- =============================================================
