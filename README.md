# 💰 Money Management System# 🎉 Money Management - Vercel Serverless EditionThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



โปรเจกต์จัดการการเงินส่วนบุคคลที่พร้อมสำหรับการใช้งานบน **Vercel Serverless** โดยใช้ **Next.js 16**, **React 19**, และ **PostgreSQL (Supabase)** พร้อม RESTful API ที่ออกแบบตามแนวทางที่ดีที่สุดในเวอร์ชัน 2.0



[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/money-manage)โปรเจกต์จัดการเงินส่วนตัวที่ปรับใหม่ให้ทำงานบน **Vercel Serverless** ด้วย **PostgreSQL (Supabase)** แทน Prisma ORM## Getting Started



---



## ✨ Highlights## 🚀 การเปลี่ยนแปลงสำคัญFirst, run the development server:

- 🔐 JWT Authentication

- 💳 Account Management พร้อมคำนวณยอดเงินอัตโนมัติ

- 💸 Transaction Tracking (Income, Expense, Transfer)

- 📊 Categories & Types พร้อมตรวจสอบชื่อซ้ำแบบ case-insensitive### ✅ ไม่ใช้ Prisma แล้ว```bash

- 🔄 PATCH Method สำหรับอัปเดต (partial updates)

- ⚠️ Error messages พร้อม emoji indicators (✅ / ❌ / ⚠️) และ HTTP status code ที่ถูกต้อง- เปลี่ยนจาก Prisma ORM มาใช้ **pg (node-postgres)** เชื่อมต่อ PostgreSQL โดยตรงnpm run dev

- 🗑️ Soft Delete และ Rollback เมื่อเกิดข้อผิดพลาด

- 🚀 Deploy บน Vercel Serverless ได้ทันที- เขียน SQL queries เอง = ประสิทธิภาพสูงขึ้น# or



---- ไม่มีปัญหา Prisma Client generation บน Vercel อีกต่อไปyarn dev



## 🚀 What's New in v2.0# or

### Serverless Architecture

- API แยกเป็น **Vercel Serverless Functions** (`api/*`)### ✅ Serverless Architecturepnpm dev

- ใช้ **pg.Pool** ที่แชร์ทั่ว API เพื่อลด connection handshake และป้องกัน connection leak

- รองรับ Auto-scaling และ cold start เร็ว- API ทั้งหมดเป็น **Vercel Serverless Functions**# or



### Native PostgreSQL (No Prisma)- แต่ละ endpoint เป็นฟังก์ชันอิสระbun dev

- ใช้ `pg` (node-postgres) เชื่อมต่อ Supabase โดยตรง

- เขียน SQL ด้วยตนเองเพื่อควบคุม logic ได้ละเอียด- รองรับ auto-scaling และ cold start ที่เร็ว```

- ไม่เจอปัญหา Prisma Client บน Vercel อีกต่อไป



### RESTful API Best Practices

- ใช้ `PATCH` สำหรับ update### ✅ Database: Supabase PostgreSQLOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- HTTP Status Codes: `200`, `201`, `400`, `401`, `404`, `409`, `500`

- Error response มี `error`, `message`, `field`, `details`- ใช้ Supabase PostgreSQL Pooler

- Duplicate validation ใช้ `LOWER()` ป้องกันชื่อซ้ำ

- Connection pooling สำหรับประสิทธิภาพYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

รายละเอียด API ทั้งหมดอยู่ใน [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

- รองรับ SSL connections

---

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 📁 Project Structure

```## 📁 โครงสร้างโปรเจกต์

money-manage/

├── api/                      # 🔥 Vercel Serverless Functions## Learn More

│   ├── login.js              # POST /api/login

│   ├── register.js           # POST /api/register```

│   ├── types.js              # GET /api/types

│   ├── accounts/money-manage/To learn more about Next.js, take a look at the following resources:

│   │   ├── index.js          # GET, POST /api/accounts

│   │   └── [id].js           # GET, PATCH, DELETE /api/accounts/[id]├── api/                    # Vercel Serverless Functions

│   ├── categories/

│   │   ├── index.js          # GET, POST /api/categories│   ├── login.js           # POST /api/login- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

│   │   └── [id].js           # GET, PATCH, DELETE /api/categories/[id]

│   └── transactions/│   ├── register.js        # POST /api/register- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

│       ├── index.js          # GET, POST /api/transactions

│       └── [id].js           # GET, PATCH, DELETE /api/transactions/[id]│   ├── accounts.js        # GET, POST /api/accounts

├── app/                      # Next.js App Router

│   ├── page.tsx              # Dashboard landing│   ├── categories.js      # GET, POST /api/categoriesYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

│   ├── history/page.tsx      # Transaction history (pagination)

│   ├── accounts/...          # Account pages│   ├── transactions.js    # GET, POST /api/transactions

│   ├── transactions/...      # Transaction create/edit

│   └── ...│   └── types.js           # GET /api/types## Deploy on Vercel

├── components/               # Reusable React components

├── lib/                      # Frontend API clients├── app/                   # Next.js App Router

│   ├── auth.ts

│   ├── accounts.ts├── components/            # React ComponentsThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

│   ├── categories.ts

│   ├── transactions.ts├── lib/                   # Frontend API Client

│   └── types.ts

├── prisma/                   # Prisma schema (เก็บไว้เป็น reference)├── .env                   # Environment VariablesCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

├── public/

└── package.json├── .env.example           # Environment Template

```├── DEPLOYMENT.md          # คู่มือการ Deploy

└── package.json

---```



## 🛠 Installation## 🔧 การติดตั้ง



### Prerequisites### 1. Clone Repository

- Node.js 18+

