"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getAllTransactions, deleteTransaction, updateTransaction } from '@/lib/transactions';
import { getAllAccounts } from '@/lib/accounts';
import { getAllCategories } from '@/lib/categories';
import { getAuthToken } from '@/lib/auth';
import { Transaction, Account, Category } from '@/lib/types';
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
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-yellow-600 hover:text-yellow-800"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-red-600 hover:text-red-800"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-green-400"
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
const ExclamationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-red-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

// --- ประเภทข้อมูล (Interfaces) ---
type TransactionType = "expense" | "income" | "transfer";

// Display transaction interface (transformed from API data)
interface DisplayTransaction {
  id: string;
  date: string;
  category: string;
  account: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  description?: string;
}

// --- ค่าคงที่ ---
const ITEMS_PER_PAGE = 10;

/**
 * หน้าประวัติรายการทั้งหมด (History Page)
 * แสดงรายการธุรกรรมทั้งหมด พร้อมระบบแบ่งหน้า (Pagination)
 * และปุ่มสำหรับ แก้ไข/ลบ
 */
function TransactionListPage() {
  const router = useRouter();
  
  // --- State ---
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showToast, setShowToast] = useState<string | null>(null);

  // State สำหรับ Modal (ลบ และ แก้ไข)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<DisplayTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Transform API transaction to display transaction
  const transformApiTransaction = (apiTx: Transaction): DisplayTransaction => {
    let type: TransactionType = "expense";
    
    if (apiTx.category?.type?.name === "Income") {
      type = "income";
    } else if (apiTx.category?.type?.name === "Transfer") {
      type = "transfer";
    } else if (apiTx.category?.type?.name === "Expense") {
      type = "expense";
    }

    return {
      id: apiTx.id,
      date: new Date(parseInt(apiTx.date)).toISOString().split('T')[0],
      category: apiTx.category?.name || 'ไม่ระบุ',
      account: apiTx.account?.name || 'ไม่ระบุ',
      amount: Math.round(parseFloat(apiTx.amount)), // amount เป็น Decimal แล้ว ไม่ต้องหาร 100
      type,
      categoryId: apiTx.category_id,
      accountId: apiTx.account_id,
      description: apiTx.description || '',
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

  // โหลดข้อมูลบัญชีและหมวดหมู่
  const loadReferenceData = async () => {
    try {
      const [accountsResponse, categoriesResponse] = await Promise.all([
        getAllAccounts(),
        getAllCategories()
      ]);

      if (accountsResponse.success && accountsResponse.data) {
        setAccounts(accountsResponse.data);
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [categoriesResponse.data]);
      }
    } catch (error: any) {
      console.error('Load reference data error:', error);
    }
  };

  // โหลดข้อมูลเมื่อ component mount หรือเมื่อ page เปลี่ยน
  useEffect(() => {
    loadTransactions(currentPage);
  }, [currentPage, router]);

  // โหลดข้อมูลอ้างอิงเมื่อ component mount
  useEffect(() => {
    loadReferenceData();
  }, []);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // --- Toast Logic ---
  const triggerToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => {
      setShowToast(null);
    }, 3000); // แสดง Toast 3 วินาที
  };

  // --- CRUD Logic ---

  // (L) Delete Logic
  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await deleteTransaction(id);
      
      if (response.success) {
        // รีเฟรชข้อมูลหลังจากลบ
        await loadTransactions(currentPage);
        setShowDeleteConfirm(null);
        triggerToast("ลบรายการสำเร็จ");
      } else {
        throw new Error(response.error || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error: any) {
      console.error('Delete transaction error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการลบธุรกรรม');
    } finally {
      setIsDeleting(false);
    }
  };

  // (E) Edit Logic
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showEditModal || isUpdating) return;

    try {
      setIsUpdating(true);
      
      const updateData = {
        amount: showEditModal.amount,
        description: showEditModal.description,
        transaction_date: showEditModal.date,
        account_id: showEditModal.accountId,
        category_id: showEditModal.categoryId,
      };

      const response = await updateTransaction(showEditModal.id, updateData);
      
      if (response.success) {
        // รีเฟรชข้อมูลหลังจากแก้ไข
        await loadTransactions(currentPage);
        setShowEditModal(null);
        triggerToast("แก้ไขรายการสำเร็จ");
      } else {
        throw new Error(response.error || 'เกิดข้อผิดพลาดในการแก้ไข');
      }
    } catch (error: any) {
      console.error('Update transaction error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการแก้ไขธุรกรรม');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!showEditModal) return;
    const { id, value } = e.target;
    
    if (id === "amount") {
      setShowEditModal(prev => prev ? { ...prev, [id]: parseFloat(value) || 0 } : null);
    } else if (id === "category") {
      // อัปเดต categoryId เมื่อเปลี่ยนหมวดหมู่
      const selectedCategory = categories.find(cat => cat.name === value);
      setShowEditModal(prev => prev ? { 
        ...prev, 
        category: value,
        categoryId: selectedCategory?.id || prev.categoryId
      } : null);
    } else if (id === "account") {
      // อัปเดต accountId เมื่อเปลี่ยนบัญชี
      const selectedAccount = accounts.find(acc => acc.name === value);
      setShowEditModal(prev => prev ? { 
        ...prev, 
        account: value,
        accountId: selectedAccount?.id || prev.accountId
      } : null);
    } else {
      setShowEditModal(prev => prev ? { ...prev, [id]: value } : null);
    }
  };

  // --- Helper Functions ---
  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case "income":
        return "text-green-600";
      case "expense":
        return "text-red-600";
      case "transfer":
        return "text-blue-600";
    }
  };

  // ลบ mockNavigate

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100 font-inter">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">รายการธุรกรรม</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
            >
              <ArrowLeftIcon />
              กลับหน้าหลัก
            </button>
            <button
              onClick={() => router.push("/transactions/new")}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon />
              เพิ่มรายการ
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg min-h-[400px] flex flex-col">
          {/* --- Loading State --- */}
          {loading && (
            <div className="flex justify-center items-center py-20">
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

          {/* --- รายการ (List) --- */}
          <div className="flex-grow">
            {!loading && !error && (
              transactions.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {transactions.map((t: DisplayTransaction) => (
                  <li
                    key={t.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-2 hover:bg-gray-50 rounded-md"
                  >
                    {/* ส่วนข้อมูล (ซ้าย) */}
                    <div className="flex-1 mb-2 sm:mb-0">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-800">
                          {t.category}
                        </span>
                        {t.type === "transfer" && (
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            โยกย้าย
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {t.account} •{" "}
                        {new Date(t.date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* ส่วนตัวเลขและปุ่ม (ขวา) */}
                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between">
                      <span
                        className={`text-lg font-bold ${getTypeColor(t.type)}`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {t.amount.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ฿
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowEditModal(t)}
                          className="p-1 rounded-md hover:bg-yellow-100"
                          title="แก้ไข"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(t.id)}
                          className="p-1 rounded-md hover:bg-red-100"
                          title="ลบ"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 py-20">
                <p className="text-lg">ไม่มีรายการธุรกรรม</p>
                <p className="text-sm mt-2">เริ่มต้นสร้างธุรกรรมแรกของคุณ</p>
              </div>
              )
            )}
          </div>

          {/* --- Pagination Controls --- */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon />
                ก่อนหน้า
              </button>
              <span className="text-sm text-gray-600">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* --- Toast (Success) --- */}
      {showToast && (
        <div
          className="fixed bottom-5 right-5 z-50 bg-green-600 text-white py-3 px-5 rounded-lg shadow-xl flex items-center animate-bounce"
          style={{ animation: "bounce 1s ease-in-out" }}
        >
          <CheckCircleIcon />
          <span className="ml-2 font-semibold">{showToast}</span>
        </div>
      )}

      {/* --- Modal (Confirm Delete) --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 transition-transform scale-100">
            <div className="flex flex-col items-center text-center">
              <ExclamationIcon />
              <h3 className="text-xl font-bold text-gray-800 mt-4">
                ยืนยันการลบ
              </h3>
              <p className="text-gray-600 mt-2">
                คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?
                การกระทำนี้ไม่สามารถยกเลิกได้
              </p>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isDeleting}
                className="w-full px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal (Edit Transaction) --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transition-transform scale-100">
            <form onSubmit={handleEditSubmit}>
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">แก้ไขรายการ</h3>
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* ประเภท (แสดงผลอย่างเดียว) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ประเภท
                  </label>
                  <input
                    type="text"
                    disabled
                    value={
                      showEditModal.type === "expense"
                        ? "รายจ่าย"
                        : showEditModal.type === "income"
                        ? "รายรับ"
                        : "โยกย้าย"
                    }
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-600 rounded-lg"
                  />
                </div>

                {/* หมวดหมู่ (Dropdown) */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    หมวดหมู่
                  </label>
                  <select
                    id="category"
                    value={showEditModal.category}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {/* กรองหมวดหมู่ตามประเภท */}
                    {categories
                      .filter(cat => cat.type?.name === (
                        showEditModal.type === "expense" ? "Expense" :
                        showEditModal.type === "income" ? "Income" : "Transfer"
                      ))
                      .map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* บัญชี (Dropdown) */}
                <div>
                  <label
                    htmlFor="account"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    บัญชี
                  </label>
                  <select
                    id="account"
                    value={showEditModal.account}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.name}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

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
                    value={showEditModal.amount}
                    onChange={handleEditChange}
                    required
                    min="0.01"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* วันที่ */}
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    วันที่
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={showEditModal.date}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}

export default TransactionListPage;
