"use client";
import React, { useState, useMemo } from "react";
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
interface Transaction {
  id: string;
  date: string;
  category: string;
  account: string;
  amount: number;
  type: TransactionType;
}

// --- ข้อมูลจำลอง (Mock Data) ---
const mockCategories = {
  expense: [
    { id: "cat-e1", name: "ค่าอาหาร" },
    { id: "cat-e2", name: "ค่าเดินทาง" },
    { id: "cat-e3", name: "ค่าสาธารณูปโภค" },
  ],
  income: [
    { id: "cat-i1", name: "เงินเดือน" },
    { id: "cat-i2", name: "รายได้เสริม" },
  ],
  transfer: [], // โยกย้ายอาจไม่จำเป็นต้องมีหมวดหมู่ หรืออาจมี
};
const mockAccounts = [
  { id: "acc-1", name: "เงินสด" },
  { id: "acc-2", name: "บัญชีธนาคาร A" },
  { id: "acc-3", name: "บัญชีธนาคาร B" },
];

const initialTransactions: Transaction[] = [
  {
    id: "t1",
    date: "2025-11-10",
    category: "ค่าอาหาร",
    account: "เงินสด",
    amount: 120,
    type: "expense",
  },
  {
    id: "t2",
    date: "2025-11-10",
    category: "เงินเดือน",
    account: "บัญชีธนาคาร A",
    amount: 25000,
    type: "income",
  },
  {
    id: "t3",
    date: "2025-11-09",
    category: "ค่าเดินทาง",
    account: "เงินสด",
    amount: 55,
    type: "expense",
  },
  {
    id: "t4",
    date: "2025-11-09",
    category: "โอนเงิน",
    account: "บัญชีธนาคาร A -> B",
    amount: 5000,
    type: "transfer",
  },
  {
    id: "t5",
    date: "2025-11-08",
    category: "ค่าสาธารณูปโภค",
    account: "บัญชีธนาคาร A",
    amount: 1500,
    type: "expense",
  },
  {
    id: "t6",
    date: "2025-11-08",
    category: "รายได้เสริม",
    account: "บัญชีธนาคาร B",
    amount: 3000,
    type: "income",
  },
  {
    id: "t7",
    date: "2025-11-07",
    category: "ค่าอาหาร",
    account: "เงินสด",
    amount: 200,
    type: "expense",
  },
  {
    id: "t8",
    date: "2025-11-07",
    category: "ค่าเดินทาง",
    account: "เงินสด",
    amount: 40,
    type: "expense",
  },
  {
    id: "t9",
    date: "2025-11-06",
    category: "ค่าอาหาร",
    account: "เงินสด",
    amount: 150,
    type: "expense",
  },
  {
    id: "t10",
    date: "2025-11-05",
    category: "ค่าอาหาร",
    account: "เงินสด",
    amount: 80,
    type: "expense",
  },
  {
    id: "t11",
    date: "2025-11-04",
    category: "รายได้เสริม",
    account: "บัญชีธนาคาร A",
    amount: 2000,
    type: "income",
  },
  {
    id: "t12",
    date: "2025-11-03",
    category: "ค่าเดินทาง",
    account: "เงินสด",
    amount: 120,
    type: "expense",
  },
  {
    id: "t13",
    date: "2025-11-02",
    category: "ค่าอาหาร",
    account: "เงินสด",
    amount: 300,
    type: "expense",
  },
];

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
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<string | null>(null);

  // State สำหรับ Modal (ลบ และ แก้ไข)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  ); // เก็บ ID ที่จะลบ
  const [showEditModal, setShowEditModal] = useState<Transaction | null>(null); // เก็บข้อมูล Transaction ที่จะแก้ไข

  // --- Logic การแบ่งหน้า (Pagination Logic) ---
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    // แสดงรายการล่าสุดก่อน (โดยการ reverse)
    return transactions.slice().reverse().slice(startIndex, endIndex);
  }, [transactions, currentPage]);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // --- Toast Logic ---
  const triggerToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => {
      setShowToast(null);
    }, 3000); // แสดง Toast 3 วินาที
  };

  // --- CRUD Logic (จำลอง) ---

  // (L) Delete Logic
  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setShowDeleteConfirm(null); // ปิด Modal ยืนยัน
    triggerToast("ลบรายการสำเร็จ");
  };

  // (E) Edit Logic
  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showEditModal) return;

    // จำลองการอัปเดตข้อมูลใน State
    setTransactions((prev) =>
      prev.map((t) => (t.id === showEditModal.id ? { ...showEditModal } : t))
    );
    setShowEditModal(null); // ปิด Modal แก้ไข
    triggerToast("แก้ไขรายการสำเร็จ");
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!showEditModal) return;
    const { id, value } = e.target;
    setShowEditModal((prev) =>
      prev
        ? { ...prev, [id]: id === "amount" ? parseFloat(value) : value }
        : null
    );
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
          {/* --- รายการ (List) --- */}
          <div className="flex-grow">
            {paginatedTransactions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {paginatedTransactions.map((t) => (
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
                ไม่มีรายการธุรกรรม
              </div>
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
                className="w-full px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                ยืนยันการลบ
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
                    {/* หมายเหตุ: ในแอปจริง คุณต้องกรอง categories 
                      ตาม `showEditModal.type` (expense/income) 
                    */}
                    {mockCategories[showEditModal.type].map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    {/* Fallback ถ้าหมวดหมู่เดิมไม่มีในลิสต์ */}
                    {!mockCategories[showEditModal.type].find(
                      (c) => c.name === showEditModal.category
                    ) && (
                      <option value={showEditModal.category}>
                        {showEditModal.category} (เดิม)
                      </option>
                    )}
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
                    {mockAccounts.map((acc) => (
                      <option key={acc.id} value={acc.name}>
                        {acc.name}
                      </option>
                    ))}
                    {/* Fallback ถ้าบัญชีเดิมไม่มีในลิสต์ */}
                    {!mockAccounts.find(
                      (a) => a.name === showEditModal.account
                    ) && (
                      <option value={showEditModal.account}>
                        {showEditModal.account} (เดิม)
                      </option>
                    )}
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
                  className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionListPage;
