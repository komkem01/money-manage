"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { registerUser, storeAuthToken, storeUserData, getAuthToken, getUserData } from '@/lib/auth';

// --- ไอคอน SVG ---
const UserPlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-blue-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM19 11v-2a2 2 0 00-2-2h-2m-4 0H9a2 2 0 00-2 2v2m0 4v2a2 2 0 002 2h2m4 0h2a2 2 0 002-2v-2"
    />
  </svg>
);

// ไอคอนสำหรับ Toast (ใหม่)
const CheckCircleIcon = () => (
  <svg
    className="h-6 w-6 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// --- Interface สำหรับข้อมูลในฟอร์ม ---
interface RegisterFormData {
  firstName: string;
  lastName: string;
  nickname: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * หน้าลงทะเบียน (Register Page)
 * ใช้สำหรับให้ผู้ใช้ใหม่กรอกข้อมูลเพื่อสร้างบัญชี
 */
const RegisterPage: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    nickname: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // (ใหม่) กันการกดซ้ำ
  const [showToast, setShowToast] = useState<boolean>(false); // (ใหม่) สถานะ Toast

  /**
   * จัดการการเปลี่ยนแปลงข้อมูลใน Input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * จัดการการส่งฟอร์มลงทะเบียน
   * เชื่อมต่อกับ Backend API
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // ป้องกันการกดซ้ำ

    setError(""); // เคลียร์ข้อความ error เก่า

    // 1. ตรวจสอบรหัสผ่าน
    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    // 2. ตรวจสอบความยาวรหัสผ่าน
    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. เตรียมข้อมูลสำหรับส่ง API
      const userData = {
        email: formData.email,
        password: formData.password,
        firstname: formData.firstName,
        lastname: formData.lastName,
        displayname: formData.nickname,
        phone: formData.phone,
      };

      // 4. เรียก API ลงทะเบียน
      console.log("Calling register API...");
      const response = await registerUser(userData);

      if (response.success) {
        console.log("Register successful:", response);
        
        // 5. บันทึก token และข้อมูล user
        console.log("Storing token:", response.data.token);
        console.log("Storing user data:", response.data.user);
        
        storeAuthToken(response.data.token);
        storeUserData(response.data.user);

        // ตรวจสอบว่าเก็บสำเร็จหรือไม่
        const storedToken = getAuthToken();
        const storedUser = getUserData();
        console.log("Token stored successfully:", !!storedToken);
        console.log("User data stored successfully:", !!storedUser);

        // 6. แสดง Toast สำเร็จ
        setShowToast(true);

        // 7. เด้งไปหน้า dashboard (เพราะได้ token แล้ว)
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error("Register failed:", error);
      setError(error.message || "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-inter">
      {/* --- (ใหม่) Toast Notification --- */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center animate-pulse">
          <CheckCircleIcon />
          <span>ลงทะเบียนสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...</span>
        </div>
      )}

      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8 transition-all my-8">
        {/* --- Header --- */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-full bg-blue-100 mb-4">
            <UserPlusIcon />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">สร้างบัญชีใหม่</h1>
          <p className="text-gray-500 mt-2">กรอกข้อมูลเพื่อเริ่มใช้งาน</p>
        </div>

        {/* --- Form --- */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ชื่อจริง และ นามสกุล */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ชื่อจริง
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="สมชาย"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                นามสกุล
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="รักดี"
              />
            </div>
          </div>

          {/* ชื่อเล่น และ เบอร์โทร */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ชื่อเล่น (ไม่บังคับ)
              </label>
              <input
                type="text"
                id="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ชาย"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                เบอร์โทร (ไม่บังคับ)
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="081-234-5678"
              />
            </div>
          </div>

          {/* อีเมล */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              อีเมล
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              รหัสผ่าน
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6} // เพิ่มความปลอดภัยพื้นฐาน
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>

          {/* ยืนยันรหัสผ่าน */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {/* แสดงข้อความ Error (ถ้ามี) */}
          {error && (
            <div className="text-sm text-center text-red-600">{error}</div>
          )}

          {/* ปุ่มลงทะเบียน */}
          <button
            type="submit"
            disabled={isSubmitting} // (ใหม่) ปิดปุ่มเมื่อกำลังทำงาน
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
          </button>
        </form>

        {/* --- ลิงก์ไปหน้าเข้าสู่ระบบ --- */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            มีบัญชีอยู่แล้ว?{" "}
            {/* แก้ไข: ใช้ <a> tag ชั่วคราวสำหรับ preview 
              ในโปรเจกต์ Next.js จริง ให้กลับไปใช้ <Link href="/login"> ... </Link>
            */}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                router.push('/login');
              }}
            >
              เข้าสู่ระบบที่นี่
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ส่งออก RegisterPage เป็น default
export default RegisterPage;
