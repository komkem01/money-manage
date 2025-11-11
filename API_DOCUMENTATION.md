# API Documentation

## Overview
RESTful API สำหรับระบบจัดการการเงินส่วนบุคคล (Money Management System)

**Base URL**: `https://your-app.vercel.app/api`

**Authentication**: ใช้ Bearer Token ใน Authorization header
```
Authorization: Bearer <your-jwt-token>
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "✅ ดำเนินการสำเร็จ"
}
```

### Error Response
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "❌ คำอธิบายข้อผิดพลาดที่อ่านเข้าใจง่าย",
  "field": "fieldName",
  "details": "รายละเอียดเพิ่มเติม (development mode เท่านั้น)"
}
```

### HTTP Status Codes
- `200 OK` - สำเร็จ
- `201 Created` - สร้างข้อมูลสำเร็จ
- `400 Bad Request` - ข้อมูลไม่ถูกต้อง
- `401 Unauthorized` - ไม่ได้รับอนุญาต
- `404 Not Found` - ไม่พบข้อมูล
- `409 Conflict` - ข้อมูลซ้ำ
- `500 Internal Server Error` - ข้อผิดพลาดของระบบ

---

## Authentication

### Register
สร้างบัญชีผู้ใช้ใหม่

**Endpoint**: `POST /api/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstname": "ชื่อจริง",
  "lastname": "นามสกุล",
  "displayname": "ชื่อแสดง",
  "phone": "0812345678"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "✅ สร้างบัญชีผู้ใช้สำเร็จ",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayname": "ชื่อแสดง"
  },
  "token": "jwt-token-here"
}
```

**Error Responses**:
- `409 Conflict` - อีเมลซ้ำ
```json
{
  "success": false,
  "error": "DUPLICATE_EMAIL",
  "message": "⚠️ อีเมล user@example.com ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น",
  "field": "email"
}
```

### Login
เข้าสู่ระบบ

**Endpoint**: `POST /api/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "✅ เข้าสู่ระบบสำเร็จ",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayname": "ชื่อแสดง"
  },
  "token": "jwt-token-here"
}
```

**Error Responses**:
- `401 Unauthorized` - อีเมลหรือรหัสผ่านไม่ถูกต้อง
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง"
}
```

---

## Accounts (บัญชี)

### List Accounts
ดึงรายการบัญชีทั้งหมด

**Endpoint**: `GET /api/accounts`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "กระเป๋าเงิน",
      "amount": "5000",
      "balance": 5000,
      "user_id": "uuid",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

### Create Account
สร้างบัญชีใหม่

**Endpoint**: `POST /api/accounts`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "กระเป๋าเงิน",
  "amount": 5000
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "✅ สร้างบัญชีสำเร็จ",
  "data": {
    "id": "uuid",
    "name": "กระเป๋าเงิน",
    "amount": "5000",
    "balance": 5000
  }
}
```

**Error Responses**:
- `409 Conflict` - ชื่อบัญชีซ้ำ
```json
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

### Get Account
ดึงข้อมูลบัญชีเดียว

**Endpoint**: `GET /api/accounts/[id]`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "กระเป๋าเงิน",
    "amount": "5000",
    "balance": 5000
  }
}
```

### Update Account
แก้ไขบัญชี (ใช้ PATCH method)

**Endpoint**: `PATCH /api/accounts/[id]`

**Headers**: `Authorization: Bearer <token>`

**Request Body** (ระบุเฉพาะฟิลด์ที่ต้องการแก้ไข):
```json
{
  "name": "กระเป๋าเงินใหม่",
  "amount": 6000
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "✅ อัปเดตบัญชีสำเร็จ",
  "data": {
    "id": "uuid",
    "name": "กระเป๋าเงินใหม่",
    "amount": "6000"
  },
  "changes": {
    "name": { "old": "กระเป๋าเงิน", "new": "กระเป๋าเงินใหม่" },
    "amount": { "old": "5000", "new": "6000" }
  }
}
```

### Delete Account
ลบบัญชี (soft delete)

**Endpoint**: `DELETE /api/accounts/[id]`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "success": true,
  "message": "✅ ลบบัญชีสำเร็จ",
  "deletedAccount": {
    "id": "uuid",
    "name": "กระเป๋าเงิน"
  }
}
```

