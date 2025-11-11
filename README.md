# 🎉 Money Management - Vercel Serverless EditionThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



โปรเจกต์จัดการเงินส่วนตัวที่ปรับใหม่ให้ทำงานบน **Vercel Serverless** ด้วย **PostgreSQL (Supabase)** แทน Prisma ORM## Getting Started



## 🚀 การเปลี่ยนแปลงสำคัญFirst, run the development server:



### ✅ ไม่ใช้ Prisma แล้ว```bash

- เปลี่ยนจาก Prisma ORM มาใช้ **pg (node-postgres)** เชื่อมต่อ PostgreSQL โดยตรงnpm run dev

- เขียน SQL queries เอง = ประสิทธิภาพสูงขึ้น# or

- ไม่มีปัญหา Prisma Client generation บน Vercel อีกต่อไปyarn dev

# or

### ✅ Serverless Architecturepnpm dev

- API ทั้งหมดเป็น **Vercel Serverless Functions**# or

- แต่ละ endpoint เป็นฟังก์ชันอิสระbun dev

- รองรับ auto-scaling และ cold start ที่เร็ว```



### ✅ Database: Supabase PostgreSQLOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- ใช้ Supabase PostgreSQL Pooler

- Connection pooling สำหรับประสิทธิภาพYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- รองรับ SSL connections

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 📁 โครงสร้างโปรเจกต์

## Learn More

```

money-manage/To learn more about Next.js, take a look at the following resources:

├── api/                    # Vercel Serverless Functions

│   ├── login.js           # POST /api/login- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

│   ├── register.js        # POST /api/register- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

│   ├── accounts.js        # GET, POST /api/accounts

│   ├── categories.js      # GET, POST /api/categoriesYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

│   ├── transactions.js    # GET, POST /api/transactions

│   └── types.js           # GET /api/types## Deploy on Vercel

├── app/                   # Next.js App Router

├── components/            # React ComponentsThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

├── lib/                   # Frontend API Client

├── .env                   # Environment VariablesCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

├── .env.example           # Environment Template
├── DEPLOYMENT.md          # คู่มือการ Deploy
└── package.json
```

## 🔧 การติดตั้ง

### 1. Clone Repository

```bash
git clone https://github.com/your-username/money-manage.git
cd money-manage
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
DATABASE_URL=postgresql://your-database-url
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### 4. รันในโหมด Development

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## 🚢 Deploy ไปยัง Vercel

### วิธีที่ 1: ผ่าน Vercel CLI

```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### วิธีที่ 2: ผ่าน GitHub Integration

1. Push code ไป GitHub repository
2. เข้า [Vercel Dashboard](https://vercel.com/dashboard)
3. คลิก "Import Project"
4. เลือก repository ของคุณ
5. ตั้งค่า Environment Variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `NODE_ENV=production`
6. คลิก "Deploy"

## 📝 API Endpoints

### Authentication

#### Register
```bash
POST /api/register
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```bash
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Accounts

#### Get All Accounts
```bash
GET /api/accounts
Authorization: Bearer {token}
```

#### Create Account
```bash
POST /api/accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "กระเป๋าเงิน",
  "initial_balance": 1000
}
```

### Categories

```bash
GET /api/categories
Authorization: Bearer {token}
```

### Types

```bash
GET /api/types
```

### Transactions

```bash
GET /api/transactions?page=1&limit=10
Authorization: Bearer {token}
```

```bash
POST /api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500,
  "description": "ซื้อของ",
  "date": "2025-11-11T10:00:00.000Z",
  "account_id": "uuid",
  "category_id": "uuid"
}
```

## 🎯 Features

- ✅ **JWT Authentication** - ระบบล็อกอิน/สมัครสมาชิก
- ✅ **Account Management** - จัดการบัญชีธนาคาร/กระเป๋าเงิน
- ✅ **Transaction Tracking** - บันทึกรายรับ-รายจ่าย-โอนเงิน
- ✅ **Categories** - จัดหมวดหมู่รายการ
- ✅ **Balance Management** - จัดการยอดเงินคงเหลืออัตโนมัติ
- ✅ **Pagination** - แบ่งหน้าสำหรับข้อมูลจำนวนมาก
- ✅ **Soft Delete** - ลบข้อมูลแบบ soft delete

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **React 19** - UI Library

### Backend (Serverless)
- **Vercel Serverless Functions** - Backend API
- **PostgreSQL (Supabase)** - Database
- **pg (node-postgres)** - Database Driver
- **bcryptjs** - Password Hashing
- **jsonwebtoken** - JWT Authentication

## 📚 คู่มือเพิ่มเติม

- [DEPLOYMENT.md](./DEPLOYMENT.md) - คู่มือการ Deploy และ API Documentation
- [API_INTEGRATION.md](./API_INTEGRATION.md) - คู่มือการเชื่อมต่อ API

## ⚡ ข้อดีของ Serverless

1. **Auto-scaling** - รองรับ traffic เยอะโดยอัตโนมัติ
2. **Cost-effective** - จ่ายเฉพาะเท่าที่ใช้
3. **Zero Maintenance** - ไม่ต้องจัดการ server
4. **Global CDN** - เร็วทั่วโลก
5. **Cold Start Optimization** - เริ่มต้นเร็ว

## 🐛 Troubleshooting

### ปัญหา: ไม่สามารถเชื่อมต่อฐานข้อมูล
- ตรวจสอบ `DATABASE_URL` ใน environment variables
- ตรวจสอบว่า Supabase database ยังทำงานอยู่

### ปัญหา: JWT Token หมดอายุ
- Token หมดอายุหลัง 7 วัน (ตั้งค่าได้จาก `JWT_EXPIRES_IN`)
- ให้ล็อกอินใหม่

### ปัญหา: CORS Error
- ตรวจสอบ CORS settings ในไฟล์ API
- ตรวจสอบว่า frontend domain ถูกต้อง

## 📄 License

MIT License

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) - Hosting Platform
- [Supabase](https://supabase.com) - Database Platform
- [Next.js](https://nextjs.org) - React Framework

---

**Note:** โปรเจกต์นี้ปรับจาก Express.js + Prisma มาเป็น Vercel Serverless + PostgreSQL เพื่อประสิทธิภาพและความเสถียรที่ดีกว่า
