"use client";
import React, { useState, useEffect } from "react";
// import { useRouter } from 'next/navigation'; // สำหรับแอปจริง

// --- ไอคอน SVG ---
const LogOutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);
const ArrowUpRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 7l5 5m0 0l-5 5m5-5H6"
    />
  </svg>
);
const ArrowDownLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-red-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 17l-5-5m0 0l5-5m-5 5h12"
    />
  </svg>
);
const PlusCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const CogIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const ClipboardListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);
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

// --- Mock Data (ข้อมูลจำลอง) ---
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

const mockData = {
  userName: "สมชาย",
  balance: 15000.0,
  totalIncome: 50000.0,
  totalExpense: 35000.0,
  recentTransactions: [
    {
      id: "1",
      description: "เงินเดือน",
      amount: 50000.0,
      type: "income",
      date: "2025-11-01",
    },
    {
      id: "2",
      description: "ค่าเช่าบ้าน",
      amount: 15000.0,
      type: "expense",
      date: "2025-11-05",
    },
    {
      id: "3",
      description: "ค่าไฟ",
      amount: 2500.0,
      type: "expense",
      date: "2025-11-06",
    },
    {
      id: "4",
      description: "ซื้อของเข้าบ้าน",
      amount: 3000.0,
      type: "expense",
      date: "2025-11-07",
    },
    {
      id: "5",
      description: "ซื้อของ",
      amount: 300.0,
      type: "expense",
      date: "2025-11-07",
    },
  ] as Transaction[],
};
// ------------------------------

/**
 * หน้าหลัก (Dashboard)
 * แสดงภาพรวมทางการเงินและเมนูลัดต่างๆ
 */
function DashboardPage(): React.ReactElement {
  // const router = useRouter(); // สำหรับแอปจริง
  const [data, setData] = useState(mockData);
  const [showLogoutToast, setShowLogoutToast] = useState(false);

  // จำลองการโหลดข้อมูล
  useEffect(() => {
    // ในอนาคต ให้ fetch ข้อมูลจริงจาก API ที่นี่
    setData(mockData);
  }, []);

  /**
   * จัดการการออกจากระบบ
   */
  const handleLogout = () => {
    console.log("Logout initiated...");
    setShowLogoutToast(true);

    setTimeout(() => {
      // router.push('/login'); // สำหรับแอปจริง
      // @ts-ignore
      window.location.href = "/login"; // สำหรับ preview
    }, 2000);
  };

  /**
   * ฟังก์ชันจำลองการนำทาง (สำหรับ Preview)
   */
  const mockNavigate = (path: string, pageName: string) => {
    alert(`(Mock Navigate)\nกำลังไปที่: ${pageName}\n(Path: ${path})`);
    // ในแอปจริง ให้ใช้ router.push(path) หรือ <Link>
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* --- (ใหม่) Toast ออกจากระบบ --- */}
      {showLogoutToast && (
        <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center animate-pulse">
          <CheckCircleIcon />
          <span>ออกจากระบบสำเร็จ! กำลังกลับไปหน้า Login...</span>
        </div>
      )}

      {/* --- Header --- */}
      <header className="bg-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo หรือ ชื่อแอป */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">Money Manage</h1>
            </div>

            {/* ชื่อผู้ใช้และปุ่มออกจากระบบ */}
            <div className="flex items-center">
              <span className="text-gray-700 mr-4 hidden md:block">
                สวัสดี, <span className="font-medium">{data.userName}</span>!
              </span>
              <button
                onClick={handleLogout}
                disabled={showLogoutToast}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <LogOutIcon />
                <span className="ml-2">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* --- 1. ภาพรวม (Overview Section) --- */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">ภาพรวม</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* การ์ด: ยอดคงเหลือ */}
            <div className="bg-white p-6 rounded-lg shadow-lg transition-transform hover:scale-105">
              <h3 className="text-lg font-medium text-gray-500">ยอดคงเหลือ</h3>
              <p className="text-4xl font-extrabold text-blue-600 mt-2">
                ฿
                {data.balance.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* การ์ด: รายรับ */}
            <div className="bg-white p-6 rounded-lg shadow-lg transition-transform hover:scale-105">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-500">
                    รายรับ (เดือนนี้)
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    ฿
                    {data.totalIncome.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <ArrowUpRightIcon />
              </div>
            </div>

            {/* การ์ด: รายจ่าย */}
            <div className="bg-white p-6 rounded-lg shadow-lg transition-transform hover:scale-105">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-500">
                    รายจ่าย (เดือนนี้)
                  </h3>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    ฿
                    {data.totalExpense.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <ArrowDownLeftIcon />
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. เมนูลัด (Quick Actions) --- */}
        <section className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">เมนูลัด</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ปุ่ม: บันทึกรายรับ/รายจ่าย */}
            <button
              onClick={() =>
                mockNavigate("/transactions/new", "หน้าบันทึกรายรับ/รายจ่าย")
              }
              className="flex items-center justify-center p-4 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
            >
              <PlusCircleIcon />
              <span>บันทึกรายรับ/รายจ่าย</span>
            </button>

            {/* ปุ่ม: จัดการหมวดหมู่ */}
            <button
              onClick={() => mockNavigate("/categories", "หน้าจัดการหมวดหมู่")}
              className="flex items-center justify-center p-4 bg-gray-700 text-white font-medium rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300"
            >
              <CogIcon />
              <span>จัดการหมวดหมู่ (ประเภท)</span>
            </button>

            {/* ปุ่ม: ดูประวัติทั้งหมด */}
            <button
              onClick={() => mockNavigate("/history", "หน้าประวัติทั้งหมด")}
              className="flex items-center justify-center p-4 bg-gray-200 text-gray-800 font-medium rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-300"
            >
              <ClipboardListIcon />
              <span>ดูประวัติทั้งหมด</span>
            </button>
          </div>
        </section>

        {/* --- 3. รายการล่าสุด (Recent Transactions) --- */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            รายการล่าสุด
          </h2>
          <div className="flow-root">
            <ul role="list" className="divide-y divide-gray-200">
              {data.recentTransactions.map((tx) => (
                <li
                  key={tx.id}
                  className="py-4 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="text-md font-medium text-gray-900 truncate">
                      {tx.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      tx.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}฿
                    {tx.amount.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