- PostgreSQL database (แนะนำ Supabase)```bash

- Vercel account (สำหรับ deploy)git clone https://github.com/your-username/money-manage.git

cd money-manage

### 1. Clone & Install```

```bash

git clone https://github.com/your-username/money-manage.git### 2. ติดตั้ง Dependencies

cd money-manage

npm install```bash

```npm install

```

### 2. Environment Variables

คัดลอกไฟล์ตัวอย่างและกำหนดค่า### 3. ตั้งค่า Environment Variables

```bash

cp .env.example .envสร้างไฟล์ `.env` จาก `.env.example`:

```

กรอกค่าใน `.env````bash

```envcp .env.example .env

DATABASE_URL=postgresql://postgres.xxxx:password@aws-1-region.pooler.supabase.com:6543/postgres```

JWT_SECRET=your-super-secret-key

JWT_EXPIRES_IN=7dแก้ไขไฟล์ `.env`:

NODE_ENV=development

NEXT_PUBLIC_API_URL=https://your-deploy.vercel.app/api   # optional```env

```DATABASE_URL=postgresql://your-database-url

JWT_SECRET=your-super-secret-key

### 3. DevelopmentJWT_EXPIRES_IN=7d

```bashNODE_ENV=production

npm run dev```

```

 เปิด [http://localhost:3000](http://localhost:3000)### 4. รันในโหมด Development



### 4. Deploy (Vercel CLI)```bash

```bashnpm run dev

npm install -g vercel```

vercel

vercel --prodเปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

```

## 🚢 Deploy ไปยัง Vercel

---

### วิธีที่ 1: ผ่าน Vercel CLI

## 📚 API Quick Reference

ตัวอย่างทั้งหมดอยู่ใน [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)```bash

# ติดตั้ง Vercel CLI

```bashnpm install -g vercel

# Register

POST /api/register# Deploy

vercel

# Login```

POST /api/login

### วิธีที่ 2: ผ่าน GitHub Integration

# Accounts

GET    /api/accounts1. Push code ไป GitHub repository

POST   /api/accounts2. เข้า [Vercel Dashboard](https://vercel.com/dashboard)

GET    /api/accounts/:id3. คลิก "Import Project"

PATCH  /api/accounts/:id4. เลือก repository ของคุณ

DELETE /api/accounts/:id5. ตั้งค่า Environment Variables:

   - `DATABASE_URL`

# Categories   - `JWT_SECRET`

GET    /api/categories   - `JWT_EXPIRES_IN`

POST   /api/categories   - `NODE_ENV=production`

GET    /api/categories/:id6. คลิก "Deploy"

PATCH  /api/categories/:id

DELETE /api/categories/:id## 📝 API Endpoints



# Transactions### Authentication

GET    /api/transactions?page=1&limit=10

POST   /api/transactions#### Register

GET    /api/transactions/:id```bash

PATCH  /api/transactions/:idPOST /api/register

DELETE /api/transactions/:idContent-Type: application/json



# Types{

GET    /api/types  "firstname": "John",

```  "lastname": "Doe",

  "email": "john@example.com",

---  "password": "password123"

}

## 🧠 Best Practices```

- ใช้ `PATCH` สำหรับอัปเดตข้อมูล (ส่งเฉพาะฟิลด์ที่ต้องการเปลี่ยน)

- ตรวจสอบ `error` และ `errorCode` ใน response เพื่อแสดงข้อความที่เหมาะสม#### Login

- สำหรับธุรกรรม (Transactions): ระบบจะ rollback อัตโนมัติถ้ามีข้อผิดพลาด เพื่อรักษายอดเงินให้ถูกต้อง```bash

- การลบเป็นแบบ Soft delete (`deleted_at`) เพื่อความปลอดภัยของข้อมูลPOST /api/login

Content-Type: application/json

ตัวอย่างการจัดการ Error:

```typescript{

const response = await createTransaction(payload);  "email": "john@example.com",

if (!response.success) {  "password": "password123"

  if (response.errorCode === 'INSUFFICIENT_BALANCE') {}

    showBalanceAlert(response.details);```

  } else {

    toast.error(response.error ?? 'เกิดข้อผิดพลาด');### Accounts

  }

}#### Get All Accounts

``````bash

GET /api/accounts

---Authorization: Bearer {token}

```

## 🐛 Troubleshooting

| ปัญหา | วิธีแก้ |#### Create Account

|-------|----------|```bash

| `Authentication token not found` | ตรวจสอบว่ามีการล็อกอินและเก็บ JWT ใน localStorage หรือไม่ |POST /api/accounts

| `⚠️ ยอดเงินในบัญชีไม่เพียงพอ` | ตรวจสอบจำนวนเงินที่ป้อน และยอดเงินคงเหลือในบัญชี |Authorization: Bearer {token}

| `❌ Method PATCH ไม่ได้รับอนุญาต` | ตรวจสอบว่าเรียก endpoint ถูก path และใช้ method ถูกต้อง |Content-Type: application/json

| เชื่อมต่อฐานข้อมูลไม่ได้ | ตรวจสอบ `DATABASE_URL`, SSL, และสถานะของ Supabase |

{

---  "name": "กระเป๋าเงิน",

  "initial_balance": 1000

## 🧾 Changelog}

ดูรายละเอียดทั้งหมดที่ [`CHANGELOG.md`](./CHANGELOG.md)```



---### Categories



## 🤝 Contributing```bash

1. Fork projectGET /api/categories

2. สร้าง branch `feature/your-feature`Authorization: Bearer {token}

3. Commit & push```

4. เปิด Pull Request

### Types

---

```bash

## 📄 LicenseGET /api/types

MIT```



---### Transactions



**Built with ❤️ on Next.js, Vercel, และ Supabase**```bash

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
