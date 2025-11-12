# Pending Expenses Feature Setup

## Database Migration

เพื่อใช้ฟีเจอร์ "รายจ่ายที่รอจ่าย" คุณต้องรันคำสั่ง SQL ต่อไปนี้ในฐานข้อมูล PostgreSQL:

```sql
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index สำหรับ performance
CREATE INDEX idx_pending_expenses_user_id ON pending_expenses(user_id);
CREATE INDEX idx_pending_expenses_due_date ON pending_expenses(due_date);
CREATE INDEX idx_pending_expenses_status ON pending_expenses(status);
CREATE INDEX idx_pending_expenses_category ON pending_expenses(category_id);

-- Trigger สำหรับ updated_at
CREATE OR REPLACE FUNCTION update_pending_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pending_expenses_updated_at
    BEFORE UPDATE ON pending_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_pending_expenses_updated_at();
```

## คุณสมบัติ (Features)

### 1. จัดการรายจ่ายที่รอจ่าย
- เพิ่ม/แก้ไข/ลบ รายจ่ายที่ต้องจ่ายในอนาคต
- กำหนดวันครบกำหนด (Due Date)
- ระดับความสำคัญ (Priority): สำคัญ, ปานกลาง, ไม่เร่งด่วน
- รายจ่ายประจำ (Recurring Expenses)

### 2. แปลงเป็นธุรกรรม
- เลือกบัญชีที่จะหักเงิน
- สร้างธุรกรรมอัตโนมัติ
- อัปเดตยอดเงินในบัญชี
- เปลี่ยนสถานะเป็น "จ่ายแล้ว"

### 3. สถานะรายจ่าย
- **รอจ่าย (Pending)**: ยังไม่ได้จ่าย
- **จ่ายแล้ว (Paid)**: จ่ายแล้ว
- **เลยกำหนด (Overdue)**: เลยวันครบกำหนดแล้ว

### 4. UI Components
- หน้าจัดการรายจ่ายที่รอจ่าย (`/pending-expenses`)
- Modal สำหรับเพิ่ม/แก้ไข รายจ่าย
- ปุ่มแปลงเป็นธุรกรรม
- ปุ่มมาร์คเป็นจ่ายแล้ว

## การใช้งาน

### 1. เข้าหน้า Dashboard
คลิกปุ่ม "รายจ่ายที่รอจ่าย" ในเมนูลัด

### 2. เพิ่มรายจ่ายใหม่
1. คลิก "เพิ่มรายจ่ายใหม่"
2. กรอกข้อมูล:
   - ชื่อรายจ่าย (เช่น ค่าเช่าเดือนนี้)
   - หมวดหมู่ (ต้องเป็นประเภท Expense)
   - จำนวนเงิน
   - วันครบกำหนด (ไม่บังคับ)
   - ระดับความสำคัญ
   - รายละเอียดเพิ่มเติม
   - รายจ่ายประจำ (ถ้าต้องการ)
3. บันทึก

### 3. แปลงเป็นธุรกรรม
1. คลิกปุ่มไอคอนบัตรเครดิต (สีเขียว) ข้างรายจ่าย
2. เลือกบัญชีที่จะหักเงิน
3. ยืนยันการแปลง

### 4. มาร์คเป็นจ่ายแล้ว
คลิกปุ่มไอคอนเช็ค (สีน้ำเงิน) หากจ่ายแล้วแต่ไม่ต้องการสร้างธุรกรรมในระบบ

## API Endpoints

ดูรายละเอียดใน `PENDING_EXPENSES_API.md`

## Files Created/Modified

### New Files:
- `database/pending_expenses.sql` - Database schema
- `lib/pending-expenses.ts` - Client-side functions
- `api/pending-expenses/index.js` - Main API endpoint
- `api/pending-expenses/[id].js` - Individual expense API
- `api/pending-expenses/[id]/convert.js` - Convert to transaction API
- `api/pending-expenses/[id]/mark-paid.js` - Mark as paid API
- `app/pending-expenses/page.tsx` - UI page
- `PENDING_EXPENSES_API.md` - API documentation

### Modified Files:
- `lib/types.ts` - Added PendingExpense interfaces
- `app/dashboard/page.tsx` - Added menu button

## ข้อควรระวัง

1. **ฐานข้อมูล**: ต้องรัน SQL migration ก่อนใช้งาน
2. **Categories**: ต้องมี categories ประเภท "Expense" ก่อน
3. **Accounts**: ต้องมี accounts สำหรับแปลงเป็นธุรกรรม
4. **Permissions**: ตรวจสอบว่า database user มีสิทธิ์สร้างตารางและ index

## สำหรับนักพัฒนา

### Database Relations:
- `pending_expenses.user_id` → `users.id`
- `pending_expenses.category_id` → `categories.id`

### Transaction Safety:
การแปลงเป็นธุรกรรมใช้ database transaction เพื่อความปลอดภัย:
1. สร้าง transaction record
2. อัปเดต account balance
3. เปลี่ยนสถานะ pending expense
4. ถ้าขั้นตอนใดล้มเหลว จะ rollback ทั้งหมด

### Performance:
- ใช้ index สำหรับ queries ที่สำคัญ
- Pagination สำหรับรายการจำนวนมาก (ถ้าต้องการ)
- กรองตาม status และ due_date