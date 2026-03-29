-- ============================================================
-- TITAN-RETAIL OS — COMPLETE DATABASE SCHEMA v2.0
-- PostgreSQL + Supabase | Multi-Tenant | Financial-Grade
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'merchant', 'courier', 'customer');
CREATE TYPE plan_type AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE plan_status AS ENUM ('inactive', 'pending', 'active', 'suspended', 'cancelled');
CREATE TYPE subscription_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE payment_method AS ENUM ('vodafone_cash', 'instapay', 'bank_transfer', 'webhook');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'assigned', 'delivered', 'failed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('revenue', 'cost', 'courier_payout', 'platform_fee', 'refund', 'reward');
CREATE TYPE delivery_status AS ENUM ('pending', 'picked_up', 'in_transit', 'delivered', 'failed');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE notification_type AS ENUM ('order', 'subscription', 'referral', 'achievement', 'alert', 'system');
CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'rewarded');
CREATE TYPE reward_type AS ENUM ('free_plan', 'upgrade', 'credit', 'discount');
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT');
CREATE TYPE feature_flag_status AS ENUM ('enabled', 'disabled', 'beta');

-- SETTINGS
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    flag_status feature_flag_status DEFAULT 'enabled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

INSERT INTO settings (key, value, description) VALUES
    ('auto_activation', '{"enabled": false}', 'Skip WhatsApp and auto-approve via webhook'),
    ('referral_threshold', '{"count": 3}', 'Referrals needed to trigger auto-reward'),
    ('platform_fee_percent', '{"value": 5}', 'Platform fee % per order'),
    ('max_order_items', '{"value": 50}', 'Maximum items per order'),
    ('maintenance_mode', '{"enabled": false}', 'Global maintenance mode'),
    ('ai_ads_enabled', '{"enabled": true}', 'Enable AI Ad Generator'),
    ('tax_rate', '{"value": 14}', 'Default VAT tax rate %');

-- TENANTS
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID,
    current_plan plan_type DEFAULT 'starter',
    plan_status plan_status DEFAULT 'inactive',
    plan_expires_at TIMESTAMPTZ,
    referral_code TEXT NOT NULL UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
    referred_by UUID REFERENCES tenants(id),
    logo_url TEXT,
    domain TEXT,
    phone TEXT,
    address JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_owner ON tenants(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_plan_status ON tenants(plan_status);

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_users_tenant ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan plan_type NOT NULL,
    status plan_status NOT NULL DEFAULT 'inactive',
    payment_method payment_method,
    amount_paid NUMERIC(12,2),
    currency TEXT DEFAULT 'EGP',
    started_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    renewed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    idempotency_key TEXT UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at);

-- SUBSCRIPTION REQUESTS
CREATE TABLE subscription_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    plan plan_type NOT NULL,
    payment_method payment_method NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    status subscription_request_status NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    whatsapp_link TEXT,
    idempotency_key TEXT UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sub_requests_tenant ON subscription_requests(tenant_id);
CREATE INDEX idx_sub_requests_status ON subscription_requests(status);
CREATE INDEX idx_sub_requests_created ON subscription_requests(created_at DESC);

-- REFERRALS
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    referred_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    status referral_status NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(referrer_tenant_id, referred_tenant_id)
);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_tenant_id);

CREATE TABLE referral_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES referrals(id),
    reward_type reward_type NOT NULL,
    reward_value JSONB NOT NULL DEFAULT '{}',
    applied_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(12,2) CHECK (cost_price >= 0),
    tax_rate NUMERIC(5,2) DEFAULT 14,
    images JSONB DEFAULT '[]',
    attributes JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    weight_kg NUMERIC(8,3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(tenant_id, sku)
);
CREATE INDEX idx_products_tenant ON products(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);

-- INVENTORY
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, product_id)
);
CREATE INDEX idx_inventory_tenant ON inventory(tenant_id);

CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    order_id UUID,
    delta INTEGER NOT NULL,
    previous_qty INTEGER NOT NULL,
    new_qty INTEGER NOT NULL,
    reason TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_inv_logs_tenant ON inventory_logs(tenant_id);
CREATE INDEX idx_inv_logs_created ON inventory_logs(created_at DESC);

-- ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id),
    status order_status NOT NULL DEFAULT 'pending',
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    delivery_fee NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    currency TEXT DEFAULT 'EGP',
    shipping_address JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    idempotency_key TEXT UNIQUE,
    coupon_code TEXT,
    assigned_courier_id UUID REFERENCES users(id),
    confirmed_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_orders_tenant ON orders(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_courier ON orders(assigned_courier_id) WHERE assigned_courier_id IS NOT NULL;
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_snapshot JSONB NOT NULL DEFAULT '{}',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    line_total NUMERIC(12,2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_tenant ON order_items(tenant_id);

ALTER TABLE inventory_logs ADD CONSTRAINT fk_inv_logs_order FOREIGN KEY (order_id) REFERENCES orders(id);

-- DELIVERIES
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    courier_id UUID REFERENCES users(id),
    status delivery_status NOT NULL DEFAULT 'pending',
    pickup_address JSONB DEFAULT '{}',
    dropoff_address JSONB NOT NULL DEFAULT '{}',
    pickup_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_reason TEXT,
    tracking_url TEXT,
    notes TEXT,
    courier_fee NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_deliveries_tenant ON deliveries(tenant_id);
CREATE INDEX idx_deliveries_courier ON deliveries(courier_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- WALLETS
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_spent NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRANSACTIONS (IMMUTABLE)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    type transaction_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'EGP',
    description TEXT,
    reference_id TEXT,
    idempotency_key TEXT UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX idx_transactions_type ON transactions(tenant_id, type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- INVOICES (IMMUTABLE)
CREATE SEQUENCE invoice_number_seq START WITH 10000;
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id),
    invoice_number TEXT NOT NULL UNIQUE,
    snapshot JSONB NOT NULL DEFAULT '{}',
    subtotal NUMERIC(12,2) NOT NULL,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'EGP',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_at TIMESTAMPTZ
);
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- SUPPORT TICKETS
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    subject TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'open',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
    tags TEXT[] DEFAULT '{}',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tickets_tenant ON support_tickets(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- ACHIEVEMENTS
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    trigger_event TEXT NOT NULL,
    conditions JSONB NOT NULL DEFAULT '{}',
    reward JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- AUDIT LOGS (APPEND-ONLY)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    before_state JSONB,
    after_state JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- IDEMPOTENCY KEYS
CREATE TABLE idempotency_keys (
    key TEXT PRIMARY KEY,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    response_hash TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);

-- JOB QUEUE
CREATE TABLE job_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','done','failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_job_queue_status ON job_queue(status, scheduled_for) WHERE status IN ('queued','failed');

-- CACHE
CREATE TABLE cache_entries (
    key TEXT PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    value JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cache_expires ON cache_entries(expires_at);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT; BEGIN
    FOREACH t IN ARRAY ARRAY['settings','tenants','users','subscriptions','subscription_requests',
        'referrals','referral_rewards','products','inventory','orders','deliveries','support_tickets','notifications']
    LOOP EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();', t);
    END LOOP;
END $$;

-- ATOMIC RPC: create_order
CREATE OR REPLACE FUNCTION create_order(
    p_tenant_id UUID, p_customer_id UUID, p_items JSONB,
    p_shipping_address JSONB, p_delivery_fee NUMERIC,
    p_coupon_code TEXT DEFAULT NULL, p_notes TEXT DEFAULT NULL, p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_order_id UUID; v_item JSONB; v_product RECORD; v_inv RECORD;
    v_subtotal NUMERIC := 0; v_tax NUMERIC := 0; v_line_total NUMERIC; v_line_tax NUMERIC;
    v_item_discount NUMERIC; v_total NUMERIC; v_idempotency TEXT; v_invoice_num TEXT;
BEGIN
    v_idempotency := COALESCE(p_idempotency_key, gen_random_uuid()::text);
    IF EXISTS (SELECT 1 FROM idempotency_keys WHERE key = v_idempotency) THEN
        SELECT resource_id INTO v_order_id FROM idempotency_keys WHERE key = v_idempotency;
        RETURN jsonb_build_object('order_id', v_order_id, 'idempotent', true);
    END IF;
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::UUID AND tenant_id = p_tenant_id AND deleted_at IS NULL;
        IF NOT FOUND THEN RAISE EXCEPTION 'Product % not found', v_item->>'product_id'; END IF;
        SELECT * INTO v_inv FROM inventory WHERE product_id = v_product.id AND tenant_id = p_tenant_id;
        IF v_inv.quantity - v_inv.reserved_quantity < (v_item->>'quantity')::INTEGER THEN
            RAISE EXCEPTION 'Insufficient stock for %', v_product.name; END IF;
        UPDATE inventory SET reserved_quantity = reserved_quantity + (v_item->>'quantity')::INTEGER WHERE product_id = v_product.id AND tenant_id = p_tenant_id;
        v_item_discount := COALESCE((v_item->>'discount')::NUMERIC, 0);
        v_line_tax := ROUND(((v_item->>'unit_price')::NUMERIC - v_item_discount) * (v_product.tax_rate/100) * (v_item->>'quantity')::INTEGER, 2);
        v_line_total := ROUND(((v_item->>'unit_price')::NUMERIC - v_item_discount) * (v_item->>'quantity')::INTEGER, 2);
        v_subtotal := v_subtotal + v_line_total; v_tax := v_tax + v_line_tax;
    END LOOP;
    v_total := v_subtotal + v_tax + COALESCE(p_delivery_fee, 0);
    INSERT INTO orders (tenant_id,customer_id,status,subtotal,tax_amount,delivery_fee,total,shipping_address,notes,idempotency_key,coupon_code)
    VALUES (p_tenant_id,p_customer_id,'pending',v_subtotal,v_tax,COALESCE(p_delivery_fee,0),v_total,p_shipping_address,p_notes,v_idempotency,p_coupon_code) RETURNING id INTO v_order_id;
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::UUID AND tenant_id = p_tenant_id;
        v_item_discount := COALESCE((v_item->>'discount')::NUMERIC, 0);
        v_line_tax := ROUND(((v_item->>'unit_price')::NUMERIC - v_item_discount) * (v_product.tax_rate/100) * (v_item->>'quantity')::INTEGER, 2);
        v_line_total := ROUND(((v_item->>'unit_price')::NUMERIC - v_item_discount) * (v_item->>'quantity')::INTEGER, 2);
        INSERT INTO order_items (tenant_id,order_id,product_id,product_snapshot,quantity,unit_price,discount_amount,tax_amount,line_total)
        VALUES (p_tenant_id,v_order_id,v_product.id,to_jsonb(v_product),(v_item->>'quantity')::INTEGER,(v_item->>'unit_price')::NUMERIC,v_item_discount,v_line_tax,v_line_total);
        INSERT INTO inventory_logs (tenant_id,product_id,order_id,delta,previous_qty,new_qty,reason,performed_by)
        SELECT p_tenant_id,v_product.id,v_order_id,-(v_item->>'quantity')::INTEGER,quantity,quantity-(v_item->>'quantity')::INTEGER,'Order created',p_customer_id FROM inventory WHERE product_id=v_product.id AND tenant_id=p_tenant_id;
        UPDATE inventory SET quantity=quantity-(v_item->>'quantity')::INTEGER, reserved_quantity=reserved_quantity-(v_item->>'quantity')::INTEGER WHERE product_id=v_product.id AND tenant_id=p_tenant_id;
    END LOOP;
    INSERT INTO deliveries (tenant_id,order_id,dropoff_address,courier_fee) VALUES (p_tenant_id,v_order_id,p_shipping_address,COALESCE(p_delivery_fee,0));
    INSERT INTO transactions (tenant_id,order_id,type,amount,description,idempotency_key) VALUES (p_tenant_id,v_order_id,'revenue',v_total,'Order revenue','rev_'||v_idempotency);
    WITH fs AS (SELECT (value->>'value')::NUMERIC/100 AS rate FROM settings WHERE key='platform_fee_percent')
    INSERT INTO transactions (tenant_id,order_id,type,amount,description,idempotency_key) SELECT p_tenant_id,v_order_id,'platform_fee',ROUND(v_total*rate,2),'Platform fee','fee_'||v_idempotency FROM fs;
    v_invoice_num := 'INV-'||to_char(NOW(),'YYYYMMDD')||'-'||nextval('invoice_number_seq');
    INSERT INTO invoices (tenant_id,order_id,invoice_number,snapshot,subtotal,tax_amount,total)
    SELECT p_tenant_id,v_order_id,v_invoice_num,jsonb_build_object('order_id',v_order_id,'items',(SELECT jsonb_agg(to_jsonb(oi)) FROM order_items oi WHERE oi.order_id=v_order_id),'generated_at',NOW()),v_subtotal,v_tax,v_total;
    INSERT INTO idempotency_keys (key,resource_type,resource_id) VALUES (v_idempotency,'order',v_order_id);
    INSERT INTO notifications (tenant_id,user_id,type,title,body,data)
    SELECT p_tenant_id,t.owner_id,'order','New Order','Order #'||v_order_id||' needs confirmation',jsonb_build_object('order_id',v_order_id) FROM tenants t WHERE t.id=p_tenant_id;
    RETURN jsonb_build_object('order_id',v_order_id,'total',v_total,'invoice',v_invoice_num);
END; $$;

-- ATOMIC RPC: approve_subscription
CREATE OR REPLACE FUNCTION approve_subscription(p_request_id UUID, p_admin_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_req RECORD; v_sub_id UUID; v_plan_prices JSONB := '{"starter":299,"pro":599,"enterprise":1299}';
BEGIN
    SELECT * INTO v_req FROM subscription_requests WHERE id=p_request_id AND status='PENDING';
    IF NOT FOUND THEN RAISE EXCEPTION 'Request not found or already processed'; END IF;
    UPDATE subscription_requests SET status='APPROVED',approved_by=p_admin_id,approved_at=NOW() WHERE id=p_request_id;
    UPDATE tenants SET current_plan=v_req.plan,plan_status='active',plan_expires_at=NOW()+INTERVAL '30 days' WHERE id=v_req.tenant_id;
    INSERT INTO subscriptions (tenant_id,plan,status,payment_method,amount_paid,started_at,expires_at,idempotency_key)
    VALUES (v_req.tenant_id,v_req.plan,'active',v_req.payment_method,(v_plan_prices->>(v_req.plan::text))::NUMERIC,NOW(),NOW()+INTERVAL '30 days','sub_'||p_request_id)
    ON CONFLICT (idempotency_key) DO NOTHING RETURNING id INTO v_sub_id;
    INSERT INTO transactions (tenant_id,type,amount,description,idempotency_key)
    VALUES (v_req.tenant_id,'revenue',(v_plan_prices->>(v_req.plan::text))::NUMERIC,'Subscription - '||v_req.plan,'subrev_'||p_request_id);
    INSERT INTO audit_logs (performed_by,action,resource_type,resource_id,after_state)
    VALUES (p_admin_id,'APPROVE','subscription_request',p_request_id,jsonb_build_object('plan',v_req.plan,'tenant_id',v_req.tenant_id));
    INSERT INTO notifications (tenant_id,user_id,type,title,body,data)
    SELECT v_req.tenant_id,t.owner_id,'subscription','Subscription Activated!','Your '||v_req.plan||' plan is now active.',jsonb_build_object('plan',v_req.plan,'expires_at',NOW()+INTERVAL '30 days') FROM tenants t WHERE t.id=v_req.tenant_id;
    RETURN jsonb_build_object('success',true,'subscription_id',v_sub_id);
END; $$;

-- ATOMIC RPC: update_order_status
CREATE OR REPLACE FUNCTION update_order_status(p_order_id UUID, p_new_status order_status, p_performed_by UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_order RECORD;
    v_allowed JSONB := '{"pending":["confirmed","cancelled"],"confirmed":["assigned","cancelled"],"assigned":["delivered","failed"],"delivered":[],"failed":[],"cancelled":[]}';
BEGIN
    SELECT * INTO v_order FROM orders WHERE id=p_order_id AND deleted_at IS NULL;
    IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
    IF NOT (v_allowed->(v_order.status::text) @> to_jsonb(p_new_status::text)) THEN
        RAISE EXCEPTION 'Invalid transition: % → %', v_order.status, p_new_status; END IF;
    UPDATE orders SET status=p_new_status,
        confirmed_at=CASE WHEN p_new_status='confirmed' THEN NOW() ELSE confirmed_at END,
        assigned_at=CASE WHEN p_new_status='assigned' THEN NOW() ELSE assigned_at END,
        delivered_at=CASE WHEN p_new_status='delivered' THEN NOW() ELSE delivered_at END,
        cancelled_at=CASE WHEN p_new_status='cancelled' THEN NOW() ELSE cancelled_at END,
        cancellation_reason=CASE WHEN p_new_status='cancelled' THEN p_reason ELSE cancellation_reason END
    WHERE id=p_order_id;
    IF p_new_status='cancelled' THEN
        UPDATE inventory i SET quantity=quantity+oi.quantity FROM order_items oi WHERE oi.order_id=p_order_id AND oi.product_id=i.product_id;
        INSERT INTO transactions (tenant_id,order_id,type,amount,description,idempotency_key)
        SELECT v_order.tenant_id,p_order_id,'refund',v_order.total,'Cancellation refund','refund_'||p_order_id
        WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE idempotency_key='refund_'||p_order_id::text);
    END IF;
    IF p_new_status='delivered' THEN
        INSERT INTO transactions (tenant_id,order_id,type,amount,description,idempotency_key)
        SELECT v_order.tenant_id,p_order_id,'courier_payout',v_order.delivery_fee,'Courier fee','courier_'||p_order_id
        WHERE v_order.delivery_fee>0 AND NOT EXISTS (SELECT 1 FROM transactions WHERE idempotency_key='courier_'||p_order_id::text);
        UPDATE deliveries SET status='delivered',delivered_at=NOW() WHERE order_id=p_order_id;
    END IF;
    INSERT INTO audit_logs (performed_by,action,resource_type,resource_id,before_state,after_state)
    VALUES (p_performed_by,'UPDATE','order',p_order_id,jsonb_build_object('status',v_order.status),jsonb_build_object('status',p_new_status,'reason',p_reason));
    RETURN jsonb_build_object('success',true,'order_id',p_order_id,'new_status',p_new_status);
END; $$;

-- RLS
DO $$ DECLARE t TEXT; BEGIN
    FOREACH t IN ARRAY ARRAY['tenants','users','subscriptions','subscription_requests','referrals',
        'referral_rewards','products','inventory','inventory_logs','orders','order_items',
        'deliveries','wallets','transactions','invoices','support_tickets','ticket_messages',
        'notifications','achievements','user_achievements','audit_logs','settings']
    LOOP EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t); END LOOP;
END $$;

CREATE OR REPLACE FUNCTION auth_user_role() RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT role FROM users WHERE id=auth.uid() AND deleted_at IS NULL; $$;
CREATE OR REPLACE FUNCTION auth_tenant_id() RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT tenant_id FROM users WHERE id=auth.uid() AND deleted_at IS NULL; $$;

CREATE POLICY "tenant_self_read" ON tenants FOR SELECT USING (id=auth_tenant_id() OR auth_user_role()='admin');
CREATE POLICY "tenant_admin_all" ON tenants FOR ALL USING (auth_user_role()='admin');
CREATE POLICY "tenant_owner_update" ON tenants FOR UPDATE USING (owner_id=auth.uid());
CREATE POLICY "user_own_read" ON users FOR SELECT USING (id=auth.uid() OR tenant_id=auth_tenant_id() OR auth_user_role()='admin');
CREATE POLICY "user_own_update" ON users FOR UPDATE USING (id=auth.uid());
CREATE POLICY "admin_all_users" ON users FOR ALL USING (auth_user_role()='admin');
CREATE POLICY "merchant_own_products" ON products FOR ALL USING (tenant_id=auth_tenant_id() AND auth_user_role() IN ('merchant','admin'));
CREATE POLICY "customer_read_products" ON products FOR SELECT USING (is_active=TRUE AND deleted_at IS NULL);
CREATE POLICY "merchant_own_orders" ON orders FOR ALL USING (tenant_id=auth_tenant_id() AND auth_user_role() IN ('merchant','admin'));
CREATE POLICY "customer_own_orders" ON orders FOR SELECT USING (customer_id=auth.uid());
CREATE POLICY "courier_assigned_orders" ON orders FOR SELECT USING (assigned_courier_id=auth.uid() AND auth_user_role()='courier');
CREATE POLICY "merchant_own_subscriptions" ON subscriptions FOR SELECT USING (tenant_id=auth_tenant_id());
CREATE POLICY "admin_all_subscriptions" ON subscriptions FOR ALL USING (auth_user_role()='admin');
CREATE POLICY "merchant_own_requests" ON subscription_requests FOR ALL USING (tenant_id=auth_tenant_id() AND auth_user_role() IN ('merchant','admin'));
CREATE POLICY "admin_all_requests" ON subscription_requests FOR ALL USING (auth_user_role()='admin');
CREATE POLICY "merchant_own_transactions" ON transactions FOR SELECT USING (tenant_id=auth_tenant_id() AND auth_user_role() IN ('merchant','admin'));
CREATE POLICY "admin_all_transactions" ON transactions FOR SELECT USING (auth_user_role()='admin');
CREATE POLICY "courier_assigned_deliveries" ON deliveries FOR SELECT USING (courier_id=auth.uid() AND auth_user_role()='courier');
CREATE POLICY "merchant_own_deliveries" ON deliveries FOR ALL USING (tenant_id=auth_tenant_id() AND auth_user_role() IN ('merchant','admin'));
CREATE POLICY "user_own_notifications" ON notifications FOR ALL USING (user_id=auth.uid());
CREATE POLICY "admin_read_audit" ON audit_logs FOR SELECT USING (auth_user_role()='admin');
CREATE POLICY "admin_settings" ON settings FOR ALL USING (auth_user_role()='admin');
CREATE POLICY "public_read_settings" ON settings FOR SELECT USING (flag_status='enabled');

ALTER PUBLICATION supabase_realtime ADD TABLE subscription_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE tenants;
ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;

INSERT INTO achievements (key,title,description,trigger_event,conditions,reward) VALUES
    ('first_order','First Order','Receive your first order','order.delivered','{"order_count":1}','{}'),
    ('hundred_orders','100 Club','Process 100 orders','order.delivered','{"order_count":100}','{"badge":"gold"}'),
    ('first_referral','Referral Pioneer','Refer your first merchant','referral.completed','{"referral_count":1}','{}'),
    ('full_stock','Well Stocked','No low stock for 30 days','inventory.check','{"days_without_low_stock":30}','{}');
