# Network Access Configuration

## เข้าถึง API จากอุปกรณ์อื่นในเครือข่าย

### 1. ตรวจสอบ IP Address ของเครื่อง server:
```bash
# Linux/Mac
ip addr show | grep "inet " | grep -v 127.0.0.1

# หรือ
hostname -I

# Windows
ipconfig
```

### 2. อัปเดต CORS_ORIGIN ในไฟล์ .env:
```env
CORS_ORIGIN=http://192.168.1.44:3000
```

### 3. URL สำหรับเข้าถึง API:
- **Local (เครื่องเดียวกัน)**: http://localhost:5000
- **Network (อุปกรณ์อื่นในบ้าน)**: http://192.168.1.44:5000

### 4. ตัวอย่างการเรียก API จากอุปกรณ์อื่น:
```javascript
// Frontend (React/Next.js)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://192.168.1.44:5000/api';

// Login
fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### 5. ทดสอบการเชื่อมต่อ:
```bash
# จากอุปกรณ์อื่นในเครือข่าย
curl http://192.168.1.44:5000/health

# ทดสอบจากมือถือ
# เปิดเบราว์เซอร์ไปที่: http://192.168.1.44:5000/health
```

### 6. Firewall Settings (ถ้าจำเป็น):
```bash
# Ubuntu/Debian
sudo ufw allow 5000

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

### 7. Frontend Configuration:
อัปเดต Next.js config เพื่อรองรับ network access:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.1.44:5000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

### 8. Development Scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:network": "next dev -H 0.0.0.0",
    "backend:dev": "cd backend && npm run dev",
    "backend:network": "cd backend && npm run dev"
  }
}
```