**Error Responses**:
- `400 Bad Request` - มีธุรกรรมที่ใช้บัญชีนี้
```json
{
  "success": false,
  "error": "HAS_TRANSACTIONS",
  "message": "⚠️ ไม่สามารถลบบัญชีได้ เนื่องจากมีธุรกรรม 5 รายการที่ใช้บัญชีนี้",
  "transactionCount": 5
}
```

---

## Categories (หมวดหมู่)

### List Categories
ดึงรายการหมวดหมู่ทั้งหมด (จัดกลุ่มตามประเภท)

**Endpoint**: `GET /api/categories`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "Income": [
      {
        "id": "uuid",
        "name": "เงินเดือน",
        "type_id": "uuid",
        "type_name": "Income"
      }
    ],
    "Expense": [
      {
        "id": "uuid",
        "name": "อาหาร",
        "type_id": "uuid",
        "type_name": "Expense"
      }
    ],
    "Transfer": []
  }
}
```

### Create Category
สร้างหมวดหมู่ใหม่

**Endpoint**: `POST /api/categories`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "ค่าเดินทาง",
  "type_id": "expense-type-uuid"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "✅ สร้างหมวดหมู่สำเร็จ",
  "data": {
    "id": "uuid",
    "name": "ค่าเดินทาง",
    "type_id": "uuid",
    "type": {
      "id": "uuid",
      "name": "Expense"
    }
  }
}
```

**Error Responses**:
- `409 Conflict` - ชื่อหมวดหมู่ซ้ำในประเภทเดียวกัน
```json
{
  "success": false,
  "error": "DUPLICATE_NAME",
  "message": "⚠️ มีหมวดหมู่ \"ค่าเดินทาง\" ในประเภท \"Expense\" อยู่แล้ว กรุณาใช้ชื่ออื่น",
  "field": "name",
  "existingCategory": {
    "id": "uuid",
    "name": "ค่าเดินทาง",
    "type": "Expense"
  }
}
```

### Get Category
ดึงข้อมูลหมวดหมู่เดียว

**Endpoint**: `GET /api/categories/[id]`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "ค่าเดินทาง",
    "type_id": "uuid",
    "type_name": "Expense",
    "type": {
      "id": "uuid",
      "name": "Expense"
    }
  }
}
```

### Update Category
แก้ไขหมวดหมู่ (ใช้ PATCH method)

**Endpoint**: `PATCH /api/categories/[id]`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "ค่าเดินทางใหม่",
  "type_id": "income-type-uuid"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "✅ อัปเดตหมวดหมู่สำเร็จ",
  "data": {
    "id": "uuid",
    "name": "ค่าเดินทางใหม่",
    "type_id": "uuid",
    "type": {
      "id": "uuid",
      "name": "Income"
    }
  },
  "changes": {
    "name": { "old": "ค่าเดินทาง", "new": "ค่าเดินทางใหม่" },
    "type_id": { "old": "expense-uuid", "new": "income-uuid" }
  }
}
```

### Delete Category
ลบหมวดหมู่ (soft delete)

