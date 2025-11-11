-- (จำเป็น) เปิดใช้งานส่วนขยายสำหรับ UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --- 2. ประเภท (Global Type) ---
-- สร้าง ENUM สำหรับประเภทของธุรกรรม
CREATE TYPE type_name AS ENUM (
  'Income',
  'Expense',
  'Transfer'
);

-- สร้างตาราง 'types' (ตารางนี้เป็น Global)
CREATE TABLE types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name type_name UNIQUE NOT NULL
);

-- (สำคัญ) ใส่ข้อมูลตั้งต้น (Seed Data) ให้กับตาราง types
INSERT INTO types (name) VALUES ('Income'), ('Expense'), ('Transfer');


-- --- 1. ผู้ใช้ (User) ---
-- ตารางหลักสำหรับเก็บข้อมูลผู้ใช้
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  displayname VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- ในระบบจริงควรเก็บเป็น hash
  created_at BIGINT, -- unix time
  updated_at BIGINT, -- unix time
  deleted_at BIGINT  -- unix time (สำหรับ soft delete)
);

-- Index สำหรับการค้นหา email และการ soft delete
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);


-- --- 4. บัญชี (Accounts) ---
-- ตารางบัญชีของแต่ละผู้ใช้ (กสิกร, กรุงไทย, เงินสด ฯลฯ)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(18, 2) NOT NULL DEFAULT 0, -- ยอดเงินเริ่มต้น หรือ ยอดคงเหลือปัจจุบัน
  created_at BIGINT,
  updated_at BIGINT,
  deleted_at BIGINT
);

-- Index สำหรับการดึงข้อมูลบัญชีของผู้ใช้
CREATE INDEX idx_accounts_user_id ON accounts(user_id);


-- --- 3. หมวดหมู่ (Categories) ---
-- หมวดหมู่ที่ผู้ใช้แต่ละคนสร้างเอง
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type_id UUID NOT NULL REFERENCES types(id), -- เชื่อมกับ Global Type
  name VARCHAR(255) NOT NULL,
  created_at BIGINT,
  updated_at BIGINT,
  deleted_at BIGINT
);

-- Index สำหรับการดึงหมวดหมู่ของผู้ใช้ตามประเภท
CREATE INDEX idx_categories_user_id_type_id ON categories(user_id, type_id);


-- --- 5. ธุรกรรม (Transactions) ---
-- ตารางหลักสำหรับเก็บธุรกรรมทั้งหมด
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type_id UUID NOT NULL REFERENCES types(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  
  -- account_id (บัญชีหลัก)
  -- Expense = จ่ายออก, Income = รับเข้า, Transfer = โอนออก (ต้นทาง)
  account_id UUID NOT NULL REFERENCES accounts(id),
  
  -- related_account_id (บัญชีรอง)
  -- ใช้สำหรับ Transfer เท่านั้น (ปลายทาง)
  related_account_id UUID REFERENCES accounts(id), -- อนุญาตให้เป็น NULL

  date BIGINT NOT NULL, -- unix time
  description TEXT,
  amount DECIMAL(18, 2) NOT NULL,
  created_at BIGINT,
  updated_at BIGINT,
  deleted_at BIGINT
);

-- Indexes สำหรับการ Query ธุรกรรม
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC); -- สำหรับการเรียงลำดับตามวันที่
CREATE INDEX idx_transactions_type_id ON transactions(type_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
