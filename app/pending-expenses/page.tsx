"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getAllPendingExpenses, 
  createPendingExpense, 
  updatePendingExpense, 
  deletePendingExpense,
  convertToTransaction,
  markAsPaid 
} from '@/lib/pending-expenses';
import { getAllCategories } from '@/lib/categories';
import { getAllAccounts } from '@/lib/accounts';
import { getAuthToken } from '@/lib/auth';
import { PendingExpense, PendingExpenseFormData, Category, Account } from '@/lib/types';
import AlertBanner from '@/components/ui/AlertBanner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormModal from '@/components/ui/FormModal';
import BackButton from '@/components/ui/BackButton';

// --- ไอคอน SVG ---
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

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CreditCardIcon = () => (
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
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.634-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

/**
 * หน้าจัดการรายจ่ายที่รอจ่าย (Pending Expenses Page)
 */
function PendingExpensesPage() {
  const router = useRouter();

  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<PendingExpense | null>(null);
  const [showToast, setShowToast] = useState<string>("");
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [convertExpenseId, setConvertExpenseId] = useState<string | null>(null);
  const [markAsPaidExpenseId, setMarkAsPaidExpenseId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }

        console.log("Loading pending expenses and related data...");
        
        // โหลดข้อมูลทั้งหมดพร้อมกัน
        const [expensesResponse, categoriesResponse, accountsResponse] = await Promise.all([
          getAllPendingExpenses(),
          getAllCategories(),
          getAllAccounts()
        ]);
        
        if (expensesResponse.success && expensesResponse.data) {
          setPendingExpenses(expensesResponse.data);
        } else {
          setError(expensesResponse.message || 'ไม่สามารถโหลดข้อมูลรายจ่ายที่รอจ่ายได้');
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          // กรองเฉพาะ expense categories
          const expenseCategories = categoriesResponse.data.filter(
            cat => cat.type?.name === 'Expense'
          );
          setCategories(expenseCategories);
        }

        if (accountsResponse.success && accountsResponse.data) {
          setAccounts(accountsResponse.data);
        }

      } catch (error: any) {
        console.error('Load data error:', error);
        setError(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        
        if (error.message?.includes('authentication') || error.message?.includes('token')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  /**
   * เปิด Modal สำหรับ "เพิ่ม" รายจ่ายใหม่
   */
  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  /**
   * เปิด Modal สำหรับ "แก้ไข" รายจ่าย
   */
  const handleOpenEditModal = (expense: PendingExpense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  /**
   * เปิด Modal แจ้งเตือนลบ
   */
  const handleRequestDeleteExpense = (id: string) => {
    setDeleteExpenseId(id);
  };

  /**
   * เปิด Modal แจ้งเตือนแปลงเป็นธุรกรรม
   */
  const handleRequestConvertExpense = (id: string) => {
    setConvertExpenseId(id);
    setSelectedAccountId(accounts.length > 0 ? accounts[0].id : "");
  };

  /**
   * เปิด Modal สำหรับมาร์คเป็นจ่ายแล้ว
   */
  const handleOpenMarkAsPaidModal = (expense: PendingExpense) => {
    setMarkAsPaidExpenseId(expense.id);
    setSelectedAccountId(accounts.length > 0 ? accounts[0].id : "");
  };

  /**
   * ดำเนินการลบจริง
   */
  const handleDeleteExpense = async () => {
    if (!deleteExpenseId) return;

    setActionLoading(true);
    try {
      const response = await deletePendingExpense(deleteExpenseId);
      
      if (response.success) {
        setPendingExpenses(prev => prev.filter(exp => exp.id !== deleteExpenseId));
        showToastMessage("ลบรายจ่ายสำเร็จ!");
      } else {
        setError(response.message || 'ไม่สามารถลบรายจ่ายได้');
      }
    } catch (error: any) {
      console.error('Delete expense error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการลบรายจ่าย');
    } finally {
      setActionLoading(false);
      setDeleteExpenseId(null);
    }
  };

  /**
   * แปลงเป็นธุรกรรม
   */
  const handleConvertToTransaction = async () => {
    if (!convertExpenseId || !selectedAccountId) return;

    setActionLoading(true);
    try {
      const response = await convertToTransaction(convertExpenseId, selectedAccountId);
      
      if (response.success) {
        // อัปเดต status เป็น paid
        setPendingExpenses(prev => 
          prev.map(exp => 
            exp.id === convertExpenseId 
              ? { ...exp, status: 'paid' as const }
              : exp
          )
        );
        
        // แสดงข้อความสำเร็จพร้อมรายละเอียด
        if (response.data?.summary) {
          const { summary } = response.data;
          showToastMessage(
            `แปลงเป็นธุรกรรมสำเร็จ! จ่าย ${summary.expenseAmount.toLocaleString('th-TH')} บาท จากบัญชี ${summary.accountName} (คงเหลือ ${summary.newBalance.toLocaleString('th-TH')} บาท)`
          );
        } else {
          showToastMessage("แปลงเป็นธุรกรรมสำเร็จ!");
        }
      } else {
        setError(response.message || 'ไม่สามารถแปลงเป็นธุรกรรมได้');
      }
    } catch (error: any) {
      console.error('Convert to transaction error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการแปลงเป็นธุรกรรม');
    } finally {
      setActionLoading(false);
      setConvertExpenseId(null);
      setSelectedAccountId("");
    }
  };

  /**
   * มาร์คเป็น paid และสร้างธุรกรรม
   */
  const handleMarkAsPaid = async () => {
    if (!markAsPaidExpenseId || !selectedAccountId) return;

    setActionLoading(true);
    try {
      // ใช้ convertToTransaction แทนการ markAsPaid เฉยๆ
      const response = await convertToTransaction(markAsPaidExpenseId, selectedAccountId);
      
      if (response.success) {
        // อัปเดต status เป็น paid
        setPendingExpenses(prev => 
          prev.map(exp => 
            exp.id === markAsPaidExpenseId 
              ? { ...exp, status: 'paid' as const }
              : exp
          )
        );
        
        // แสดงข้อความสำเร็จพร้อมรายละเอียด
        if (response.data?.summary) {
          const { summary } = response.data;
          showToastMessage(
            `จ่ายแล้วและบันทึกธุรกรรมสำเร็จ! จ่าย ${summary.expenseAmount.toLocaleString('th-TH')} บาท จากบัญชี ${summary.accountName} (คงเหลือ ${summary.newBalance.toLocaleString('th-TH')} บาท)`
          );
        } else {
          showToastMessage("จ่ายแล้วและบันทึกธุรกรรมสำเร็จ!");
        }
      } else {
        setError(response.message || 'ไม่สามารถจ่ายและบันทึกธุรกรรมได้');
      }
    } catch (error: any) {
      console.error('Mark as paid error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการจ่ายและบันทึกธุรกรรม');
    } finally {
      setActionLoading(false);
      setMarkAsPaidExpenseId(null);
      setSelectedAccountId("");
    }
  };

  /**
   * จัดการการบันทึก (ทั้งเพิ่มและแก้ไข)
   */
  const handleSaveExpense = async (formData: PendingExpenseFormData) => {
    try {
      console.log("Saving pending expense:", formData);
      
      if (formData.id && formData.id !== null) {
        // แก้ไขรายจ่าย
        const response = await updatePendingExpense(formData.id, {
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          amount: formData.amount,
          due_date: formData.due_date,
          priority: formData.priority,
          is_recurring: formData.is_recurring,
          recurring_type: formData.recurring_type
        });
        
        if (response.success && response.data) {
          setPendingExpenses(prev =>
            prev.map(exp =>
              exp.id === formData.id ? response.data! : exp
            )
          );
          showToastMessage("แก้ไขรายจ่ายสำเร็จ!");
        } else {
          setError(response.message || 'ไม่สามารถแก้ไขรายจ่ายได้');
          return;
        }
      } else {
        // สร้างรายจ่ายใหม่
        const response = await createPendingExpense({
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          amount: formData.amount,
          due_date: formData.due_date,
          priority: formData.priority,
          is_recurring: formData.is_recurring,
          recurring_type: formData.recurring_type
        });
        
        if (response.success && response.data) {
          setPendingExpenses(prev => [...prev, response.data!]);
          showToastMessage("เพิ่มรายจ่ายสำเร็จ!");
        } else {
          setError(response.message || 'ไม่สามารถสร้างรายจ่ายได้');
          return;
        }
      }
      
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Save expense error:', error);
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
    }, 3000);
  };

  /**
   * ฟังก์ชันแสดงสีตาม priority
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * ฟังก์ชันแสดงสีตาม status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * ฟังก์ชันแสดงไอคอนตาม priority
   */
  const PriorityIcon = ({ priority }: { priority: string }) => {
    switch (priority) {
      case 'high':
        return <ExclamationIcon />;
      case 'medium':
        return <ClockIcon />;
      case 'low':
        return <CheckIcon />;
      default:
        return <ClockIcon />;
    }
  };

  const expensePendingDelete = deleteExpenseId
    ? pendingExpenses.find(exp => exp.id === deleteExpenseId)
    : null;

  const expensePendingConvert = convertExpenseId
    ? pendingExpenses.find(exp => exp.id === convertExpenseId)
    : null;

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">รายจ่ายที่รอจ่าย</h1>
          <BackButton href="/dashboard" label="กลับหน้าหลัก" />
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
              รายจ่ายทั้งหมด
            </h2>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon />
              เพิ่มรายจ่ายใหม่
            </button>
          </div>

          {/* --- รายการรายจ่าย (List) --- */}
          <div className="flow-root">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 text-sm font-medium leading-6 text-gray-500">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังโหลดข้อมูล...
                </div>
              </div>
            ) : pendingExpenses.length > 0 ? (
              <ul role="list" className="divide-y divide-gray-200">
                {pendingExpenses.map((expense) => (
                  <li
                    key={expense.id}
                    className="py-4 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="p-2 rounded-full bg-gray-100">
                        <PriorityIcon priority={expense.priority} />
                      </span>
                      <div>
                        <p className="text-md font-medium text-gray-900 truncate">
                          {expense.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(expense.priority)}`}>
                            {expense.priority === 'high' ? 'สำคัญ' : 
                             expense.priority === 'medium' ? 'ปานกลาง' : 'ไม่เร่งด่วน'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                            {expense.status === 'paid' ? 'จ่ายแล้ว' : 
                             expense.status === 'overdue' ? 'เลยกำหนด' : 'รอจ่าย'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {expense.category?.name} • {parseFloat(expense.amount).toLocaleString("th-TH")} ฿
                          {expense.due_date && (
                            <> • ครบกำหนด: {new Date(expense.due_date).toLocaleDateString('th-TH')}</>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {/* ปุ่มแอคชัน */}
                    <div className="flex items-center space-x-2">
                      {expense.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRequestConvertExpense(expense.id)}
                            className="p-2 rounded-md text-green-600 bg-green-100 hover:bg-green-200"
                            title="แปลงเป็นธุรกรรม"
                          >
                            <CreditCardIcon />
                          </button>
                          <button
                            onClick={() => handleOpenMarkAsPaidModal(expense)}
                            className="p-2 rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                            title="จ่ายแล้ว"
                          >
                            <CheckIcon />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(expense)}
                        className="p-2 rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                        title="แก้ไข"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleRequestDeleteExpense(expense.id)}
                        className="p-2 rounded-md text-red-600 bg-red-100 hover:bg-red-200"
                        title="ลบ"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-8">ไม่พบรายจ่ายที่รอจ่าย</p>
            )}
          </div>
        </div>
      </main>

      {/* --- Modal สำหรับ เพิ่ม/แก้ไข --- */}
      {isModalOpen && (
        <PendingExpenseModal
          expense={editingExpense}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveExpense}
        />
      )}

      {/* --- Toast Notification --- */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
          <CheckIcon />
          <span className="ml-2">{showToast}</span>
        </div>
      )}

      {/* --- Modal ยืนยันการลบ --- */}
      <ConfirmModal
        open={!!deleteExpenseId}
        tone="danger"
        title="ยืนยันการลบ"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบรายจ่ายนี้? การกระทำนี้ไม่สามารถยกเลิกได้"
        highlight={expensePendingDelete?.title}
        confirmLabel={actionLoading ? 'กำลังลบ...' : 'ยืนยันการลบ'}
        cancelLabel="ยกเลิก"
        loading={actionLoading}
        onCancel={() => setDeleteExpenseId(null)}
        onConfirm={handleDeleteExpense}
      />

      {/* --- Modal ยืนยันการจ่ายแล้ว --- */}
      <ConfirmModal
        open={!!markAsPaidExpenseId}
        tone="success"
        title="จ่ายแล้ว"
        message={
          <div className="space-y-4">
            <p>คุณต้องการจ่าย "{pendingExpenses.find(exp => exp.id === markAsPaidExpenseId)?.title}" หรือไม่?</p>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">รายละเอียดรายจ่าย:</h4>
              <p className="text-sm text-green-700">
                จำนวน: <span className="font-semibold">{parseFloat(pendingExpenses.find(exp => exp.id === markAsPaidExpenseId)?.amount || '0').toLocaleString("th-TH")} ฿</span>
              </p>
              <p className="text-sm text-green-700">
                หมวดหมู่: {pendingExpenses.find(exp => exp.id === markAsPaidExpenseId)?.category?.name}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกบัญชีที่จ่าย:
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {accounts.map(account => {
                  const balance = parseFloat(account.balance || account.amount);
                  const expenseAmount = parseFloat(pendingExpenses.find(exp => exp.id === markAsPaidExpenseId)?.amount || '0');
                  const insufficient = balance < expenseAmount;
                  
                  return (
                    <option key={account.id} value={account.id} disabled={insufficient}>
                      {account.name} ({balance.toLocaleString("th-TH")} ฿) 
                      {insufficient ? ' - ยอดเงินไม่เพียงพอ' : ''}
                    </option>
                  );
                })}
              </select>
              
              {(() => {
                const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
                const currentExpense = pendingExpenses.find(exp => exp.id === markAsPaidExpenseId);
                if (selectedAccount && currentExpense) {
                  const balance = parseFloat(selectedAccount.balance || selectedAccount.amount);
                  const expenseAmount = parseFloat(currentExpense.amount);
                  const remaining = balance - expenseAmount;
                  
                  return (
                    <div className={`mt-2 p-2 rounded text-sm ${remaining >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      <p>ยอดคงเหลือหลังจ่าย: <span className="font-semibold">{remaining.toLocaleString("th-TH")} ฿</span></p>
                      {remaining < 0 && <p className="text-xs mt-1">⚠️ ยอดเงินไม่เพียงพอสำหรับการทำธุรกรรมนี้</p>}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        }
        confirmLabel={actionLoading ? 'กำลังจ่าย...' : 'ยืนยันการจ่าย'}
        cancelLabel="ยกเลิก"
        loading={actionLoading}
        disabled={(() => {
          const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
          const currentExpense = pendingExpenses.find(exp => exp.id === markAsPaidExpenseId);
          if (selectedAccount && currentExpense) {
            const balance = parseFloat(selectedAccount.balance || selectedAccount.amount);
            const expenseAmount = parseFloat(currentExpense.amount);
            return balance < expenseAmount;
          }
          return false;
        })()}
        errorMessage={(() => {
          const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
          const currentExpense = pendingExpenses.find(exp => exp.id === markAsPaidExpenseId);
          if (selectedAccount && currentExpense) {
            const balance = parseFloat(selectedAccount.balance || selectedAccount.amount);
            const expenseAmount = parseFloat(currentExpense.amount);
            if (balance < expenseAmount) {
              return `ยอดเงินในบัญชี "${selectedAccount.name}" ไม่เพียงพอ (ขาดอีก ${(expenseAmount - balance).toLocaleString("th-TH")} ฿)`;
            }
          }
          return undefined;
        })()}
        onCancel={() => {
          setMarkAsPaidExpenseId(null);
          setSelectedAccountId("");
        }}
        onConfirm={handleMarkAsPaid}
      />

      {/* --- Modal ยืนยันการแปลงเป็นธุรกรรม --- */}
      <ConfirmModal
        open={!!convertExpenseId}
        tone="info"
        title="แปลงเป็นธุรกรรม"
        message={
          <div className="space-y-4">
            <p>คุณต้องการแปลงรายจ่าย "{expensePendingConvert?.title}" เป็นธุรกรรมหรือไม่?</p>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">รายละเอียดรายจ่าย:</h4>
              <p className="text-sm text-blue-700">
                จำนวน: <span className="font-semibold">{parseFloat(expensePendingConvert?.amount || '0').toLocaleString("th-TH")} ฿</span>
              </p>
              <p className="text-sm text-blue-700">
                หมวดหมู่: {expensePendingConvert?.category?.name}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกบัญชีที่จะหักเงิน:
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {accounts.map(account => {
                  const balance = parseFloat(account.balance || account.amount);
                  const expenseAmount = parseFloat(expensePendingConvert?.amount || '0');
                  const insufficient = balance < expenseAmount;
                  
                  return (
                    <option key={account.id} value={account.id} disabled={insufficient}>
                      {account.name} ({balance.toLocaleString("th-TH")} ฿) 
                      {insufficient ? ' - ยอดเงินไม่เพียงพอ' : ''}
                    </option>
                  );
                })}
              </select>
              
              {(() => {
                const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
                if (selectedAccount && expensePendingConvert) {
                  const balance = parseFloat(selectedAccount.balance || selectedAccount.amount);
                  const expenseAmount = parseFloat(expensePendingConvert.amount);
                  const remaining = balance - expenseAmount;
                  
                  return (
                    <div className={`mt-2 p-2 rounded text-sm ${remaining >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      <p>ยอดคงเหลือหลังจ่าย: <span className="font-semibold">{remaining.toLocaleString("th-TH")} ฿</span></p>
                      {remaining < 0 && <p className="text-xs mt-1">⚠️ ยอดเงินไม่เพียงพอสำหรับการทำธุรกรรมนี้</p>}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        }
        confirmLabel={actionLoading ? 'กำลังแปลง...' : 'ยืนยันการแปลง'}
        cancelLabel="ยกเลิก"
        loading={actionLoading}
        disabled={(() => {
          const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
          if (selectedAccount && expensePendingConvert) {
            const balance = parseFloat(selectedAccount.balance || selectedAccount.amount);
            const expenseAmount = parseFloat(expensePendingConvert.amount);
            return balance < expenseAmount;
          }
          return false;
        })()}
        errorMessage={(() => {
          const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
          if (selectedAccount && expensePendingConvert) {
            const balance = parseFloat(selectedAccount.balance || selectedAccount.amount);
            const expenseAmount = parseFloat(expensePendingConvert.amount);
            if (balance < expenseAmount) {
              return `ยอดเงินในบัญชี "${selectedAccount.name}" ไม่เพียงพอ (ขาดอีก ${(expenseAmount - balance).toLocaleString("th-TH")} ฿)`;
            }
          }
          return undefined;
        })()}
        onCancel={() => {
          setConvertExpenseId(null);
          setSelectedAccountId("");
        }}
        onConfirm={handleConvertToTransaction}
      />
    </div>
  );
}

// --- Component ย่อยสำหรับ Modal ---
interface PendingExpenseModalProps {
  expense: PendingExpense | null;
  categories: Category[];
  onClose: () => void;
  onSave: (formData: PendingExpenseFormData) => void;
}

const PendingExpenseModal: React.FC<PendingExpenseModalProps> = ({
  expense,
  categories,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState<string>(expense?.title || "");
  const [description, setDescription] = useState<string>(expense?.description || "");
  const [categoryId, setCategoryId] = useState<string>(expense?.category_id || "");
  const [amount, setAmount] = useState<number>(
    expense ? parseFloat(expense.amount) : 0
  );
  const [dueDate, setDueDate] = useState<string>(expense?.due_date || "");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(expense?.priority || 'medium');
  const [isRecurring, setIsRecurring] = useState<boolean>(expense?.is_recurring || false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    expense?.recurring_type || 'monthly'
  );
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("กรุณากรอกชื่อรายจ่าย");
      return;
    }
    
    if (!categoryId) {
      setError("กรุณาเลือกหมวดหมู่");
      return;
    }
    
    if (amount <= 0) {
      setError("กรุณากรอกจำนวนเงินที่มากกว่า 0");
      return;
    }

    onSave({
      id: expense?.id || null,
      category_id: categoryId,
      title: title,
      description: description || undefined,
      amount: amount,
      due_date: dueDate || undefined,
      priority: priority,
      is_recurring: isRecurring,
      recurring_type: isRecurring ? recurringType : undefined
    });
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title={expense ? "แก้ไขรายจ่าย" : "เพิ่มรายจ่ายใหม่"}
      description="กรอกรายละเอียดรายจ่ายที่คุณต้องจ่ายในอนาคต"
      tone="primary"
      icon={<ClockIcon />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="expenseTitle" className="text-sm font-medium text-gray-700">
            ชื่อรายจ่าย <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="expenseTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="เช่น ค่าเช่าเดือนนี้, ค่าไฟฟ้า"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="expenseCategory" className="text-sm font-medium text-gray-700">
            หมวดหมู่ <span className="text-red-500">*</span>
          </label>
          <select
            id="expenseCategory"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">เลือกหมวดหมู่</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="expenseAmount" className="text-sm font-medium text-gray-700">
            จำนวนเงิน <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="expenseAmount"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="0.00"
            step="0.01"
            min="0.01"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="expenseDueDate" className="text-sm font-medium text-gray-700">
            วันครบกำหนด
          </label>
          <input
            type="date"
            id="expenseDueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="expensePriority" className="text-sm font-medium text-gray-700">
            ระดับความสำคัญ
          </label>
          <select
            id="expensePriority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="low">ไม่เร่งด่วน</option>
            <option value="medium">ปานกลาง</option>
            <option value="high">สำคัญ</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="expenseDescription" className="text-sm font-medium text-gray-700">
            รายละเอียดเพิ่มเติม
          </label>
          <textarea
            id="expenseDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="รายละเอียดเพิ่มเติม..."
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 text-sm font-medium text-gray-700">
              รายจ่ายประจำ
            </label>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <label htmlFor="recurringType" className="text-sm font-medium text-gray-700">
                ประเภทการทำซ้ำ
              </label>
              <select
                id="recurringType"
                value={recurringType}
                onChange={(e) => setRecurringType(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="daily">รายวัน</option>
                <option value="weekly">รายสัปดาห์</option>
                <option value="monthly">รายเดือน</option>
                <option value="yearly">รายปี</option>
              </select>
            </div>
          )}
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
            {expense ? <EditIcon /> : <PlusIcon />}
            {expense ? "บันทึกการแก้ไข" : "บันทึกรายจ่าย"}
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default PendingExpensesPage;