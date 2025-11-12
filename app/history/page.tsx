"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getAllTransactions } from '@/lib/transactions';
import { getAuthToken } from '@/lib/auth';
import { Transaction } from '@/lib/types';
import BackButton from '@/components/ui/BackButton';

// --- ไอคอน SVG ---
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

// ใช้ interface จาก API และเพิ่ม computed fields
interface DisplayTransaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
}

const ITEMS_PER_PAGE = 10; // จำกัดทีละ 10 ข้อมูล

/**
 * หน้าประวัติทั้งหมด (History Page)
 * แสดงรายการธุรกรรมทั้งหมด พร้อมระบบแบ่งหน้า (Pagination)
 */
function HistoryPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // แปลงข้อมูลจาก API เป็น DisplayTransaction format
  const transformApiTransaction = (apiTx: Transaction): DisplayTransaction => {
    // กำหนด type ตามประเภทของ category
    let type: TransactionType = "expense"; // default
    
    if (apiTx.category?.type?.name === "Income") {
      type = "income";
    } else if (apiTx.category?.type?.name === "Transfer") {
      type = "transfer";
    } else if (apiTx.category?.type?.name === "Expense") {
      type = "expense";
    }

    return {
      id: apiTx.id,
      date: new Date(parseInt(apiTx.date)).toLocaleDateString('th-TH'),
      type,
      category: apiTx.category?.name || 'ไม่ระบุ',
      amount: Math.round(parseFloat(apiTx.amount)), // amount เป็น Decimal แล้ว ไม่ต้องหาร 100
      description: apiTx.description || 'ไม่มีรายละเอียด',
    };
  };

  // โหลดข้อมูลธุรกรรม
  const loadTransactions = async (page: number = 1) => {
    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      console.log(`Loading transactions page ${page}...`);
      const response = await getAllTransactions(page, ITEMS_PER_PAGE);
      
      if (response.success && response.data) {
        const displayTransactions = response.data.map(transformApiTransaction);
        setTransactions(displayTransactions);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      } else {
        throw new Error(response.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (error: any) {
      console.error('Load transactions error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      
      if (error.message?.includes('authentication') || error.message?.includes('token')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // โหลดข้อมูลเมื่อ component mount หรือเมื่อ page เปลี่ยน
  useEffect(() => {
    loadTransactions(currentPage);
  }, [currentPage, router]);

  // ฟังก์ชันเปลี่ยนหน้า
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
          <BackButton href="/dashboard" label="กลับหน้าหลัก" />
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* --- Loading State --- */}
          {loading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          )}

          {/* --- Error State --- */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => loadTransactions(currentPage)}
                className="mt-2 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                ลองใหม่
              </button>
            </div>
          )}

          {/* --- รายการธุรกรรม (Transaction List) --- */}
          {!loading && !error && (
            transactions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {transactions.map((item: DisplayTransaction) => (
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
              <div className="text-center p-8">
                <p className="text-gray-500 text-lg">ไม่พบข้อมูลธุรกรรม</p>
                <p className="text-gray-400 text-sm mt-2">เริ่มต้นสร้างธุรกรรมแรกของคุณ</p>
              </div>
            )
          )}

          {/* --- Pagination Controls --- */}
          {!loading && !error && totalPages > 1 && (
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
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  หน้า {currentPage} / {totalPages}
                </span>
                <span className="text-xs text-gray-400">
                  ({totalItems} รายการ)
                </span>
              </div>

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
