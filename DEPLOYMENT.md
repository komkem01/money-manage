# Money Management API - Vercel Serverless Setup

## ภาพรวม

โปรเจกต์นี้ถูกปรับให้ทำงานบน **Vercel Serverless Functions** โดยใช้ **PostgreSQL (Supabase)** แทน Prisma ORM เพื่อให้มีความเสถียรและรวดเร็วมากขึ้น

## การเปลี่ยนแปลงสำคัญ

### ✅ เปลี่ยนจาก Prisma เป็น PostgreSQL โดยตรง
- ✅ ใช้ `pg` (node-postgres) สำหรับเชื่อมต่อฐานข้อมูล
- ✅ เขียน SQL queries โดยตรง เพื่อประสิทธิภาพสูงสุด
- ✅ ไม่มีปัญหา Prisma Client generation บน Vercel

### ✅ Serverless Architecture
- ✅ API endpoints ทั้งหมดอยู่ใน `/api` directory
- ✅ แต่ละ endpoint เป็น serverless function อิสระ
- ✅ รองรับ CORS และ authentication

## โครงสร้าง API Endpoints

```
/api
├── login.js          # POST /api/login
├── register.js       # POST /api/register
├── accounts.js       # GET, POST /api/accounts
├── categories.js     # GET, POST /api/categories
├── types.js          # GET /api/types
└── transactions.js   # GET, POST /api/transactions
```

## การติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` หรือตั้งค่าใน Vercel Dashboard:

```env
DATABASE_URL=postgresql://postgres.hyzgypssjuwlfistaxqe:74spwbfRXWUSnzQX@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### 3. Deploy ไปยัง Vercel

```bash
# ติดตั้ง Vercel CLI (ถ้ายังไม่มี)
npm install -g vercel

# Deploy
vercel
```

หรือ push code ไป GitHub แล้ว import project ใน Vercel Dashboard

### 4. ตั้งค่า Environment Variables ใน Vercel

ไปที่ Vercel Dashboard → Project Settings → Environment Variables แล้วเพิ่ม:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NODE_ENV=production`

## การใช้งาน API

### Authentication

#### Register (สมัครสมาชิก)
```bash
POST https://your-app.vercel.app/api/register
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "displayname": "johndoe",
  "phone": "0812345678",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login (เข้าสู่ระบบ)
```bash
POST https://your-app.vercel.app/api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "displayname": "johndoe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer"
  }
}
```

### Accounts (บัญชี)

#### ดึงบัญชีทั้งหมด
```bash
GET https://your-app.vercel.app/api/accounts
Authorization: Bearer {token}
```

#### สร้างบัญชีใหม่
```bash
POST https://your-app.vercel.app/api/accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "กระเป๋าเงิน",
  "initial_balance": 1000
}
```

### Categories (หมวดหมู่)

#### ดึงหมวดหมู่ทั้งหมด
```bash
GET https://your-app.vercel.app/api/categories
Authorization: Bearer {token}
```

#### สร้างหมวดหมู่ใหม่
```bash
POST https://your-app.vercel.app/api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "อาหาร",
  "type_id": "uuid-of-expense-type"
}
```

### Types (ประเภท)

#### ดึงประเภททั้งหมด (Income, Expense, Transfer)
```bash
GET https://your-app.vercel.app/api/types
```

### Transactions (ธุรกรรม)

#### ดึงธุรกรรมทั้งหมด (พร้อม pagination)
```bash
GET https://your-app.vercel.app/api/transactions?page=1&limit=10
Authorization: Bearer {token}
```

#### สร้างธุรกรรมใหม่
```bash
POST https://your-app.vercel.app/api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500,
  "description": "ซื้อของ",
  "date": "2025-11-11T10:00:00.000Z",
  "account_id": "uuid-of-account",
  "category_id": "uuid-of-category",
  "related_account_id": null
}
```

## Database Schema

ฐานข้อมูลมีตารางหลัก 5 ตาราง:

### users
- `id` (UUID, Primary Key)
- `firstname`, `lastname`, `displayname`, `phone`
- `email` (Unique)
- `password` (Hashed)
- `created_at`, `updated_at`, `deleted_at` (BigInt timestamps)

### types
- `id` (UUID, Primary Key)
- `name` (Enum: Income, Expense, Transfer)

### accounts
- `id` (UUID, Primary Key)
- `user_id` (Foreign Key → users)
- `name` (ชื่อบัญชี)
- `amount` (Decimal - ยอดเงินคงเหลือ)
- `created_at`, `updated_at`, `deleted_at`

### categories
- `id` (UUID, Primary Key)
- `user_id` (Foreign Key → users)
- `type_id` (Foreign Key → types)
- `name` (ชื่อหมวดหมู่)
- `created_at`, `updated_at`, `deleted_at`

### transactions
- `id` (UUID, Primary Key)
- `user_id` (Foreign Key → users)
- `type_id` (Foreign Key → types)
- `category_id` (Foreign Key → categories)
- `account_id` (Foreign Key → accounts)
- `related_account_id` (Foreign Key → accounts, สำหรับ Transfer)
- `date` (BigInt - วันที่ทำธุรกรรม)
- `description` (Text)
- `amount` (Decimal)
- `created_at`, `updated_at`, `deleted_at`

## Features

✅ **JWT Authentication** - ระบบยืนยันตัวตนด้วย JWT  
✅ **CORS Support** - รองรับ Cross-Origin Requests  
✅ **Connection Pooling** - ใช้ pg Pool สำหรับประสิทธิภาพ  
✅ **Transaction Support** - รองรับ Database Transactions  
✅ **Soft Delete** - ลบข้อมูลแบบ soft delete (deleted_at)  
✅ **Pagination** - รองรับการแบ่งหน้าสำหรับธุรกรรม  
✅ **Balance Management** - จัดการยอดเงินอัตโนมัติ  

## ข้อดีของการใช้ PostgreSQL โดยตรง

1. **ไม่มีปัญหา Prisma Client Generation** บน Vercel
2. **รวดเร็วกว่า** - SQL queries โดยตรง
3. **ยืดหยุ่นกว่า** - เขียน query ที่ซับซ้อนได้ง่าย
4. **ใช้ memory น้อยกว่า** - ไม่ต้อง load Prisma Client
5. **เหมาะกับ Serverless** - cold start เร็วกว่า

## Troubleshooting

### ปัญหา: CORS Error
**แก้ไข:** ตรวจสอบว่าตั้งค่า `CORS_ORIGIN` ใน environment variables แล้ว

### ปัญหา: Connection Timeout
**แก้ไข:** ตรวจสอบ `DATABASE_URL` และ connection pooling settings

### ปัญหา: JWT Error
**แก้ไข:** ตรวจสอบว่าตั้งค่า `JWT_SECRET` และ token ยังไม่หมดอายุ

## License

MIT

## สนับสนุน

หากมีปัญหาหรือคำถาม กรุณา create issue ใน GitHub repository
