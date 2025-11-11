# API Integration Testing

## การทดสอบ Frontend-Backend Integration

### 1. ทดสอบการสมัครสมาชิก (Register)

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000/register` หรือ `http://192.168.1.44:3000/register`
2. กรอกข้อมูล:
   ```
   ชื่อจริง: komkem
   นามสกุล: khamket
   ชื่อเล่น: aem
   เบอร์โทร: 0987654321
   อีเมล: komkem@gmail.com
   รหัสผ่าน: 123456
   ยืนยันรหัสผ่าน: 123456
   ```
3. กดปุ่ม "ลงทะเบียน"
4. ระบบจะเรียก API: `POST http://192.168.1.44:5000/api/auth/register`
5. หากสำเร็จจะแสดง Toast และเด้งไปหน้า Dashboard

### 2. ทดสอบการเข้าสู่ระบบ (Login)

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000/login` หรือ `http://192.168.1.44:3000/login`
2. กรอกข้อมูล:
   ```
   อีเมล: komkem@gmail.com
   รหัสผ่าน: 123456
   ```
3. กดปุ่ม "เข้าสู่ระบบ"
4. ระบบจะเรียก API: `POST http://192.168.1.44:5000/api/auth/login`
5. หากสำเร็จจะแสดง Toast และเด้งไปหน้า Dashboard

### 3. ทดสอบหน้า Dashboard

1. หลังจาก login สำเร็จ จะเข้าสู่หน้า Dashboard
2. จะแสดงชื่อ user ที่ได้จาก API (displayname หรือ firstname)
3. สามารถกด "ออกจากระบบ" เพื่อ logout

## Data Flow

```
Frontend (Next.js) ←→ Backend API (Express + Prisma + PostgreSQL)

Register Flow:
1. User กรอกฟอร์ม → Frontend validate
2. Frontend เรียก registerUser() → POST /api/auth/register
3. Backend validate → hash password → save to DB
4. Backend return { user, token }
5. Frontend เก็บ token ใน localStorage → redirect to dashboard

Login Flow:
1. User กรอก email/password → Frontend validate
2. Frontend เรียก loginUser() → POST /api/auth/login
3. Backend validate → check password → update login time
4. Backend return { user, token }
5. Frontend เก็บ token ใน localStorage → redirect to dashboard

Dashboard Flow:
1. Frontend check token ใน localStorage
2. ถ้าไม่มี token → redirect to login
3. ถ้ามี token → แสดงข้อมูล user และ dashboard
4. Logout → ลบ token → redirect to login
```

## API Endpoints ที่ใช้

- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/logout` - ออกจากระบบ
- `GET /api/auth/profile` - ดูข้อมูล profile (ใช้ token)

## Local Storage

- `authToken` - JWT token สำหรับ authentication
- `userData` - ข้อมูล user object

## Error Handling

- Network errors
- Validation errors จาก backend
- Authentication errors
- แสดง error messages ในฟอร์ม