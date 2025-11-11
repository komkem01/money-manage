"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getUserData, removeAuthToken, removeUserData, getAuthToken } from '@/lib/auth';
import { getAllAccounts, Account } from '@/lib/accounts';
import { getAllTransactions } from '@/lib/transactions';
import AuthGuard from '@/components/AuthGuard';

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

// (ใหม่) เพิ่ม WalletIcon
const WalletIcon = () => (
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
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

// --- Interface Definitions ---
interface DashboardData {
  userName: string;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: any[];
  accounts: Account[];
}

interface DashboardTransaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  date: string;
  account?: {
    name: string;
  };
  category?: {
    name: string;
    type?: {
      name: string;
    };
  };
}

/**
 * หน้าหลัก (Dashboard)
 * แสดงภาพรวมทางการเงินและเมนูลัดต่างๆ
 */
function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({
    userName: "",
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    recentTransactions: [],
    accounts: []
  });
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  /**
   * โหลดข้อมูล Dashboard จาก API
   */
  const loadDashboardData = async (userData: any) => {
    try {
      setLoading(true);
      setError('');

      console.log('Loading dashboard data...');

      // โหลดข้อมูลบัญชีทั้งหมด
      const accountsResponse = await getAllAccounts();
      console.log('Accounts response:', accountsResponse);

      let accounts: Account[] = [];
      let totalBalance = 0;

      if (accountsResponse.success && accountsResponse.data) {
        accounts = accountsResponse.data;
        totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance || '0'), 0);
      }

      // โหลดธุรกรรมล่าสุด (30 รายการ)
      const transactionsResponse = await getAllTransactions(1, 30);
      console.log('Transactions response:', transactionsResponse);

      let recentTransactions: DashboardTransaction[] = [];
      let totalIncome = 0;
      let totalExpense = 0;

      if (transactionsResponse.success && transactionsResponse.data) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // แปลงข้อมูลธุรกรรมและคำนวณสถิติ
        recentTransactions = transactionsResponse.data.slice(0, 3).map((tx: any) => {
          const txDate = new Date(parseInt(tx.date));
          const amount = parseFloat(tx.amount);
          
          // คำนวณรายรับ/รายจ่ายเฉพาะเดือนปัจจุบัน
          if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
            if (tx.category?.type?.name === 'Income') {
              totalIncome += amount;
            } else if (tx.category?.type?.name === 'Expense') {
              totalExpense += amount;
            }
          }

          return {
            id: tx.id,
            description: tx.description || tx.category?.name || 'ไม่ระบุ',
            amount: amount,
            type: tx.category?.type?.name?.toLowerCase() as "income" | "expense" | "transfer",
            date: txDate.toISOString().split('T')[0],
            account: tx.account,
            category: tx.category
          };
        });
      }

      // อัปเดตข้อมูล
      setData({
        userName: userData.displayname || userData.firstname || 'ผู้ใช้',
        totalBalance,
        totalIncome,
        totalExpense,
        recentTransactions,
        accounts
      });

      console.log('Dashboard data loaded:', {
        totalBalance,
        totalIncome,
        totalExpense,
        transactionsCount: recentTransactions.length,
        accountsCount: accounts.length
      });

    } catch (error: any) {
      console.error('Load dashboard data error:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // ตรวจสอบการเข้าสู่ระบบและโหลดข้อมูล user
  useEffect(() => {
    console.log("Dashboard: Checking authentication...");
    
    const token = getAuthToken();
    const userData = getUserData();
    
    console.log("Dashboard: Token:", !!token);
    console.log("Dashboard: User data:", userData);
    
    if (!token || !userData) {
      // ถ้าไม่มี token หรือ user data ให้กลับไปหน้า login
      console.log("Dashboard: No token or user data, redirecting to login");
      router.push('/login');
      return;
    }

    // ตั้งค่าข้อมูล user
    setUser(userData);
    console.log("Dashboard: User set successfully");
    
    // โหลดข้อมูล Dashboard จาก API
    loadDashboardData(userData);
  }, [router]);

  // Refresh data เมื่อ component กลับมา focus
  useEffect(() => {
    const handleFocus = () => {
      const userData = getUserData();
      if (userData && !loading) {
        console.log('Dashboard: Page focused, refreshing data...');
        loadDashboardData(userData);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loading]);

  /**
   * จัดการการออกจากระบบ
   */
  const handleLogout = () => {
    console.log("Logout initiated...");
    setShowLogoutToast(true);

    // ลบ token และ user data
    removeAuthToken();
    removeUserData();

    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  // ลบ mockNavigate

  return (
    <AuthGuard>
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
              <h1 className="text-2xl font-bold text-blue-600">MyExpenses</h1>
            </div>

            {/* ชื่อผู้ใช้และปุ่มต่างๆ */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 mr-4 hidden md:block">
                สวัสดี, <span className="font-medium">{data.userName}</span>!
              </span>
              
              {/* ปุ่ม Refresh */}
              <button
                onClick={() => {
                  const userData = getUserData();
                  if (userData) loadDashboardData(userData);
                }}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                title="รีเฟรชข้อมูล"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="ml-1 hidden md:inline">รีเฟรช</span>
              </button>

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
        {/* --- Loading State --- */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        )}

        {/* --- Error State --- */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => {
                const userData = getUserData();
                if (userData) loadDashboardData(userData);
              }}
              className="mt-2 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
        {/* Content wrapper เพื่อซ่อนเมื่อ loading หรือ error */}
        {/* --- 1. ภาพรวม (Overview Section) --- */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">ภาพรวม</h2>
          
          {/* แสดงข้อมูลสรุปบัญชี */}
          {data.accounts.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                บัญชีของคุณ ({data.accounts.length} บัญชี)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.accounts.map((account) => (
                  <div key={account.id} className="bg-white p-3 rounded border">
                    <p className="font-medium text-gray-800">{account.name}</p>
                    <p className="text-sm text-blue-600 font-semibold">
                      ฿{parseFloat(account.balance || '0').toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* การ์ด: ยอดคงเหลือ */}
            <div className="bg-white p-6 rounded-lg shadow-lg transition-transform hover:scale-105">
              <h3 className="text-lg font-medium text-gray-500">ยอดคงเหลือ</h3>
              <p className="text-4xl font-extrabold text-blue-600 mt-2">
                ฿
                {data.totalBalance.toLocaleString("th-TH", {
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
          {/* (แก้ไข) ปรับ grid layout ให้รองรับ 4 ปุ่ม */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ปุ่ม: บันทึกรายรับ/รายจ่าย */}
            <button
              onClick={() => router.push("/transactions")}
              className="flex items-center justify-center p-4 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
            >
              <PlusCircleIcon />
              <span>บันทึกรายรับ/รายจ่าย</span>
            </button>

            {/* (ใหม่) ปุ่ม: จัดการบัญชี */}
            <button
              onClick={() => router.push("/accounts")}
              className="flex items-center justify-center p-4 bg-yellow-500 text-white font-medium rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition duration-300"
            >
              <WalletIcon />
              <span>จัดการบัญชี</span>
            </button>

            {/* ปุ่ม: จัดการหมวดหมู่ */}
            <button
              onClick={() => router.push("/type")}
              className="flex items-center justify-center p-4 bg-gray-700 text-white font-medium rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300"
            >
              <CogIcon />
              <span>จัดการหมวดหมู่ (ประเภท)</span>
            </button>

            {/* ปุ่ม: ดูประวัติทั้งหมด */}
            <button
              onClick={() => router.push("/history")}
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
              {data.recentTransactions.length === 0 ? (
                <li className="py-8 text-center text-gray-500">
                  ยังไม่มีรายการธุรกรรม
                </li>
              ) : (
                data.recentTransactions.map((tx: DashboardTransaction) => (
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
                        {tx.account && (
                          <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                            {tx.account.name}
                          </span>
                        )}
                      </p>
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        tx.type === "income" 
                          ? "text-green-600" 
                          : tx.type === "transfer"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.type === "income" ? "+" : tx.type === "transfer" ? "↔" : "-"}฿
                      {tx.amount.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
        </>
        )}
      </main>
      </div>
    </AuthGuard>
  );
}

export default DashboardPage;