**Endpoint**: `DELETE /api/categories/[id]`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "success": true,
  "message": "✅ ลบหมวดหมู่สำเร็จ",
  "deletedCategory": {
    "id": "uuid",
    "name": "ค่าเดินทาง"
  }
}
```

---

## Transactions (ธุรกรรม)

### List Transactions
ดึงรายการธุรกรรมทั้งหมด (รองรับ pagination)

**Endpoint**: `GET /api/transactions?page=1&limit=10`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (optional): หน้าที่ต้องการ (default: 1)
- `limit` (optional): จำนวนรายการต่อหน้า (default: 10)

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": "1000",
      "description": "ซื้อของ",
      "date": "timestamp",
      "account": {
        "id": "uuid",
        "name": "กระเป๋าเงิน",
        "amount": "4000"
      },
      "category": {
        "id": "uuid",
        "name": "อาหาร",
        "type": { "name": "Expense" }
      },
      "type": {
        "id": "uuid",
        "name": "Expense"
      },
      "related_account": null
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### Create Transaction
สร้างธุรกรรมใหม่

**Endpoint**: `POST /api/transactions`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "amount": 1000,
  "description": "ซื้อของ",
  "date": "2024-11-11",
  "account_id": "uuid",
  "category_id": "uuid",
  "related_account_id": null
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "✅ สร้างธุรกรรมสำเร็จ",
  "data": {
    "id": "uuid",
    "amount": "1000",
    "description": "ซื้อของ",
    "date": "timestamp",
    "account_id": "uuid",
    "category_id": "uuid",
    "type_id": "uuid",
    "related_account_id": null
  }
}
```

**Error Responses**:
- `400 Bad Request` - ยอดเงินไม่เพียงพอ
```json
{
  "success": false,
  "error": "INSUFFICIENT_BALANCE",
  "message": "⚠️ ยอดเงินในบัญชี \"กระเป๋าเงิน\" ไม่เพียงพอ (คงเหลือ: 500 บาท, ต้องการ: 1,000 บาท)",
  "field": "amount",
  "currentBalance": 500,
  "requiredAmount": 1000
}
```

### Get Transaction
ดึงข้อมูลธุรกรรมเดียว

**Endpoint**: `GET /api/transactions/[id]`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": "1000",
    "description": "ซื้อของ",
    "date": "timestamp",
    "account": { ... },
    "category": { ... },
    "type": { ... },
    "related_account": null
  }
}
```

### Update Transaction
แก้ไขธุรกรรม (ใช้ PATCH method)

**Endpoint**: `PATCH /api/transactions/[id]`

**Headers**: `Authorization: Bearer <token>`

**Request Body** (ระบุเฉพาะฟิลด์ที่ต้องการแก้ไข):
```json
{
  "amount": 1500,
  "description": "ซื้อของใหม่",
  "account_id": "new-account-uuid"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "✅ อัปเดตธุรกรรมสำเร็จ",
  "data": {
    "id": "uuid",
    "amount": "1500",
    "description": "ซื้อของใหม่"
  }
}
```

**Note**: 
- การแก้ไขธุรกรรมจะคำนวณยอดเงินใหม่โดยอัตโนมัติ
- ระบบจะคืนยอดเงินจากการทำธุรกรรมเดิม แล้วคำนวณใหม่ตามข้อมูลที่แก้ไข

### Delete Transaction
ลบธุรกรรม (soft delete และคืนยอดเงิน)

**Endpoint**: `DELETE /api/transactions/[id]`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "success": true,
  "message": "✅ ลบธุรกรรมสำเร็จ",
  "deletedTransaction": {
    "id": "uuid",
    "amount": 1000,
    "description": "ซื้อของ"
  }
}
```

**Note**: การลบธุรกรรมจะคืนยอดเงินให้กับบัญชีที่เกี่ยวข้อง

---

## Types (ประเภทธุรกรรม)

### List Types
ดึงรายการประเภทธุรกรรมทั้งหมด (ไม่ต้อง authentication)

