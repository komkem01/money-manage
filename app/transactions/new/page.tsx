"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { createTransaction } from '@/lib/transactions';
import { getAllAccounts } from '@/lib/accounts';
import { getAllCategories } from '@/lib/categories';
import { getAuthToken } from '@/lib/auth';
import { Account, Category } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import AlertBanner from '@/components/ui/AlertBanner';

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
  const [transferCategory, setTransferCategory] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transferFromAccount, setTransferFromAccount] = useState("");
  const [transferToAccount, setTransferToAccount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // วันที่ปัจจุบัน
  
  // State สำหรับ highlight บัญชีที่เปลี่ยนแปลง
  const [updatedAccounts, setUpdatedAccounts] = useState<Set<string>>(new Set());

  // โหลดข้อมูลเริ่มต้น
  // โหลดข้อมูลบัญชีและหมวดหมู่
  const loadReferenceData = useCallback(async () => {
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
        const nextCategories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [categoriesResponse.data];
        setCategories(nextCategories);

        if (!selectedCategory) {
          const firstExpense = nextCategories.find(cat => cat.type?.name === 'Expense');
          if (firstExpense) {
            setSelectedCategory(firstExpense.id);
          }
        }

        if (!transferCategory) {
          const firstTransferCategory = nextCategories.find(cat => cat.type?.name === 'Transfer');
          if (firstTransferCategory) {
            setTransferCategory(firstTransferCategory.id);
          }
        }
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
  }, [router]);

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
  }, [loadReferenceData]);

  useEffect(() => {
    if (!categories.length) return;

    if (activeTab === 'expense') {
      const expenseCategories = categories.filter(cat => cat.type?.name === 'Expense');
      if (expenseCategories.length === 0) {
        return;
      }
      const isValid = expenseCategories.some(cat => cat.id === selectedCategory);
      if (!isValid) {
        setSelectedCategory(expenseCategories[0].id);
      }
    } else if (activeTab === 'income') {
      const incomeCategories = categories.filter(cat => cat.type?.name === 'Income');
      if (incomeCategories.length === 0) {
        return;
      }
      const isValid = incomeCategories.some(cat => cat.id === selectedCategory);
      if (!isValid) {
        setSelectedCategory(incomeCategories[0].id);
      }
    } else {
      const transferCategories = categories.filter(cat => cat.type?.name === 'Transfer');
      if (transferCategories.length === 0) {
        return;
      }
      const isValid = transferCategories.some(cat => cat.id === transferCategory);
      if (!isValid) {
        setTransferCategory(transferCategories[0].id);
      }
    }
  }, [categories, activeTab, selectedCategory, transferCategory]);

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

      // Validate required fields
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        alert("กรุณาใส่จำนวนเงินที่ถูกต้อง");
        setIsSubmitting(false);
        return;
      }

      if (!date) {
        alert("กรุณาเลือกวันที่");
        setIsSubmitting(false);
        return;
      }

      let transactionData;

      if (activeTab === "transfer") {
        if (!transferFromAccount || !transferToAccount) {
          alert("กรุณาเลือกบัญชีต้นทางและปลายทาง");
          setIsSubmitting(false);
          return;
        }
        
        if (transferFromAccount === transferToAccount) {
          alert("บัญชีต้นทางและปลายทางต้องไม่ซ้ำกัน");
          setIsSubmitting(false);
          return;
        }

        // ตรวจสอบยอดเงินในบัญชีต้นทาง
        const fromAccount = accounts.find(acc => acc.id === transferFromAccount);
        if (fromAccount) {
          const currentBalance = parseFloat(fromAccount.balance || fromAccount.amount || '0');
          const transferAmount = parseFloat(amount);
          
          console.log('Transfer validation:', {
            account: fromAccount.name,
            currentBalance,
            transferAmount,
            sufficient: currentBalance >= transferAmount
          });
          
          if (currentBalance < transferAmount) {
            alert(`ยอดเงินในบัญชี "${fromAccount.name}" ไม่เพียงพอ\nยอดคงเหลือ: ${currentBalance.toLocaleString()} บาท\nต้องการโอน: ${transferAmount.toLocaleString()} บาท`);
            setIsSubmitting(false);
            return;
          }
        }
        
        if (!transferCategory) {
          alert("กรุณาเลือกหมวดหมู่สำหรับการโยกย้ายเงิน");
          setIsSubmitting(false);
          return;
        }

        // สำหรับ transfer บันทึก account_id (บัญชีต้นทาง) และ related_account_id (บัญชีปลายทาง)
        transactionData = {
          amount: parseFloat(amount),
          description: description || "โอนเงิน",
          date: date, // ส่งเป็น string ให้หลังบ้านแปลงเป็น Unix timestamp
          account_id: transferFromAccount, // บัญชีต้นทาง (เงินออก)
          related_account_id: transferToAccount, // บัญชีปลายทาง (เงินเข้า)
          category_id: transferCategory,
        };
      } else {
        // ตรวจสอบยอดเงินสำหรับรายจ่าย
        if (activeTab === "expense") {
          const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);
          if (selectedAccountData) {
            const currentBalance = parseFloat(selectedAccountData.balance || selectedAccountData.amount || '0');
            const expenseAmount = parseFloat(amount);
            
            console.log('Expense validation:', {
              account: selectedAccountData.name,
              currentBalance,
              expenseAmount,
              sufficient: currentBalance >= expenseAmount
            });
            
            if (currentBalance < expenseAmount) {
              alert(`ยอดเงินในบัญชี "${selectedAccountData.name}" ไม่เพียงพอ\nยอดคงเหลือ: ${currentBalance.toLocaleString()} บาท\nต้องการจ่าย: ${expenseAmount.toLocaleString()} บาท`);
              setIsSubmitting(false);
              return;
            }
          }
        }

        transactionData = {
          amount: parseFloat(amount),
          description,
          date: date, // ส่งเป็น string ให้หลังบ้านแปลงเป็น Unix timestamp
          account_id: selectedAccount,
          category_id: selectedCategory,
        };
      }

      console.log('Sending transaction data to API:', {
        ...transactionData,
        dateOriginal: date,
        dateAsString: transactionData.date,
        isDateValid: !isNaN(new Date(date).getTime())
      });

      const response = await createTransaction(transactionData);
      
      console.log('API Response:', response);
      
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
    setTransferCategory('');
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
        <div className="relative">
          <label
            htmlFor="transferCategory"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            หมวดหมู่การโยกย้าย
          </label>
          <div className="relative">
            <select
              id="transferCategory"
              value={transferCategory}
              onChange={(e) => setTransferCategory(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-500 appearance-none shadow-sm"
            >
              <option value="" disabled>
                เลือกหมวดหมู่
              </option>
              {categories
                .filter(cat => cat.type?.name === 'Transfer')
                .map((cat) => (
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

          {/* จากบัญชี */}
          <div className="relative">
            <label
              htmlFor="transferFromAccount"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              จากบัญชี
            </label>
            <div className="relative">
              <select
                id="transferFromAccount"
                value={transferFromAccount}
                onChange={(e) => setTransferFromAccount(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-500 appearance-none shadow-sm"
              >
                <option value="" disabled>
                  เลือกบัญชีต้นทาง
                </option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (คงเหลือ: {parseFloat(acc.balance || acc.amount || '0').toLocaleString()} บาท)
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
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              ไปยังบัญชี
            </label>
            <div className="relative">
              <select
                id="transferToAccount"
                value={transferToAccount}
                onChange={(e) => setTransferToAccount(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-500 appearance-none shadow-sm"
              >
                <option value="" disabled>
                  เลือกบัญชีปลายทาง
                </option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (คงเหลือ: {parseFloat(acc.balance || acc.amount || '0').toLocaleString()} บาท)
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
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            หมวดหมู่
          </label>
          <div className="relative">
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-500 appearance-none shadow-sm"
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
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            บัญชี
          </label>
          <div className="relative">
            <select
              id="account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-500 appearance-none shadow-sm"
            >
              <option value="" disabled>
                เลือกบัญชี
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (คงเหลือ: {parseFloat(acc.balance || acc.amount || '0').toLocaleString()} บาท)
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

  const tabPalette: Record<TransactionType, {
    gradient: string;
    shadow: string;
    inactive: string;
    badge: string;
    accent: string;
    subtle: string;
    ring: string;
  }> = {
    expense: {
      gradient: 'from-rose-500 via-red-400 to-orange-400',
      shadow: 'shadow-red-500/40',
      inactive: 'text-slate-500 hover:bg-white hover:text-slate-700',
      badge: 'bg-rose-100 text-rose-700',
      accent: 'text-rose-500',
      subtle: 'bg-rose-500/10',
      ring: 'ring-rose-400/30',
    },
    income: {
      gradient: 'from-emerald-500 via-emerald-400 to-teal-400',
      shadow: 'shadow-emerald-500/40',
      inactive: 'text-slate-500 hover:bg-white hover:text-slate-700',
      badge: 'bg-emerald-100 text-emerald-700',
      accent: 'text-emerald-500',
      subtle: 'bg-emerald-500/10',
      ring: 'ring-emerald-400/30',
    },
    transfer: {
      gradient: 'from-sky-500 via-blue-500 to-indigo-500',
      shadow: 'shadow-sky-500/40',
      inactive: 'text-slate-500 hover:bg-white hover:text-slate-700',
      badge: 'bg-sky-100 text-sky-700',
      accent: 'text-sky-500',
      subtle: 'bg-sky-500/10',
      ring: 'ring-sky-400/30',
    },
  };

  const getTabClass = (tabName: TransactionType) => {
    const palette = tabPalette[tabName];
    const isActive = activeTab === tabName;
    return `flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
      isActive
        ? `bg-gradient-to-r ${palette.gradient} text-white shadow-md ${palette.shadow}`
        : 'text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-sm'
    }`;
  };

  const tabCopy: Record<TransactionType, {
    label: string;
    blurb: string;
    helper: string;
  }> = {
    expense: {
      label: 'รายการรายจ่าย',
      blurb: 'บันทึกการใช้จ่ายเพื่อรู้ทันกระแสเงินออกในทุกวัน',
      helper: 'กรอกจำนวนเงิน เลือกหมวดหมู่ และบัญชีที่ใช้จ่าย',
    },
    income: {
      label: 'รายการรายรับ',
      blurb: 'ติดตามรายได้ให้ครบ เพื่อเห็นภาพรวมการเติบโตของเงิน',
      helper: 'ระบุจำนวนเงิน เลือกหมวดหมู่ และบัญชีที่รับเงินเข้า',
    },
    transfer: {
      label: 'การโยกย้ายเงิน',
      blurb: 'ย้ายเงินระหว่างบัญชีอย่างเป็นระเบียบและปลอดภัย',
      helper: 'เลือกหมวดหมู่ บัญชีต้นทาง และปลายทางให้ครบถ้วน',
    },
  };

  const palette = tabPalette[activeTab];
  const activeCopy = tabCopy[activeTab];
  const heroIcons: Record<TransactionType, React.ReactNode> = {
    expense: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
    income: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 19V6m0 0l-4 4m4-4l4 4"
        />
      </svg>
    ),
    transfer: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h9m0 0L11 3m4 4-4 4m3 6h-9m0 0 4 4m-4-4 4-4" />
      </svg>
    ),
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-inter">
        {showToast && (
          <div className="fixed top-6 left-1/2 z-50 w-full max-w-sm -translate-x-1/2">
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/95 px-4 py-4 shadow-2xl shadow-emerald-500/40 backdrop-blur">
              <CheckCircleIcon />
              <div>
                <p className="font-semibold leading-tight text-white">บันทึกรายการสำเร็จ!</p>
                <p className="mt-1 text-sm text-emerald-50/90">ยอดเงินอัปเดตแล้ว ระบบกำลังรีเฟรชข้อมูล...</p>
              </div>
            </div>
          </div>
        )}

        <header className="relative z-10 px-4 pt-8 pb-6">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <button
              onClick={() => router.push('/transactions')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:border-slate-400"
            >
              <ArrowLeftIcon />
              กลับไปหน้ารายการ
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-slate-800">บันทึกรายการใหม่</h1>
              <p className="mt-2 text-sm text-slate-600">
                จัดสรรเงินเข้า-ออกได้อย่างมั่นใจด้วยแบบฟอร์มที่ออกแบบมาเพื่อคุณ
              </p>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-2xl px-4 pb-14">
          {error && (
            <div className="mb-5">
              <AlertBanner
                tone="error"
                title="เกิดข้อผิดพลาด"
                message={error}
                onDismiss={() => setError('')}
                actions={(
                  <button
                    onClick={loadReferenceData}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
                  >
                    ลองใหม่
                  </button>
                )}
              />
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className={`flex items-start gap-4 rounded-t-2xl border-b border-slate-200 px-6 py-5 ${palette.subtle}`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${palette.gradient} shadow-lg`}>
                {heroIcons[activeTab]}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {activeCopy.label}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-800">{activeCopy.blurb}</h2>
                <p className="mt-2 text-sm text-slate-600">{activeCopy.helper}</p>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-3 border-b border-slate-200 px-6 py-5 text-slate-600">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                <span>กำลังโหลดข้อมูลประกอบ...</span>
              </div>
            )}

              <div className="px-6 py-6">
                <div className="flex gap-2 rounded-xl bg-slate-100 p-1.5">
                  <button type="button" className={getTabClass('expense')} onClick={() => setActiveTab('expense')}>
                    รายจ่าย
                  </button>
                  <button type="button" className={getTabClass('income')} onClick={() => setActiveTab('income')}>
                    รายรับ
                  </button>
                  <button type="button" className={getTabClass('transfer')} onClick={() => setActiveTab('transfer')}>
                    โยกย้าย
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 mb-2">
                      จำนวนเงิน
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      placeholder="0.00"
                      step="0.01"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  {renderFormContent()}

                  <div>
                    <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-2">
                      วันที่
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-slate-900 shadow-sm transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      />
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <CalendarIcon />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                      รายละเอียด (ไม่บังคับ)
                    </label>
                    <input
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="เช่น กาแฟยามเช้า หรือ โบนัสปลายปี"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full rounded-xl bg-gradient-to-r ${palette.gradient} py-3.5 text-base font-semibold text-white shadow-lg transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${palette.shadow}`}
                  >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
                  </button>
                </form>
              </div>
            </div>
        </main>
      </div>
    </AuthGuard>
  );
}

export default NewTransactionPage;
