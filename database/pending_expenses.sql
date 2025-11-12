-- ตาราง pending_expenses สำหรับเก็บรายจ่ายที่รอจ่าย
CREATE TABLE pending_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_type VARCHAR(20) CHECK (recurring_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000,
    updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000
);

-- Index สำหรับ performance
CREATE INDEX idx_pending_expenses_user_id ON pending_expenses(user_id);
CREATE INDEX idx_pending_expenses_due_date ON pending_expenses(due_date);
CREATE INDEX idx_pending_expenses_status ON pending_expenses(status);
CREATE INDEX idx_pending_expenses_category ON pending_expenses(category_id);

-- Trigger สำหรับ updated_at (Unix timestamp in milliseconds)
CREATE OR REPLACE FUNCTION update_pending_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pending_expenses_updated_at
    BEFORE UPDATE ON pending_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_pending_expenses_updated_at();