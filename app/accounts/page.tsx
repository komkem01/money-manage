"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

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
const EditIcon = () => (
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
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
    />
  </svg>
);
const DeleteIcon = () => (
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
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
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
const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-700"
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
interface Account {
  id: string;
  name: string;
  initialBalance: number;
}

// --- Mock Data (ข้อมูลจำลอง) ---
const mockAccounts: Account[] = [
  { id: "acc1", name: "เงินสด", initialBalance: 5000 },
  { id: "acc2", name: "บัญชีกสิกร", initialBalance: 10000 },
  { id: "acc3", name: "บัญชีกรุงไทย", initialBalance: 15000 },
  { id: "acc4", name: "วอลเล็ต (TrueMoney)", initialBalance: 1000 },
];

/**
 * หน้าจัดการบัญชี (Accounts Page)
 * /pages/accounts.tsx
 */
function AccountsPage() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showToast, setShowToast] = useState<string>("");
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  /**
   * เปิด Modal สำหรับ "เพิ่ม" บัญชีใหม่
   */
  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  /**
   * เปิด Modal สำหรับ "แก้ไข" บัญชี
   */
  const handleOpenEditModal = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  /**
   * เปิด Modal แจ้งเตือนลบ
   */
  const handleRequestDeleteAccount = (id: string) => {
    setDeleteAccountId(id);
  };

  /**
   * ดำเนินการลบจริง
   */
  const handleDeleteAccount = () => {
    if (deleteAccountId) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== deleteAccountId));
      setDeleteAccountId(null);
      showToastMessage("ลบบัญชีสำเร็จ!");
    }
  };

  /**
   * (Mock) จัดการการบันทึก (ทั้งเพิ่มและแก้ไข)
   */
  const handleSaveAccount = (formData: {
    id: string | null;
    name: string;
    initialBalance: number;
  }) => {
    if (formData.id) {
      // Logic แก้ไข (Mock)
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === formData.id
            ? {
                ...acc,
                name: formData.name,
                initialBalance: formData.initialBalance,
              }
            : acc
        )
      );
      showToastMessage("แก้ไขบัญชีสำเร็จ!");
    } else {
      // Logic เพิ่มใหม่ (Mock)
      const newAccount: Account = {
        id: `acc${Math.random()}`, // สร้าง ID จำลอง
        name: formData.name,
        initialBalance: formData.initialBalance,
      };
      setAccounts((prev) => [...prev, newAccount]);
      showToastMessage("เพิ่มบัญชีสำเร็จ!");
    }
    setIsModalOpen(false);
  };

  /**
   * ฟังก์ชันแสดง Toast
   */
  const showToastMessage = (message: string) => {
    setShowToast(message);
    setTimeout(() => {
      setShowToast("");
    }, 3000); // แสดง Toast 3 วินาที
  };

  // ลบ mockNavigate

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">จัดการบัญชี</h1>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              บัญชีทั้งหมด
            </h2>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon />
              เพิ่มบัญชีใหม่
            </button>
          </div>

          {/* --- 3. รายการบัญชี (List) --- */}
          <div className="flow-root">
            {accounts.length > 0 ? (
              <ul role="list" className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <li
                    key={account.id}
                    className="py-4 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <WalletIcon />
                      <div>
                        <p className="text-md font-medium text-gray-900 truncate">
                          {account.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ยอดเริ่มต้น:{" "}
                          {account.initialBalance.toLocaleString("th-TH")} ฿
                        </p>
                      </div>
                    </div>
                    {/* ปุ่ม แก้ไข / ลบ */}
                    <div className="space-x-3">
                      <button
                        onClick={() => handleOpenEditModal(account)}
                        className="p-2 rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                        title="แก้ไข"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleRequestDeleteAccount(account.id)}
                        className="p-2 rounded-md text-red-600 bg-red-100 hover:bg-red-200"
                        title="ลบ"
                      >
                        <DeleteIcon />
                      </button>
                      {/* --- Modal แจ้งเตือนก่อนลบบัญชี --- */}
                      {deleteAccountId && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
                            <div className="flex flex-col items-center text-center">
                              <DeleteIcon />
                              <h3 className="text-xl font-bold text-gray-800 mt-4">
                                ยืนยันการลบ
                              </h3>
                              <p className="text-gray-600 mt-2">
                                คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?
                                <br />
                                การกระทำนี้ไม่สามารถยกเลิกได้
                              </p>
                            </div>
                            <div className="flex justify-center gap-4 mt-6">
                              <button
                                onClick={() => setDeleteAccountId(null)}
                                className="w-full px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                              >
                                ยกเลิก
                              </button>
                              <button
                                onClick={handleDeleteAccount}
                                className="w-full px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                              >
                                ยืนยันการลบ
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              // กรณีไม่พบข้อมูล
              <p className="text-center text-gray-500 py-8">ไม่พบบัญชี</p>
            )}
          </div>
        </div>
      </main>

      {/* --- 4. Modal (หน้าต่างเด้ง) สำหรับ เพิ่ม/แก้ไข --- */}
      {isModalOpen && (
        <AccountModal
          account={editingAccount}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAccount}
        />
      )}

      {/* --- 5. Toast Notification --- */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
          <CheckCircleIcon />
          <span>{showToast}</span>
        </div>
      )}
    </div>
  );
}

// --- Component ย่อยสำหรับ Modal ---
interface AccountModalProps {
  account: Account | null; // null = เพิ่มใหม่, Object = แก้ไข
  onClose: () => void;
  onSave: (formData: {
    id: string | null;
    name: string;
    initialBalance: number;
  }) => void;
}

const AccountModal: React.FC<AccountModalProps> = ({
  account,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>(account?.name || "");
  const [initialBalance, setInitialBalance] = useState<number>(
    account?.initialBalance || 0
  );
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("กรุณากรอกชื่อบัญชี");
      return;
    }
    onSave({
      id: account?.id || null, // ส่ง id (ถ้ามี)
      name: name,
      initialBalance: initialBalance,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-white bg-opacity-80 backdrop-blur-sm">
      <div
        className="relative bg-white w-full max-w-lg rounded-lg shadow-xl p-6"
        onClick={(e) => e.stopPropagation()} // ป้องกันการปิด Modal เมื่อคลิกข้างใน
      >
        {/* --- Header Modal --- */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">
            {account ? "แก้ไขบัญชี" : "เพิ่มบัญชีใหม่"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        {/* --- Form ใน Modal --- */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ช่องกรอกชื่อ */}
          <div>
            <label
              htmlFor="accountName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ชื่อบัญชี <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น กสิกร, เงินสด, วอลเล็ต"
            />
          </div>

          {/* ช่องกรอกยอดเงินเริ่มต้น */}
          <div>
            <label
              htmlFor="initialBalance"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ยอดเงินเริ่มต้น (หรือปัจจุบัน)
            </label>
            <input
              type="number"
              id="initialBalance"
              value={initialBalance}
              onChange={(e) =>
                setInitialBalance(parseFloat(e.target.value) || 0)
              }
              required
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          {/* แสดง Error (ถ้ามี) */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* --- Footer Modal (ปุ่ม) --- */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountsPage;
