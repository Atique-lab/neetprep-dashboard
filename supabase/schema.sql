-- 🚀 PRODUCTION SCHEMA FOR CTS ANALYTICS 2.0

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Payments Table (Fact Table)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT UNIQUE NOT NULL, -- Format: student_name|date|amount|centre|course
    payment_date DATE NOT NULL,
    student_name TEXT,
    email TEXT,
    centre_name TEXT,
    course TEXT,
    payment_method TEXT,
    revenue NUMERIC(12, 2) DEFAULT 0,
    type TEXT, -- Internal/External
    paid_to TEXT,
    gst NUMERIC(12, 2) DEFAULT 0,
    courier_cost NUMERIC(12, 2) DEFAULT 0,
    printing_cost NUMERIC(12, 2) DEFAULT 0,
    centre_share NUMERIC(12, 2) DEFAULT 0,
    neetprep_share NUMERIC(12, 2) DEFAULT 0,
    manager_name TEXT,
    session_id TEXT NOT NULL, -- 'current' or 'last'
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sync Logs Table
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_type TEXT NOT NULL,
    status TEXT NOT NULL,
    records_added INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Profiles Table (Migration/Fix)
-- Note: Already exists but ensuring correct schema
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    role TEXT DEFAULT 'manager',
    avatar_url TEXT,
    last_seen TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_centre ON payments(centre_name);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_manager ON payments(manager_name);
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);

-- 6. Analytical Views
CREATE OR REPLACE VIEW session_comparison AS
WITH stats AS (
    SELECT 
        session_id,
        COUNT(*) as total_records,
        COUNT(DISTINCT email) as total_students,
        SUM(revenue) as total_revenue,
        SUM(neetprep_share) as total_neetprep
    FROM payments
    GROUP BY session_id
)
SELECT 
    curr.total_revenue as current_rev,
    curr.total_students as current_students,
    last.total_revenue as last_rev,
    last.total_students as last_students,
    CASE WHEN last.total_revenue > 0 THEN ((curr.total_revenue - last.total_revenue) / last.total_revenue) * 100 ELSE 0 END as revenue_growth_pct,
    CASE WHEN last.total_students > 0 THEN ((curr.total_students - last.total_students) / last.total_students) * 100 ELSE 0 END as student_growth_pct
FROM (SELECT * FROM stats WHERE session_id = 'current') curr
LEFT JOIN (SELECT * FROM stats WHERE session_id = 'last') last ON TRUE;
