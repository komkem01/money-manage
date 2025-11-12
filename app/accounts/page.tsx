"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllAccounts, createAccount, updateAccount, deleteAccount } from '@/lib/accounts';
import { getAuthToken } from '@/lib/auth';
import { Account, AccountFormData } from '@/lib/types';
import AlertBanner from '@/components/ui/AlertBanner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormModal from '@/components/ui/FormModal';

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
const WalletIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6 text-gray-700" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
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

// Account interface imported from lib/types.ts

/**
 * หน้าจัดการบัญชี (Accounts Page)
 * /pages/accounts.tsx
 */
function AccountsPage() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showToast, setShowToast] = useState<string>("");
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // โหลดข้อมูลบัญชีเมื่อ component mount
  useEffect(() => {
    const checkAuthAndLoadAccounts = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }

        console.log("Loading accounts...");
        const response = await getAllAccounts();
        console.log("Accounts loaded:", response);
        
        if (response.success && response.data) {
          setAccounts(response.data);
        } else {
          setError(response.message || 'ไม่สามารถโหลดข้อมูลบัญชีได้');
        }
      } catch (error: any) {
        console.error('Load accounts error:', error);
        setError(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        
        // ถ้า error เป็น unauthorized ให้กลับไป login
        if (error.message?.includes('authentication') || error.message?.includes('token')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadAccounts();
  }, [router]);

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
  const handleDeleteAccount = async () => {
    if (!deleteAccountId) {
      return;
    }

    setIsDeleting(true);

    try {
      console.log("Deleting account:", deleteAccountId);
      const response = await deleteAccount(deleteAccountId);
      
      if (response.success) {
        setAccounts((prev) => prev.filter((acc) => acc.id !== deleteAccountId));
        showToastMessage("ลบบัญชีสำเร็จ!");
      } else {
        setError(response.message || 'ไม่สามารถลบบัญชีได้');
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการลบบัญชี');
    } finally {
      setIsDeleting(false);
      setDeleteAccountId(null);
    }
  };

  /**
   * จัดการการบันทึก (ทั้งเพิ่มและแก้ไข)
   */
  const handleSaveAccount = async (formData: AccountFormData) => {
    try {
      console.log("Saving account:", formData);
      console.log("Is editing?", !!formData.id);
      
      if (formData.id && formData.id !== null) {
        // แก้ไขบัญชี (ใช้ PATCH method)
        console.log("Updating account with ID:", formData.id);
        const response = await updateAccount(formData.id, {
          name: formData.name,
          amount: formData.amount
        });
        
        console.log("Update response:", response);
        
        if (response.success && response.data) {
          setAccounts((prev) =>
            prev.map((acc) =>
              acc.id === formData.id ? response.data! : acc
            )
          );
          showToastMessage("แก้ไขบัญชีสำเร็จ!");
        } else {
          console.error("Update failed:", response);
          setError(response.message || response.error || 'ไม่สามารถแก้ไขบัญชีได้');
          return;
        }
      } else {
        // สร้างบัญชีใหม่
        const response = await createAccount({
          name: formData.name,
          amount: formData.amount
        });
        
        if (response.success && response.data) {
          setAccounts((prev) => [...prev, response.data!]);
          showToastMessage("เพิ่มบัญชีสำเร็จ!");
        } else {
          setError(response.message || 'ไม่สามารถสร้างบัญชีได้');
          return;
        }
      }
      
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Save account error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
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

  const accountPendingDelete = deleteAccountId
    ? accounts.find((acc) => acc.id === deleteAccountId)
    : null;

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
        {/* Error Message */}
        {error && (
          <AlertBanner
            tone="error"
            title="เกิดข้อผิดพลาด"
            message={error}
            onDismiss={() => setError('')}
          />
        )}

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
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 text-sm font-medium leading-6 text-gray-500 transition duration-150 ease-in-out">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังโหลดข้อมูล...
                </div>
              </div>
            ) : accounts.length > 0 ? (
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
                          ยอดคงเหลือ:{" "}
                          {parseFloat(account.balance || account.amount).toLocaleString("th-TH")} ฿
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

      <ConfirmModal
        open={!!deleteAccountId}
        tone="danger"
        title="ยืนยันการลบ"
        message={(
          <span>
            คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?<br />การกระทำนี้ไม่สามารถยกเลิกได้
          </span>
        )}
        highlight={accountPendingDelete?.name || undefined}
        confirmLabel={isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
        cancelLabel="ยกเลิก"
        loading={isDeleting}
        onCancel={() => setDeleteAccountId(null)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

// --- Component ย่อยสำหรับ Modal ---
interface AccountModalProps {
  account: Account | null; // null = เพิ่มใหม่, Object = แก้ไข
  onClose: () => void;
  onSave: (formData: AccountFormData) => void;
}

const AccountModal: React.FC<AccountModalProps> = ({
  account,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>(account?.name || "");
  const [amount, setAmount] = useState<number>(
    account ? parseFloat(account.balance || account.amount) : 0
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
      amount: amount,
    });
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title={account ? "แก้ไขบัญชี" : "เพิ่มบัญชีใหม่"}
      description="กรอกชื่อบัญชีและยอดเงินเพื่อจัดระเบียบการเงินของคุณให้ชัดเจนยิ่งขึ้น"
      tone="primary"
      icon={<WalletIcon className="h-7 w-7 text-white" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="accountName" className="text-sm font-medium text-gray-700">
            ชื่อบัญชี <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="accountName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="เช่น กสิกร, เงินสด, วอลเล็ต"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="initialBalance" className="text-sm font-medium text-gray-700">
            ยอดเงินเริ่มต้น (หรือปัจจุบัน)
          </label>
          <input
            type="number"
            id="initialBalance"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            {account ? <EditIcon /> : <PlusIcon />}
            {account ? "บันทึกการแก้ไข" : "บันทึกบัญชี"}
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default AccountsPage;
