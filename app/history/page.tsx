"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';

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
const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);
const IncomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);
const ExpenseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-red-500"
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
);

// --- ประเภทข้อมูล (Interfaces) ---
type TransactionType = "expense" | "income" | "transfer";

interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
}

// --- Mock Data (ข้อมูลจำลอง) ---
const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2023-10-01",
    type: "expense",
    category: "ค่าอาหาร",
    amount: 120,
    description: "มื้อเที่ยง",
  },
  {
    id: "2",
    date: "2023-10-01",
    type: "income",
    category: "เงินเดือน",
    amount: 25000,
    description: "เงินเดือน ต.ค.",
  },
  {
    id: "3",
    date: "2023-10-02",
    type: "expense",
    category: "ค่าเดินทาง",
    amount: 350,
    description: "เติมน้ำมัน",
  },
  {
    id: "4",
    date: "2023-10-03",
    type: "expense",
    category: "ค่าอาหาร",
    amount: 80,
    description: "กาแฟ",
  },
  {
    id: "5",
    date: "2023-10-04",
    type: "expense",
    category: "ช้อปปิ้ง",
    amount: 1200,
    description: "เสื้อ",
  },
  {
    id: "6",
    date: "2023-10-05",
    type: "income",
    category: "รายได้เสริม",
    amount: 3000,
    description: "ฟรีแลนซ์",
  },
  {
    id: "7",
    date: "2023-10-05",
    type: "expense",
    category: "ค่าอาหาร",
    amount: 200,
    description: "มื้อเย็น",
  },
  {
    id: "8",
    date: "2023-10-06",
    type: "expense",
    category: "ค่าเดินทาง",
    amount: 45,
    description: "BTS",
  },
  {
    id: "9",
    date: "2023-10-07",
    type: "expense",
    category: "ค่าที่พัก",
    amount: 5500,
    description: "ค่าเช่า",
  },
  {
    id: "10",
    date: "2023-10-08",
    type: "expense",
    category: "ค่าอาหาร",
    amount: 150,
    description: "ข้าวกล่อง",
  },
  {
    id: "11",
    date: "2023-10-09",
    type: "expense",
    category: "บันเทิง",
    amount: 300,
    description: "ดูหนัง",
  },
  {
    id: "12",
    date: "2023-10-10",
    type: "expense",
    category: "ค่าอาหาร",
    amount: 90,
    description: "มื้อเช้า",
  },
  {
    id: "13",
    date: "2023-10-10",
    type: "expense",
    category: "ค่าเดินทาง",
    amount: 45,
    description: "BTS",
  },
];

const ITEMS_PER_PAGE = 10; // (ตามที่คุณขอ) จำกัดทีละ 10 ข้อมูล

/**
 * หน้าประวัติทั้งหมด (History Page)
 * แสดงรายการธุรกรรมทั้งหมด พร้อมระบบแบ่งหน้า (Pagination)
 */
function HistoryPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // --- Logic การแบ่งหน้า (Pagination Logic) ---
  const totalItems = mockTransactions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // คำนวณรายการที่จะแสดงในหน้าปัจจุบัน
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = mockTransactions.slice(startIndex, endIndex);

  // ฟังก์ชันเปลี่ยนหน้า
  const goToPreviousPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : totalPages));
  };

  // ลบ mockNavigate

  /**
   * แสดงไอคอนและสีตามประเภท
   */
  const TransactionIcon = ({ type }: { type: TransactionType }) => {
    if (type === "income") return <IncomeIcon />;
    if (type === "expense") return <ExpenseIcon />;
    // (สามารถเพิ่มไอคอน 'transfer' ได้ในอนาคต)
    return <ExpenseIcon />; // Default
  };

  const getAmountColor = (type: TransactionType) => {
    return type === "income" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">ประวัติทั้งหมด</h1>
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* --- รายการธุรกรรม (Transaction List) --- */}
          {currentItems.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {currentItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <span className="p-2 rounded-full bg-gray-100">
                      <TransactionIcon type={item.type} />
                    </span>
                    <div>
                      <p className="text-md font-semibold text-gray-800">
                        {item.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-md font-bold ${getAmountColor(
                        item.type
                      )}`}
                    >
                      {item.type === "income" ? "+" : "-"}
                      {item.amount.toLocaleString()} ฿
                    </p>
                    <p className="text-sm text-gray-400">{item.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 p-8">ไม่พบข้อมูล</p>
          )}

          {/* --- Pagination Controls --- */}
          {totalItems > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              {/* ปุ่มก่อนหน้า */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon />
                <span className="ml-1">ก่อนหน้า</span>
              </button>

              {/* สถานะหน้า */}
              <span className="text-sm text-gray-500">
                หน้า {currentPage} / {totalPages}
              </span>

              {/* ปุ่มถัดไป */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="mr-1">ถัดไป</span>
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default HistoryPage;