**Endpoint**: `GET /api/types`

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Income",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    },
    {
      "id": "uuid",
      "name": "Expense",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    },
    {
      "id": "uuid",
      "name": "Transfer",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

---

## Error Codes Reference

### Authentication Errors
- `UNAUTHORIZED` - ไม่พบ Token
- `INVALID_TOKEN` - Token ไม่ถูกต้องหรือหมดอายุ
- `USER_NOT_FOUND` - ไม่พบผู้ใช้
- `INVALID_CREDENTIALS` - อีเมลหรือรหัสผ่านไม่ถูกต้อง
- `DUPLICATE_EMAIL` - อีเมลซ้ำ

### Validation Errors
- `VALIDATION_ERROR` - ข้อมูลไม่ถูกต้องหรือไม่ครบ
- `DUPLICATE_NAME` - ชื่อซ้ำ
- `INSUFFICIENT_BALANCE` - ยอดเงินไม่เพียงพอ

### Resource Errors
- `ACCOUNT_NOT_FOUND` - ไม่พบบัญชี
- `CATEGORY_NOT_FOUND` - ไม่พบหมวดหมู่
- `TRANSACTION_NOT_FOUND` - ไม่พบธุรกรรม
- `TYPE_NOT_FOUND` - ไม่พบประเภท
- `RELATED_ACCOUNT_NOT_FOUND` - ไม่พบบัญชีปลายทาง

### Constraint Errors
- `HAS_TRANSACTIONS` - มีธุรกรรมที่ใช้งานอยู่ (ไม่สามารถลบได้)
- `NO_UPDATES` - ไม่มีข้อมูลที่ต้องการอัปเดต

### System Errors
- `INTERNAL_SERVER_ERROR` - ข้อผิดพลาดภายในระบบ
- `METHOD_NOT_ALLOWED` - Method ไม่ได้รับอนุญาต

---

## Best Practices

### 1. Use PATCH for Updates
ใช้ PATCH method สำหรับการอัปเดตข้อมูล และส่งเฉพาะฟิลด์ที่ต้องการแก้ไข:
```javascript
// ✅ ดี - ส่งเฉพาะฟิลด์ที่เปลี่ยน
fetch('/api/accounts/uuid', {
  method: 'PATCH',
  body: JSON.stringify({ name: 'ชื่อใหม่' })
})

// ❌ ไม่ดี - ส่งทุกฟิลด์แม้ไม่ได้เปลี่ยน
fetch('/api/accounts/uuid', {
  method: 'PUT',
  body: JSON.stringify({ name: 'ชื่อใหม่', amount: 5000, ... })
})
```

### 2. Handle Error Codes
จับ error code เพื่อแสดง UI ที่เหมาะสม:
```javascript
if (error.error === 'DUPLICATE_NAME') {
  // แสดง error ที่ฟิลด์ name
  showFieldError('name', error.message)
} else if (error.error === 'INSUFFICIENT_BALANCE') {
  // แสดง modal เตือนยอดเงินไม่พอ
  showBalanceAlert(error.currentBalance, error.requiredAmount)
}
```

### 3. Transaction Safety
ธุรกรรมการเงินใช้ database transactions เพื่อความปลอดภัย:
- การสร้าง/แก้ไข/ลบธุรกรรมจะอัปเดตยอดเงินในบัญชีโดยอัตโนมัติ
- ถ้าเกิดข้อผิดพลาดระหว่างทาง ระบบจะ rollback ทั้งหมด
- ไม่ต้องกังวลเรื่องยอดเงินไม่ตรง

### 4. Soft Delete
การลบข้อมูลเป็น soft delete (ตั้งค่า deleted_at):
- ข้อมูลยังอยู่ในฐานข้อมูล แต่ไม่แสดงใน API
- สามารถกู้คืนข้อมูลได้ในอนาคต
- รักษา integrity ของข้อมูลที่เกี่ยวข้อง

### 5. Pagination
ใช้ pagination สำหรับรายการที่มีจำนวนมาก:
```javascript
// ดึงหน้าที่ 2 (รายการที่ 11-20)
fetch('/api/transactions?page=2&limit=10')
```

---

## Testing with cURL

### Register
```bash
curl -X POST https://your-app.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstname": "Test",
    "lastname": "User",
    "displayname": "testuser",
    "phone": "0812345678"
  }'
```

### Login
```bash
curl -X POST https://your-app.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Create Account
```bash
curl -X POST https://your-app.vercel.app/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "กระเป๋าเงิน",
    "amount": 5000
  }'
```

### Update Account (PATCH)
```bash
curl -X PATCH https://your-app.vercel.app/api/accounts/ACCOUNT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "กระเป๋าเงินใหม่"
  }'
```

### Create Transaction
```bash
curl -X POST https://your-app.vercel.app/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 1000,
    "description": "ซื้อของ",
    "account_id": "ACCOUNT_ID",
    "category_id": "CATEGORY_ID"
  }'
```
