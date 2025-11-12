# API Documentation - Pending Expenses

## Overview
This document covers the Pending Expenses API endpoints that allow users to manage bills and expenses that need to be paid in the future.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://money-manage-five-gold.vercel.app/api`

## Authentication
All pending expenses endpoints require Bearer token authentication:
```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### 1. Get All Pending Expenses
**GET** `/pending-expenses`

Returns all pending expenses for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "category_id": "uuid", 
      "title": "ค่าเช่าเดือนนี้",
      "description": "ค่าเช่าห้องพัก",
      "amount": "5000.00",
      "due_date": "2025-01-15",
      "priority": "high",
      "status": "pending",
      "is_recurring": true,
      "recurring_type": "monthly",
      "created_at": "1735689600000",
      "updated_at": "1735689600000",
      "category": {
        "id": "uuid",
        "name": "ค่าเช่า",
        "type_id": "uuid",
        "type": {
          "id": "uuid",
          "name": "Expense"
        }
      }
    }
  ],
  "count": 1
}
```

### 2. Get Pending Expense by ID
**GET** `/pending-expenses/{id}`

Returns a specific pending expense.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "title": "ค่าเช่าเดือนนี้",
    "description": "ค่าเช่าห้องพัก",
    "amount": "5000.00",
    "due_date": "2025-01-15",
    "priority": "high",
    "status": "pending",
    "is_recurring": true,
    "recurring_type": "monthly",
    "created_at": "1735689600000",
    "updated_at": "1735689600000",
    "category": {
      "id": "uuid",
      "name": "ค่าเช่า",
      "type_id": "uuid",
      "type": {
        "id": "uuid",
        "name": "Expense"
      }
    }
  }
}
```

### 3. Create Pending Expense  
**POST** `/pending-expenses`

Creates a new pending expense.

**Request Body:**
```json
{
  "category_id": "uuid",
  "title": "ค่าเช่าเดือนนี้",
  "description": "ค่าเช่าห้องพัก",
  "amount": 5000.00,
  "due_date": "2025-01-15",
  "priority": "high",
  "is_recurring": true,
  "recurring_type": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "title": "ค่าเช่าเดือนนี้",
    "description": "ค่าเช่าห้องพัก",
    "amount": "5000.00",
    "due_date": "2025-01-15",
    "priority": "high",
    "status": "pending",
    "is_recurring": true,
    "recurring_type": "monthly",
    "created_at": "1735689600000",
    "updated_at": "1735689600000"
  },
  "message": "Pending expense created successfully"
}
```

### 4. Update Pending Expense
**PATCH** `/pending-expenses/{id}`

Updates an existing pending expense.

**Request Body:**
```json
{
  "title": "ค่าเช่าเดือนหน้า",
  "amount": 5500.00,
  "due_date": "2025-02-15",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid", 
    "title": "ค่าเช่าเดือนหน้า",
    "description": "ค่าเช่าห้องพัก",
    "amount": "5500.00",
    "due_date": "2025-02-15",
    "priority": "medium",
    "status": "pending",
    "is_recurring": true,
    "recurring_type": "monthly",
    "created_at": "1735689600000",
    "updated_at": "1735776000000"
  },
  "message": "Pending expense updated successfully"
}
```

### 5. Delete Pending Expense
**DELETE** `/pending-expenses/{id}`

Deletes a pending expense.

**Response:**
```json
{
  "success": true,
  "message": "Pending expense deleted successfully"
}
```

### 6. Convert to Transaction
**POST** `/pending-expenses/{id}/convert`

Converts a pending expense to an actual transaction and updates account balance.

**Request Body:**
```json
{
  "account_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully converted pending expense to transaction",
  "data": {
    "transaction": {
      "id": "uuid",
      "user_id": "uuid",
      "type_id": "uuid",
      "category_id": "uuid",
      "account_id": "uuid",
      "date": "1735689600000",
      "description": "ค่าเช่าเดือนนี้",
      "amount": "5000.00",
      "created_at": "1735689600000",
      "updated_at": "1735689600000"
    },
    "account": {
      "id": "uuid",
      "user_id": "uuid",
      "name": "กสิกรไทย",
      "amount": "45000.00",
      "created_at": "1735689600000",
      "updated_at": "1735689600000"
    },
    "pendingExpense": {
      "id": "uuid",
      "status": "paid"
    }
  }
}
```

### 7. Mark as Paid
**PATCH** `/pending-expenses/{id}/mark-paid`

Marks a pending expense as paid without creating a transaction.

**Response:**
```json
{
  "success": true,
  "message": "Successfully marked as paid",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "title": "ค่าเช่าเดือนนี้",
    "description": "ค่าเช่าห้องพัก",
    "amount": "5000.00",
    "due_date": "2025-01-15",
    "priority": "high",
    "status": "paid",
    "is_recurring": true,
    "recurring_type": "monthly",
    "created_at": "1735689600000",
    "updated_at": "1735689600000"
  }
}
```

## Data Types

### Timestamp Format
- `created_at` และ `updated_at` เก็บเป็น Unix timestamp ในหน่วย milliseconds
- ตัวอย่าง: `"1735689600000"` = January 1, 2025 00:00:00 UTC
- การแปลงใน JavaScript: `new Date(parseInt(timestamp))`

### Priority Levels
- `low` - ไม่เร่งด่วน
- `medium` - ปานกลาง  
- `high` - สำคัญ

### Status Values
- `pending` - รอจ่าย
- `paid` - จ่ายแล้ว
- `overdue` - เลยกำหนด

### Recurring Types
- `daily` - รายวัน
- `weekly` - รายสัปดาห์
- `monthly` - รายเดือน
- `yearly` - รายปี

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Account ID is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication token required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Pending expense not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Business Logic

### Auto-Status Update
The system automatically updates pending expenses status to `overdue` if:
- Current date > due_date
- Status is still `pending`

### Convert to Transaction Logic
When converting a pending expense to a transaction:
1. Creates new transaction with expense type
2. Deducts amount from selected account balance
3. Updates pending expense status to `paid`
4. All operations are wrapped in a database transaction for consistency

### Recurring Expenses
- Recurring expenses can be created with different frequencies
- The system tracks the recurring pattern but doesn't auto-create new instances
- Users need to manually create new instances or implement a scheduled job

## Database Schema

```sql
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
    
    -- Note: API responses convert timestamps to Unix milliseconds format
);
```