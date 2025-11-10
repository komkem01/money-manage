"use client"; // (ใหม่) เพิ่ม "use client"
import React, { useState } from "react";
// import Link from 'next/link'; // แก้ไข: คอมเมนต์ออกชั่วคราวสำหรับ preview
import { useRouter } from 'next/navigation';

// --- ไอคอน SVG ---
const LockIcon = () => (
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
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

// (ใหม่) ไอคอนสำหรับ Toast
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

// --- คอมโพเนนต์หน้าเข้าสู่ระบบ ---
/**
 * หน้าเข้าสู่ระบบ (Login Page)
 * ใช้สำหรับให้ผู้ใช้ป้อนอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
 */
const LoginPage: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // (ใหม่)
  const [showToast, setShowToast] = useState<boolean>(false); // (ใหม่)

  /**
   * จัดการการส่งฟอร์มเข้าสู่ระบบ
   * (Mock Data - ข้อมูลจำลอง)
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // (ใหม่) กันกดซ้ำ

    setError(""); // เคลียร์ข้อความ error เก่า
    setIsSubmitting(true); // (ใหม่) เริ่มกระบวนการ

    // --- Mock Logic ---
    // ในอนาคต ให้แทนที่ส่วนนี้ด้วยการเรียก API
    console.log("--- Mock Login ---");
    console.log("Email:", email);
    console.log("Password:", password);

    // จำลองการหน่วงเวลาของ API
    setTimeout(() => {
      if (email === "test@gmail.com" && password === "123456") {
        console.log("เข้าสู่ระบบสำเร็จ! (Mock)");

        // (ใหม่) แสดง Toast
        setShowToast(true);

        // (ใหม่) ตั้งเวลา "เด้ง" ไปหน้า dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000); // รอ 2 วิให้เห็น Toast
      } else {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง (Mock)");
        setIsSubmitting(false); // (ใหม่) คืนค่าปุ่มให้กดได้
      }
    }, 1000); // จำลองการเรียก API 1 วินาที
    // --- End Mock Logic ---
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-inter">
      {/* --- (ใหม่) Toast Notification --- */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center animate-pulse">
          <CheckCircleIcon />
          <span>เข้าสู่ระบบสำเร็จ! กำลังไปหน้าหลัก...</span>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 transition-all">
        {/* --- Header --- */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-full bg-blue-100 mb-4">
            <LockIcon />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 mt-2">สำหรับแอปบันทึกรายรับรายจ่าย</p>
        </div>

        {/* --- Form --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ช่องกรอกอีเมล */}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>

          {/* ช่องกรอกรหัสผ่าน */}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {/* แสดงข้อความ Error (ถ้ามี) */}
          {error && (
            <div className="text-sm text-center text-red-600">{error}</div>
          )}

          {/* ปุ่มเข้าสู่ระบบ */}
          <button
            type="submit"
            disabled={isSubmitting} // (ใหม่)
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed" // (ใหม่)
          >
            {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* --- ลิงก์ไปหน้าลงทะเบียน --- */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            ยังไม่มีบัญชี?{" "}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                router.push('/register');
              }}
            >
              ลงทะเบียนที่นี่
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ส่งออก LoginPage เป็น default
export default LoginPage;
