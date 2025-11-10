"use client";
import React, { useState } from "react";
// import { useRouter } from 'next/navigation'; // สำหรับแอปจริง

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

// --- Mock Data (ข้อมูลจำลอง) ---
// (ในแอปจริง, ข้อมูลนี้ควรมาจาก API)
const mockCategories = {
  expense: [
    { id: "cat_e1", name: "ค่าอาหาร" },
    { id: "cat_e2", name: "ค่าเดินทาง" },
    { id: "cat_e3", name: "ช้อปปิ้ง" },
  ],
  income: [
    { id: "cat_i1", name: "เงินเดือน" },
    { id: "cat_i2", name: "รายได้เสริม" },
  ],
};
const mockAccounts = [
  { id: "acc_1", name: "เงินสด" },
  { id: "acc_2", name: "บัญชีธนาคาร A" },
  { id: "acc_3", name: "บัตรเครดิต B" },
];

/**
 * หน้าบันทึกรายการใหม่ (New Transaction Page)
 * /pages/transaction/new.tsx
 */
function NewTransactionPage(): React.ReactElement {
  // const router = useRouter(); // สำหรับแอปจริง
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State สำหรับฟอร์ม
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transferFromAccount, setTransferFromAccount] = useState("");
  const [transferToAccount, setTransferToAccount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // วันที่ปัจจุบัน

  /**
   * จัดการการส่งฟอร์ม (Mock)
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    let formData = {};

    if (activeTab === "transfer") {
      formData = {
        type: activeTab,
        amount: parseFloat(amount),
        fromAccountId: transferFromAccount,
        toAccountId: transferToAccount,
        description,
        date,
      };
      // (เพิ่มการตรวจสอบว่า from != to)
      if (transferFromAccount === transferToAccount) {
        alert("บัญชีต้นทางและปลายทางต้องไม่ซ้ำกัน");
        setIsSubmitting(false);
        return;
      }
    } else {
      formData = {
        type: activeTab,
        amount: parseFloat(amount),
        categoryId: selectedCategory,
        accountId: selectedAccount,
        description,
        date,
      };
    }

    console.log("--- Mock Submit ---");
    console.log(formData);

    // --- Mock Logic ---
    setShowToast(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(false);
      // ในแอปจริง: ควรจะเด้งกลับไปหน้า Dashboard หรือ History
      // router.push("/dashboard");
      alert("(Mock) บันทึกสำเร็จ! กำลังไปที่หน้าหลัก...");
      mockNavigate("/dashboard");
    }, 2000); // แสดง Toast 2 วินาที
  };

  /**
   * ฟังก์ชันจำลองการนำทาง (สำหรับ Preview)
   */
  const mockNavigate = (path: string) => {
    // @ts-ignore
    window.location.href = path; // จำลองการ redirect
  };

  /**
   * Render ฟอร์มตาม Tab ที่เลือก
   */
  const renderFormContent = () => {
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
                {mockAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
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
                {mockAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
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
    const categories =
      activeTab === "expense" ? mockCategories.expense : mockCategories.income;
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
              {categories.map((cat) => (
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
              {mockAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
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
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* --- Toast (ข้อความแจ้งเตือน) --- */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
          <div className="flex items-center justify-center p-4 rounded-lg shadow-lg bg-green-500 text-white animate-bounce">
            <CheckCircleIcon />
            <span className="ml-3 font-semibold">บันทึกรายการสำเร็จ!</span>
          </div>
        </div>
      )}

      {/* --- Header --- */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center relative">
          <button
            onClick={() => mockNavigate("/transactions")}
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
  );
}

export default NewTransactionPage;
