"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createTransaction } from '@/lib/transactions';
import { getAllAccounts, Account } from '@/lib/accounts';
import { getAllCategories, Category } from '@/lib/categories';
import { getAuthToken } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

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
const CheckCircleIcon = () => (
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
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
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
const TagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 7h.01M7 3h5l5.414 5.414a2 2 0 010 2.828l-5.414 5.414A2 2 0 017 17H3a2 2 0 01-2-2V7a2 2 0 012-2h4z"
    />
  </svg>
);
const TransferIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
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

// --- ประเภทข้อมูล (Types) ---
type TransactionType = "expense" | "income" | "transfer";

// ไม่ต้องใช้ mock data แล้ว เพราะจะดึงจาก API

/**
 * หน้าบันทึกรายการใหม่ (New Transaction Page)
 * /pages/transaction/new.tsx
 */
function NewTransactionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Data from API
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // State สำหรับฟอร์ม
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transferFromAccount, setTransferFromAccount] = useState("");
  const [transferToAccount, setTransferToAccount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // วันที่ปัจจุบัน
  
  // State สำหรับ highlight บัญชีที่เปลี่ยนแปลง
  const [updatedAccounts, setUpdatedAccounts] = useState<Set<string>>(new Set());

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    console.log('Component mounted, loading reference data...');
    
    // Debug token information
    const token = getAuthToken();
    console.log('Token check on mount:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
      localStorage: typeof window !== 'undefined' ? localStorage.getItem('authToken') : 'N/A',
      cookieHasAuth: typeof window !== 'undefined' ? document.cookie.includes('authToken') : 'N/A'
    });
    
    loadReferenceData();
  }, []);

  // โหลดข้อมูลบัญชีและหมวดหมู่
  const loadReferenceData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      console.log('Getting auth token...');
      const token = getAuthToken();
      console.log('Token status:', { 
        hasToken: !!token, 
        tokenLength: token?.length || 0,
        localStorage: typeof window !== 'undefined' ? !!localStorage.getItem('authToken') : 'N/A',
        cookie: typeof window !== 'undefined' ? document.cookie.includes('authToken') : 'N/A'
      });
      
      if (!token) {
        console.error('No authentication token found');
        setError('ไม่พบ authentication token กรุณาเข้าสู่ระบบใหม่');
        setLoading(false);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      console.log('Loading reference data with token present');
      console.log('Making API calls to:', {
        accountsUrl: 'http://192.168.1.44:5000/api/accounts',
        categoriesUrl: 'http://192.168.1.44:5000/api/categories'
      });

      // Test backend connection first
      try {
        const healthCheck = await fetch('http://192.168.1.44:5000/health');
        console.log('Backend health check:', healthCheck.status, await healthCheck.text());
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์รันอยู่');
        setLoading(false);
        return;
      }

      const [accountsResponse, categoriesResponse] = await Promise.all([
        getAllAccounts().catch(err => {
          console.error('Accounts API error:', err);
          return { success: false, message: 'Failed to fetch accounts: ' + err.message };
        }),
        getAllCategories().catch(err => {
          console.error('Categories API error:', err);
          return { success: false, message: 'Failed to fetch categories: ' + err.message };
        })
      ]);

      console.log('API Responses:', {
        accounts: accountsResponse,
        categories: categoriesResponse
      });

      if (accountsResponse.success && 'data' in accountsResponse && accountsResponse.data) {
        setAccounts(accountsResponse.data);
      } else {
        console.error('Failed to load accounts:', accountsResponse);
        setError(accountsResponse.message || 'ไม่สามารถโหลดข้อมูลบัญชีได้');
      }

      if (categoriesResponse.success && 'data' in categoriesResponse && categoriesResponse.data) {
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [categoriesResponse.data]);
      } else {
        console.error('Failed to load categories:', categoriesResponse);
        setError(categoriesResponse.message || 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
      }
    } catch (error: any) {
      console.error('Load reference data error:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      
      if (error.message?.includes('authentication') || error.message?.includes('token')) {
        errorMessage = 'การยืนยันตัวตนล้มเหลว กรุณาเข้าสู่ระบบใหม่';
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (error.message?.includes('fetch')) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * รีเฟรชข้อมูลบัญชีหลังจากทำธุรกรรม
   */
  const refreshAccountData = async (affectedAccountIds: string[] = []) => {
    try {
      console.log('Refreshing account data...');
      const accountsResponse = await getAllAccounts();
      
      if (accountsResponse.success && 'data' in accountsResponse && accountsResponse.data) {
        console.log('Previous accounts:', accounts.map(acc => ({ id: acc.id, name: acc.name, balance: acc.balance })));
        console.log('New accounts:', accountsResponse.data.map((acc: Account) => ({ id: acc.id, name: acc.name, balance: acc.balance })));
        
        setAccounts(accountsResponse.data);
        
        // Highlight บัญชีที่มีการเปลี่ยนแปลง
        if (affectedAccountIds.length > 0) {
          setUpdatedAccounts(new Set(affectedAccountIds));
          // เคลียร์ highlight หลังจาก 5 วินาที เพื่อให้เห็นการเปลี่ยนแปลงชัดเจน
          setTimeout(() => {
            setUpdatedAccounts(new Set());
          }, 5000);
        }
        
        console.log('Account data refreshed successfully');
      } else {
        console.error('Failed to refresh accounts:', accountsResponse);
      }
    } catch (error) {
      console.error('Error refreshing account data:', error);
    }
  };

  /**
   * จัดการการส่งฟอร์ม
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      let transactionData;

      if (activeTab === "transfer") {
        if (!transferFromAccount || !transferToAccount) {
          alert("กรุณาเลือกบัญชีต้นทางและปลายทาง");
          return;
        }
        
        if (transferFromAccount === transferToAccount) {
          alert("บัญชีต้นทางและปลายทางต้องไม่ซ้ำกัน");
          return;
        }

        // ตรวจสอบยอดเงินในบัญชีต้นทาง
        const fromAccount = accounts.find(acc => acc.id === transferFromAccount);
        if (fromAccount) {
          const currentBalance = parseFloat(fromAccount.balance || '0');
          const transferAmount = parseFloat(amount);
          
          console.log('Transfer validation:', {
            account: fromAccount.name,
            currentBalance,
            transferAmount,
            sufficient: currentBalance >= transferAmount
          });
          
          if (currentBalance < transferAmount) {
            alert(`ยอดเงินในบัญชี "${fromAccount.name}" ไม่เพียงพอ\nยอดคงเหลือ: ${currentBalance.toLocaleString()} บาท\nต้องการโอน: ${transferAmount.toLocaleString()} บาท`);
            return;
          }
        }
        
        // สำหรับ transfer บันทึก account_id (บัญชีต้นทาง) และ related_account_id (บัญชีปลายทาง)
        transactionData = {
          amount: parseFloat(amount),
          description: description || "โอนเงิน",
          date: date,
          account_id: transferFromAccount, // บัญชีต้นทาง (เงินออก)
          related_account_id: transferToAccount, // บัญชีปลายทาง (เงินเข้า)
          category_id: selectedCategory || categories.find(cat => cat.type?.name === "Transfer")?.id || categories[0]?.id,
        };
      } else {
        // ตรวจสอบยอดเงินสำหรับรายจ่าย
        if (activeTab === "expense") {
          const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);
          if (selectedAccountData) {
            const currentBalance = parseFloat(selectedAccountData.balance || '0');
            const expenseAmount = parseFloat(amount);
            
            console.log('Expense validation:', {
              account: selectedAccountData.name,
              currentBalance,
              expenseAmount,
              sufficient: currentBalance >= expenseAmount
            });
            
            if (currentBalance < expenseAmount) {
              alert(`ยอดเงินในบัญชี "${selectedAccountData.name}" ไม่เพียงพอ\nยอดคงเหลือ: ${currentBalance.toLocaleString()} บาท\nต้องการจ่าย: ${expenseAmount.toLocaleString()} บาท`);
              return;
            }
          }
        }

        transactionData = {
          amount: parseFloat(amount),
          description,
          date: date,
          account_id: selectedAccount,
          category_id: selectedCategory,
        };
      }

      const response = await createTransaction(transactionData);
      
      if (response.success) {
        // อัปเดตข้อมูลบัญชีหลังจากบันทึกธุรกรรมสำเร็จ
        console.log('Transaction created successfully:', response.data);
        console.log('Refreshing account data...');
        
        // กำหนดบัญชีที่ได้รับผลกระทบ
        const affectedAccounts = activeTab === "transfer" 
          ? [transferFromAccount, transferToAccount].filter(Boolean)
          : [selectedAccount].filter(Boolean);
        
        console.log('Affected accounts:', affectedAccounts);
        
        await refreshAccountData(affectedAccounts);
        
        // รีเซ็ตฟอร์ม
        setAmount('');
        setDescription('');
        setSelectedCategory('');
        setSelectedAccount('');
        setTransferFromAccount('');
        setTransferToAccount('');
        
        setShowToast(true);
        
        // ให้ผู้ใช้เห็นยอดเงินใหม่ก่อนไปหน้าอื่น
        setTimeout(() => {
          router.push("/transactions");
        }, 3000); // เพิ่มเวลาให้เห็นการเปลี่ยนแปลงชัด
      } else {
        throw new Error(response.error || 'เกิดข้อผิดพลาดในการสร้างธุรกรรม');
      }
    } catch (error: any) {
      console.error('Create transaction error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการสร้างธุรกรรม');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ลบ mockNavigate

  /**
   * Render ฟอร์มตาม Tab ที่เลือก
   */
  const renderFormContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      );
    }

    if (activeTab === "transfer") {
      // --- ฟอร์มสำหรับ "โยกย้าย" ---
      return (
        <div className="space-y-4">
          {/* จากบัญชี */}
          <div className="relative">
            <label
              htmlFor="transferFromAccount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              จากบัญชี
            </label>
            <div className="relative">
              <select
                id="transferFromAccount"
                value={transferFromAccount}
                onChange={(e) => setTransferFromAccount(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="" disabled>
                  เลือกบัญชีต้นทาง
                </option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (คงเหลือ: {parseFloat(acc.balance || '0').toLocaleString()} บาท)
                    {updatedAccounts.has(acc.id) ? ' ✨ อัปเดตแล้ว' : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <WalletIcon />
              </div>
            </div>
          </div>

          {/* ไปยังบัญชี */}
          <div className="relative">
            <label
              htmlFor="transferToAccount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ไปยังบัญชี
            </label>
            <div className="relative">
              <select
                id="transferToAccount"
                value={transferToAccount}
                onChange={(e) => setTransferToAccount(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="" disabled>
                  เลือกบัญชีปลายทาง
                </option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (คงเหลือ: {parseFloat(acc.balance || '0').toLocaleString()} บาท)
                    {updatedAccounts.has(acc.id) ? ' ✨ อัปเดตแล้ว' : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TransferIcon />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- ฟอร์มสำหรับ "รายจ่าย" และ "รายรับ" ---
    const filteredCategories = categories.filter(cat => {
      const expectedType = activeTab === "expense" ? "Expense" : "Income";
      return cat.type?.name === expectedType;
    });

    return (
      <div className="space-y-4">
        {/* เลือกหมวดหมู่ */}
        <div className="relative">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            หมวดหมู่
          </label>
          <div className="relative">
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="" disabled>
                เลือกหมวดหมู่
              </option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TagIcon />
            </div>
          </div>
        </div>

        {/* เลือกบัญชี */}
        <div className="relative">
          <label
            htmlFor="account"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            บัญชี
          </label>
          <div className="relative">
            <select
              id="account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="" disabled>
                เลือกบัญชี
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (คงเหลือ: {parseFloat(acc.balance || '0').toLocaleString()} บาท)
                  {updatedAccounts.has(acc.id) ? ' ✨ อัปเดตแล้ว' : ''}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <WalletIcon />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getTabClass = (tabName: TransactionType) => {
    const isActive = activeTab === tabName;
    let activeClasses = "";
    if (tabName === "expense") activeClasses = "bg-red-600 text-white";
    if (tabName === "income") activeClasses = "bg-green-600 text-white";
    if (tabName === "transfer") activeClasses = "bg-blue-600 text-white";

    const inactiveClasses = "text-gray-500 bg-gray-100 hover:bg-gray-200";

    return `w-full py-3 text-center font-bold rounded-t-lg transition-all ${
      isActive ? activeClasses : inactiveClasses
    }`;
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100 font-inter">
        {/* --- Toast (ข้อความแจ้งเตือน) --- */}
        {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
          <div className="p-4 rounded-lg shadow-lg bg-green-500 text-white animate-bounce">
            <div className="flex items-center mb-2">
              <CheckCircleIcon />
              <span className="ml-3 font-semibold">บันทึกรายการสำเร็จ!</span>
            </div>
            <div className="text-sm text-green-100">
              💰 ยอดเงินในบัญชีได้รับการอัปเดตแล้ว
              <br />
              🔄 กำลังโหลดข้อมูลใหม่...
            </div>
          </div>
        </div>
      )}

      {/* --- Header --- */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center relative">
          <button
            onClick={() => router.push("/transactions")}
            className="absolute left-0 flex items-center px-2 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-100"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
            บันทึกรายการใหม่
          </h1>
        </div>
      </header>

      {/* --- Main Content (Form) --- */}
      <main className="max-w-md mx-auto p-4">
        {/* --- Loading State --- */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-blue-700">กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        )}

        {/* --- Error State --- */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadReferenceData}
              className="mt-2 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              ลองใหม่
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* --- Tabs --- */}
          <div className="flex">
            <button
              className={getTabClass("expense")}
              onClick={() => setActiveTab("expense")}
            >
              รายจ่าย
            </button>
            <button
              className={getTabClass("income")}
              onClick={() => setActiveTab("income")}
            >
              รายรับ
            </button>
            <button
              className={getTabClass("transfer")}
              onClick={() => setActiveTab("transfer")}
            >
              โยกย้าย
            </button>
          </div>

          {/* --- Form --- */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* จำนวนเงิน */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                จำนวนเงิน
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            {/* ส่วนที่เปลี่ยนตาม Tab */}
            {renderFormContent()}

            {/* วันที่ */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                วันที่
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon />
                </div>
              </div>
            </div>

            {/* รายละเอียด */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                รายละเอียด (ไม่บังคับ)
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น ค่ากาแฟ"
              />
            </div>

            {/* ปุ่มบันทึก */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-bold py-3 px-4 rounded-lg text-white transition duration-300 shadow-md ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              }`}
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกรายการ"}
            </button>
          </form>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}

export default NewTransactionPage;
