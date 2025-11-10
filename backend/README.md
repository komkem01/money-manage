# Money Management Backend API

Backend API สำหรับแอปพลิเคชันจัดการเงิน พัฒนาด้วย Node.js, Express.js และ PostgreSQL

## 🚀 Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

ก่อนเริ่มต้น ตรวจสอบให้แน่ใจว่าคุณมีสิ่งต่อไปนี้ติดตั้งแล้ว:

- Node.js (v16 หรือสูงกว่า)
- npm หรือ yarn
- PostgreSQL (v12 หรือสูงกว่า)

## 🛠 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd money-manage/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env` ให้เหมาะสมกับการตั้งค่าของคุณ:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/money_manage_db?schema=public"

# Server
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Setup Database

สร้างฐานข้อมูล PostgreSQL:
```sql
CREATE DATABASE money_manage_db;
```

รัน Prisma migrations:
```bash
npm run db:generate
npm run migrate
```

### 5. Seed Database (Optional)
```bash
npm run db:seed
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

API จะทำงานที่: `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
ลงทะเบียนผู้ใช้ใหม่
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /api/auth/login
เข้าสู่ระบบ
```json
{
  "email": "user@example.com", 
  "password": "password123"
}
```

#### GET /api/auth/me
ดูข้อมูลผู้ใช้ปัจจุบัน (ต้องมี Authorization header)

### Dashboard Endpoints

#### GET /api/dashboard/overview
ดูภาพรวมข้อมูลสำหรับ Dashboard

#### GET /api/dashboard/monthly-summary
สรุปรายรับรายจ่ายรายเดือน

### Accounts Endpoints  

#### GET /api/accounts
ดูรายการบัญชีทั้งหมด

#### POST /api/accounts
สร้างบัญชีใหม่

### Categories Endpoints

#### GET /api/categories
ดูรายการหมวดหมู่ทั้งหมด

#### POST /api/categories
สร้างหมวดหมู่ใหม่

### Transactions Endpoints

#### GET /api/transactions
ดูรายการธุรกรรมทั้งหมด

#### POST /api/transactions
สร้างธุรกรรมใหม่

## 🗂 Database Schema

### Users
- id (String, Primary Key)
- email (String, Unique)
- password (String)
- firstName (String, Optional)  
- lastName (String, Optional)
- username (String, Optional)

### Accounts
- id (String, Primary Key)
- name (String)
- type (AccountType Enum)
- balance (Decimal)
- description (String, Optional)

### Categories
- id (String, Primary Key)
- name (String)
- type (CategoryType Enum)
- color (String)
- icon (String, Optional)

### Transactions
- id (String, Primary Key)  
- type (TransactionType Enum)
- amount (Decimal)
- description (String)
- date (DateTime)

## 🛠 Available Scripts

```bash
# Development
npm run dev              # รัน server ใน development mode
npm start               # รัน server ใน production mode

# Database
npm run migrate         # รัน Prisma migrate
npm run migrate:deploy  # Deploy migrations สำหรับ production
npm run migrate:reset   # Reset database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes to database
npm run db:studio       # เปิด Prisma Studio
npm run db:seed         # Seed database with initial data
```

## 🔒 Authentication

API ใช้ JWT (JSON Web Token) สำหรับการยืนยันตัวตน

### การใช้งาน:
1. ลงทะเบียนหรือเข้าสู่ระบบผ่าน `/api/auth/register` หรือ `/api/auth/login`
2. ได้รับ JWT token กลับมา
3. ใส่ token ใน Authorization header สำหรับ API calls อื่นๆ:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## 🧪 Testing

สำหรับทดสอบ API สามารถใช้:
- **Postman**: Import API collection
- **curl**: Command line testing
- **Frontend Application**: Connect to API

### Test User (หลังจาก seed database):
```
Email: test@gmail.com
Password: 123456
```

## 🚀 Deployment

### Environment Variables สำหรับ Production:
```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-strong-secret-key
CORS_ORIGIN=your-frontend-domain
```

### Build สำหรับ Production:
```bash
npm run migrate:deploy
npm start
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.