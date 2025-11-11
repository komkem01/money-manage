# Changelog

รายการการเปลี่ยนแปลงทั้งหมดของโปรเจค Money Management System

## [2.0.0] - 2025-11-11

### 🎉 Major Refactoring - Serverless & Native PostgreSQL

#### ✨ Added
- **Vercel Serverless Functions Support**
  - แยก API endpoints เป็นโครงสร้างใหม่
  - `api/accounts/index.js` - List & Create accounts
  - `api/accounts/[id].js` - Get, Update (PATCH), Delete single account
  - `api/categories/index.js` - List & Create categories
  - `api/categories/[id].js` - Get, Update (PATCH), Delete single category
  - `api/transactions/index.js` - List & Create transactions
  - `api/transactions/[id].js` - Get, Update (PATCH), Delete single transaction
  
- **PATCH Method Support**
  - ใช้ HTTP PATCH method สำหรับการอัปเดตข้อมูลแทน POST/PUT
  - รองรับการอัปเดตเฉพาะฟิลด์ที่ต้องการเปลี่ยน (partial updates)
  - Dynamic query building สำหรับ PATCH operations

- **Enhanced Error Messages with Emoji Indicators**
  - ✅ Success messages
  - ❌ Error messages
  - ⚠️ Warning messages
  - Error responses มี structure ที่ชัดเจน: `error`, `message`, `field`, `details`

- **Improved Error Handling**
  - HTTP Status Codes ที่เหมาะสม (400, 401, 404, 409, 500)
  - Error codes ที่อ่านได้ง่าย (DUPLICATE_NAME, INSUFFICIENT_BALANCE, etc.)
  - ระบุ field ที่เกิดข้อผิดพลาด
  - แสดง details ใน development mode

- **Better Duplicate Validation**
  - Case-insensitive duplicate checking ด้วย `LOWER()` function
  - HTTP 409 Conflict status สำหรับข้อมูลซ้ำ
  - แสดงข้อมูลที่ซ้ำเพื่อให้ผู้ใช้เห็นชัดเจน
  - สำหรับ categories: ตรวจสอบชื่อซ้ำเฉพาะในประเภท (type) เดียวกัน

- **Transaction Balance Management**
  - คำนวณยอดเงินอัตโนมัติเมื่อ create/update/delete transaction
  - ตรวจสอบยอดเงินคงเหลือก่อนทำรายการ Expense/Transfer
  - แสดงยอดเงินคงเหลือและยอดที่ต้องการเมื่อเงินไม่พอ
  - รองรับการโอนเงินระหว่างบัญชี (Transfer) พร้อมบัญชีปลายทาง

- **Transaction Update with Balance Recalculation**
  - PATCH endpoint สำหรับแก้ไขธุรกรรม
  - คืนยอดเงินจากธุรกรรมเดิมก่อน
  - คำนวณยอดเงินใหม่ตามข้อมูลที่แก้ไข
  - รองรับการเปลี่ยนบัญชี, หมวดหมู่, จำนวนเงิน

- **Validation Before Delete**
  - ตรวจสอบว่ามีธุรกรรมที่ใช้บัญชี/หมวดหมู่ก่อนลบ
  - แสดงจำนวนธุรกรรมที่ยังใช้งานอยู่
  - ป้องกันการลบข้อมูลที่มี foreign key references

- **Response with Change History**
  - แสดงค่าเดิมและค่าใหม่เมื่ออัปเดตข้อมูล
  - ช่วยให้ติดตามการเปลี่ยนแปลงได้ง่าย

- **Comprehensive API Documentation**
  - `API_DOCUMENTATION.md` - เอกสาร API ฉบับสมบูรณ์
  - ตัวอย่าง request/response ทุก endpoint
  - Error codes reference
  - Best practices และ cURL examples

#### 🔄 Changed
- **Database Connection Pattern**
  - เปลี่ยนจาก Prisma ORM เป็น native PostgreSQL (`pg` library)
  - ใช้ Client pattern แทน Pool (เหมาะกับ Serverless)
  - Connection lifecycle: connect → query → end ใน finally block
  - แก้ไขปัญหา `{:shutdown, :db_termination}` error

- **Authentication Error Messages**
  - ปรับปรุงข้อความเมื่อไม่พบ token
  - ระบุชัดเจนเมื่อ token หมดอายุ
  - แสดง emoji เพื่อความชัดเจน

