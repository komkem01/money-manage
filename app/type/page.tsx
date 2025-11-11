"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getAllTypes, Type } from '@/lib/types';
import { getAuthToken } from '@/lib/auth';

// --- ไอคอน SVG ---
const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const IncomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2zm0 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2z"
    />
    <path d="M12 18V6" />
  </svg>
);
const ExpenseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-red-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2zm0 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2z"
    />
    <path d="M12 18V6" />
    <path d="M5 12h14" />
  </svg>
);
const TransferIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7h12m0 0l-4-4m4 4l-4 4m6 0v12m0 0l-4-4m4 4l-4 4M4 7v12m0 0l4 4m-4-4l4-4"
    />
  </svg>
);

// --- ประเภทข้อมูล (Interfaces) ---
type CategoryType = "Expense" | "Income" | "Transfer";

interface TypeConfig {
  id: string;
  name: string; // เปลี่ยนจาก CategoryType เป็น string เพื่อรองรับข้อมูลจาก database
  label: string;
  description: string;
  icon: React.ReactElement;
  bgColor: string;
  hoverColor: string;
  path: string;
}

// --- Helper function สำหรับแปลง Type เป็น Config ---
const getTypeConfig = (type: Type): TypeConfig => {
  const baseConfig = {
    id: type.id,
    name: type.name,
  };

  switch (type.name) {
    case 'Expense':
      return {
        ...baseConfig,
        label: "รายจ่าย",
        description: "จัดการหมวดหมู่ของค่าใช้จ่าย เช่น ค่าอาหาร, ค่าเดินทาง",
        icon: <ExpenseIcon />,
        bgColor: "bg-red-50",
        hoverColor: "hover:bg-red-100",
        path: "/category-type/expense",
      };
    case 'Income':
      return {
        ...baseConfig,
        label: "รายรับ",
        description: "จัดการหมวดหมู่ของรายได้ เช่น เงินเดือน, รายได้เสริม",
        icon: <IncomeIcon />,
        bgColor: "bg-green-50",
        hoverColor: "hover:bg-green-100",
        path: "/category-type/income",
      };
    case 'Transfer':
      return {
        ...baseConfig,
        label: "โยกย้าย",
        description: "จัดการหมวดหมู่การโอนเงินระหว่างบัญชี",
        icon: <TransferIcon />,
        bgColor: "bg-blue-50",
        hoverColor: "hover:bg-blue-100",
        path: "/category-type/transfer",
      };
    default:
      return {
        ...baseConfig,
        label: type.name,
        description: "จัดการหมวดหมู่",
        icon: <ExpenseIcon />,
        bgColor: "bg-gray-50",
        hoverColor: "hover:bg-gray-100",
        path: "/category-type/other",
      };
  }
};

/**
 * หน้าตั้งค่าประเภท (Types Page)
 * แสดงประเภทหลัก (รายรับ, รายจ่าย, โยกย้าย)
 * และเป็นทางเข้าไปยังหน้าจัดการหมวดหมู่ (Categories Page)
 */
function TypesPage(): React.ReactElement {
  const router = useRouter();
  const [types, setTypes] = useState<Type[]>([]);
  const [typeConfigs, setTypeConfigs] = useState<TypeConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // โหลดข้อมูลประเภทเมื่อ component mount
  useEffect(() => {
    const checkAuthAndLoadTypes = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }

        console.log("Loading types...");
        const response = await getAllTypes();
        console.log("Types loaded:", response);
        
        if (response.success) {
          setTypes(response.data || []);
          // แปลงเป็น TypeConfig
          const configs = (response.data || []).map(type => getTypeConfig(type));
          setTypeConfigs(configs);
        } else {
          setError(response.message || 'ไม่สามารถโหลดข้อมูลประเภทได้');
        }
      } catch (error: any) {
        console.error('Load types error:', error);
        setError(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        
        // ถ้า error เป็น unauthorized ให้กลับไป login
        if (error.message?.includes('authentication') || error.message?.includes('token')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadTypes();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าประเภท</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            <ArrowLeftIcon />
            กลับหน้าหลัก
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            เลือกประเภท
          </h2>
          <p className="text-gray-500 mb-6">
            เลือกประเภทที่คุณต้องการเข้าไปจัดการ "หมวดหมู่" (เพิ่ม/ลบ/แก้ไข)
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
              <button 
                onClick={() => setError('')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* --- รายการประเภท (List of Types) --- */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 text-sm font-medium leading-6 text-gray-500 transition duration-150 ease-in-out">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังโหลดข้อมูล...
                </div>
              </div>
            ) : typeConfigs.length > 0 ? (
              typeConfigs.map((type: TypeConfig) => (
                <button
                  key={type.id}
                  onClick={() => router.push(`${type.path}?typeId=${type.id}`)}
                  className={`w-full flex items-center p-5 rounded-lg ${type.bgColor} ${type.hoverColor} transition-all duration-200 border border-transparent hover:border-gray-200`}
                >
                  {/* ไอคอน */}
                  <div className="flex-shrink-0 mr-5">{type.icon}</div>

                  {/* รายละเอียด */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-800">
                      {type.label}
                    </h3>
                    <p className="text-gray-600">{type.description}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {type.id}</p>
                  </div>

                  {/* ลูกศรชี้ */}
                  <div className="flex-shrink-0 ml-4">
                    <ChevronRightIcon />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">ไม่พบข้อมูลประเภท</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TypesPage;
