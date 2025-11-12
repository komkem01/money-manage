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
  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 19V6m0 0l-4 4m4-4l4 4"
      />
    </svg>
  </div>
);
const ExpenseIcon = () => (
  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  </div>
);
const TransferIcon = () => (
  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-white"
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
  </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-inter">
      {/* --- Header --- */}
      <header className="relative border-b border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ตั้งค่าประเภท</h1>
            <p className="mt-1 text-sm text-slate-600">จัดการประเภทหมวดหมู่รายรับ รายจ่าย และการโยกย้าย</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:border-slate-400"
          >
            <ArrowLeftIcon />
            กลับหน้าหลัก
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-800">
              เลือกประเภท
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              เลือกประเภทที่คุณต้องการเข้าไปจัดการ "หมวดหมู่" (เพิ่ม/ลบ/แก้ไข)
            </p>
          </div>
          
          <div className="p-6">{/* Container for content */}

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <div className="flex items-start justify-between">
                  <div className="flex">
                    <svg className="mr-3 mt-0.5 h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                  <button 
                    onClick={() => setError('')}
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* --- รายการประเภท (List of Types) --- */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
                    <span className="text-sm font-medium">กำลังโหลดข้อมูล...</span>
                  </div>
                </div>
              ) : typeConfigs.length > 0 ? (
                typeConfigs.map((type: TypeConfig) => (
                  <button
                    key={type.id}
                    onClick={() => router.push(`${type.path}?typeId=${type.id}`)}
                    className="group w-full rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-center">
                      {/* ไอคอน */}
                      <div className="flex-shrink-0 mr-5 transform transition-transform group-hover:scale-110">{type.icon}</div>

                      {/* รายละเอียด */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900">
                          {type.label}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 group-hover:text-slate-700">{type.description}</p>
                        <p className="mt-2 text-xs text-slate-400">ID: {type.id}</p>
                      </div>

                      {/* ลูกศรชี้ */}
                      <div className="flex-shrink-0 ml-4 transform transition-transform group-hover:translate-x-1">
                        <svg className="h-5 w-5 text-slate-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="mb-4 h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-slate-500 text-sm font-medium">ไม่พบข้อมูลประเภท</p>
                  <p className="text-slate-400 text-xs mt-1">กรุณาลองโหลดข้อมูลใหม่อีกครั้ง</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TypesPage;