- **API Response Structure**
  - Standardized response format ทุก endpoint
  - `success: true/false` สำหรับทุก response
  - `message` field พร้อม emoji indicators
  - Pagination info สำหรับ list endpoints

- **Categories API**
  - จัดกลุ่มตามประเภท (Income, Expense, Transfer) ใน GET /api/categories
  - ตรวจสอบชื่อซ้ำเฉพาะในประเภทเดียวกัน
  - แสดงชื่อประเภทพร้อมข้อมูลหมวดหมู่

- **Accounts API**
  - เพิ่ม `balance` field (same as `amount`) สำหรับความชัดเจน
  - ตรวจสอบจำนวนธุรกรรมก่อนลบบัญชี

#### 🗑️ Removed
- **Prisma Dependencies**
  - ลบ `@prisma/client` และ `prisma` ออกจาก package.json
  - ลบไฟล์ Prisma-related จาก backend (แต่เก็บ schema.prisma ไว้อ้างอิง)
  
- **Connection Pool**
  - ไม่ใช้ Pool pattern แล้วเพราะไม่เหมาะกับ Serverless
  - แต่ละ request สร้าง Client ใหม่และปิดเมื่อเสร็จ

#### 🐛 Fixed
- **Database Connection Errors**
  - แก้ไข password authentication failed
  - อัปเดต DATABASE_URL ด้วย password ที่ถูกต้อง: `nWASO5f3ZZplYJfq`
  - แก้ไขปัญหา db_termination ด้วยการเปลี่ยนเป็น Client pattern

- **Update Operations**
  - ใช้ PATCH method แทน POST/PUT
  - Dynamic field updates (อัปเดตเฉพาะฟิลด์ที่ส่งมา)

- **Error Handling**
  - จับ error ทุกกรณีและ return response ที่เหมาะสม
  - Rollback transaction เมื่อเกิด error

#### 📝 Documentation
- เพิ่ม `API_DOCUMENTATION.md` - คู่มือ API ฉบับสมบูรณ์
- อัปเดต `README.md` ด้วยข้อมูลโครงสร้างใหม่
- สร้าง `DEPLOYMENT.md` สำหรับคำแนะนำการ deploy
- `CHANGELOG.md` - บันทึกการเปลี่ยนแปลงทั้งหมด

---

## [1.0.0] - 2024-11-10

### ✨ Initial Release
- Express.js backend with Prisma ORM
- PostgreSQL database on Supabase
- JWT authentication
- CRUD operations for:
  - Users
  - Accounts
  - Categories
  - Transactions
  - Types
- Basic error handling
- Soft delete pattern

---

## Migration Guide: v1.0.0 → v2.0.0

### Backend Changes

#### 1. API Endpoints Structure
```
Old (v1.0):
├── backend/src/routes/
│   ├── auth.js          → POST /auth/login, /auth/register
│   ├── accounts.js      → GET/POST/PUT/DELETE /accounts
│   ├── categories.js    → GET/POST/PUT/DELETE /categories
│   └── transactions.js  → GET/POST/PUT/DELETE /transactions

New (v2.0):
├── api/
│   ├── login.js         → POST /api/login
│   ├── register.js      → POST /api/register
│   ├── accounts/
│   │   ├── index.js     → GET/POST /api/accounts
│   │   └── [id].js      → GET/PATCH/DELETE /api/accounts/[id]
│   ├── categories/
│   │   ├── index.js     → GET/POST /api/categories
│   │   └── [id].js      → GET/PATCH/DELETE /api/categories/[id]
│   └── transactions/
│       ├── index.js     → GET/POST /api/transactions
│       └── [id].js      → GET/PATCH/DELETE /api/transactions/[id]
```

#### 2. Update Methods
```javascript
// Old (v1.0) - POST/PUT for updates
fetch('/accounts', {
  method: 'PUT',
  body: JSON.stringify({ id: '...', name: 'New Name', amount: 5000 })
})

// New (v2.0) - PATCH for updates
fetch('/api/accounts/uuid', {
  method: 'PATCH',
  body: JSON.stringify({ name: 'New Name' })  // เฉพาะฟิลด์ที่เปลี่ยน
})
```

#### 3. Error Response Format
```javascript
// Old (v1.0)
{
  "success": false,
  "message": "Account name already exists"
}

// New (v2.0)
{
  "success": false,
  "error": "DUPLICATE_NAME",
  "message": "⚠️ มีบัญชีชื่อ \"กระเป๋าเงิน\" อยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น",
  "field": "name",
  "existingAccount": {
    "id": "uuid",
    "name": "กระเป๋าเงิน"
  }
}
```

#### 4. HTTP Status Codes
```
v1.0: ส่วนใหญ่เป็น 200 หรือ 500

v2.0: ใช้ status codes ที่เหมาะสม
├── 200 OK - Success
├── 201 Created - สร้างสำเร็จ
├── 400 Bad Request - Validation error
├── 401 Unauthorized - Authentication error
├── 404 Not Found - Resource not found
├── 409 Conflict - Duplicate data
└── 500 Internal Server Error - System error
```

### Frontend Changes Required

#### 1. Update API Base URL
```javascript
// Old
const API_BASE = 'http://localhost:3001'

// New
const API_BASE = 'https://your-app.vercel.app/api'
```

#### 2. Update Error Handling
```javascript
// Old
if (!response.success) {
  alert(response.message)
}

// New
if (!response.success) {
  switch (response.error) {
    case 'DUPLICATE_NAME':
      showFieldError(response.field, response.message)
      break
    case 'INSUFFICIENT_BALANCE':
      showBalanceAlert(response.currentBalance, response.requiredAmount)
      break
    default:
      alert(response.message)
  }
}
```

#### 3. Update CRUD Operations
```javascript
// สร้าง - ไม่เปลี่ยน
POST /api/accounts

// อ่าน - ไม่เปลี่ยน
GET /api/accounts
GET /api/accounts/[id]

// แก้ไข - เปลี่ยนเป็น PATCH และเปลี่ยน URL pattern
// Old: PUT /api/accounts
// New: PATCH /api/accounts/[id]

// ลบ - เปลี่ยน URL pattern
// Old: DELETE /api/accounts
// New: DELETE /api/accounts/[id]
```

---

## Breaking Changes Summary

### ⚠️ v1.0 → v2.0 Breaking Changes

1. **ต้องเปลี่ยน HTTP Method สำหรับ updates จาก PUT → PATCH**
2. **URL pattern เปลี่ยนจาก `/resource` → `/resource/[id]` สำหรับ single item operations**
3. **Error response structure เปลี่ยนแปลง (เพิ่ม `error` code และ `field`)**
4. **HTTP status codes เปลี่ยน (409 for duplicates, 201 for created)**
5. **Categories API ตอนนี้ return grouped by type**
6. **Transaction PATCH ต้องระวังเรื่องการคำนวณยอดเงิน**

### ✅ Non-Breaking Changes

1. Authentication ยังใช้ Bearer token เหมือนเดิม
2. Request body format ส่วนใหญ่เหมือนเดิม (เพิ่มเติมฟิลด์บางอย่าง)
3. Soft delete pattern ยังใช้เหมือนเดิม
4. Database schema ไม่เปลี่ยน

---

## Upgrade Instructions

### สำหรับ Backend Developer

1. ติดตั้ง dependencies ใหม่:
```bash
npm install pg@8.11.3
npm uninstall @prisma/client prisma
```

2. ตั้งค่า environment variables:
```bash
DATABASE_URL=postgresql://postgres.hyzgypssjuwlfistaxqe:nWASO5f3ZZplYJfq@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

3. Deploy to Vercel:
```bash
vercel --prod
```

### สำหรับ Frontend Developer

1. อัปเดต API client libraries (`lib/*.ts`):
   - เปลี่ยน PUT → PATCH
   - เปลี่ยน URL patterns
   - เพิ่ม error code handling

2. อัปเดต error handling ใน components:
   - ตรวจสอบ `error` field
   - แสดง emoji indicators
   - Handle specific error cases

3. ทดสอบทุก CRUD operations

---

## Future Plans

### v2.1.0 (Planned)
- [ ] Dashboard API with statistics
- [ ] Export transactions to CSV/Excel
- [ ] Recurring transactions support
- [ ] Multi-currency support
- [ ] Budget management

### v2.2.0 (Planned)
- [ ] WebSocket for real-time updates
- [ ] Notification system
- [ ] Transaction search and filters
- [ ] Data visualization endpoints

### v3.0.0 (Future)
- [ ] Mobile app support (React Native)
- [ ] Offline mode
- [ ] Data sync across devices
- [ ] Advanced analytics and insights
