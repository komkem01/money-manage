"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCategoriesByType, createCategory, updateCategory, deleteCategory } from '@/lib/categories';
import { getAllTypes } from '@/lib/types';
import { getAuthToken } from '@/lib/auth';
import AlertBanner from '@/components/ui/AlertBanner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormModal from '@/components/ui/FormModal';

// --- ไอคอน SVG (คัดลอกมา) ---
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
const ArrowsIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6 text-white" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10m0 0l-3-3m3 3l-3 3M17 17H7m0 0l3 3m-3-3l3-3" />
  </svg>
);

// --- ประเภทข้อมูล (Interfaces) ---
interface Category {
  id: string;
  name: string;
  user_id: string;
  type_id: string;
  created_at: string;
  updated_at?: string;
  type: {
    id: string;
    name: string;
  };
}

interface Type {
  id: string;
  name: string;
}

/**
 * หน้าจัดการหมวดหมู่ "โอนเงิน" (Transfer Categories Page)
 */
const TransferCategoriesPage: React.FC = () => {
  const router = useRouter();

  // State สำหรับเก็บรายการหมวดหมู่และประเภท
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [transferTypeId, setTransferTypeId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showToast, setShowToast] = useState<string>("");
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      console.log("Loading types and transfer categories...");
      const typesResponse = await getAllTypes();
      if (typesResponse.success && typesResponse.data) {
        setTypes(typesResponse.data as Type[]);

        const transferType = (typesResponse.data as Type[]).find((type) => type.name === 'Transfer');
        if (transferType) {
          setTransferTypeId(transferType.id);

          const categoriesResponse = await getCategoriesByType(transferType.id);
          if (categoriesResponse.success && categoriesResponse.data) {
            setCategories(categoriesResponse.data as Category[]);
          }
        }
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
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // เปิด Modal แจ้งเตือนลบ
  const handleRequestDeleteCategory = (id: string) => {
    setDeleteCategoryId(id);
  };

  // ดำเนินการลบจริง
  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await deleteCategory(deleteCategoryId);
      
      if (response.success) {
        const categoryToDelete = categories.find((c) => c.id === deleteCategoryId);
        setCategories((prev) => prev.filter((c) => c.id !== deleteCategoryId));
        showToastMessage(`ลบหมวดหมู่ "${categoryToDelete?.name}" สำเร็จ!`);
      } else {
        throw new Error('เกิดข้อผิดพลาดในการลบหมวดหมู่');
      }
    } catch (error: any) {
      console.error('Delete category error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
    } finally {
      setIsDeleting(false);
      setDeleteCategoryId(null);
    }
  };

  const handleSaveCategory = async (formData: {
    id: string | null;
    name: string;
  }) => {
    try {
      if (!transferTypeId) {
        setError('ไม่พบ ID ของประเภทการโอนเงิน');
        return;
      }

      if (formData.id) {
        // แก้ไข
        const response = await updateCategory(formData.id, {
          name: formData.name,
          type_id: transferTypeId
        });
        
        if (response.success && response.data) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === formData.id ? response.data as Category : c
            )
          );
          showToastMessage("แก้ไขหมวดหมู่สำเร็จ!");
        } else {
          throw new Error(response.message || 'เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่');
        }
      } else {
        // เพิ่มใหม่
        const response = await createCategory({
          name: formData.name,
          type_id: transferTypeId
        });
        
        if (response.success && response.data) {
          setCategories((prev) => [...prev, response.data as Category]);
          showToastMessage("เพิ่มหมวดหมู่สำเร็จ!");
        } else {
          throw new Error(response.message || 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่');
        }
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Save category error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
    }
  };

  const showToastMessage = (message: string) => {
    setShowToast(message);
    setTimeout(() => {
      setShowToast("");
    }, 3000);
  };

  // ลบ mockNavigate

  const categoryPendingDelete = deleteCategoryId
    ? categories.find((c) => c.id === deleteCategoryId)
    : null;

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            จัดการหมวดหมู่โยกย้าย
          </h1>
          <button
            onClick={() => router.push("/type")}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            <ArrowLeftIcon />
            กลับหน้าประเภท
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
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
              หมวดหมู่โยกย้ายทั้งหมด
            </h2>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon />
              เพิ่มหมวดหมู่ใหม่
            </button>
          </div>

          {/* --- รายการหมวดหมู่ (List) --- */}
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
            ) : categories.length > 0 ? (
              <ul role="list" className="divide-y divide-gray-200">
                {categories.map((category: Category) => (
                  <li
                    key={category.id}
                    className="py-4 flex justify-between items-center"
                  >
                    <p className="text-md font-medium text-gray-900 truncate">
                      {category.name}
                    </p>
                    <div className="space-x-3">
                      <button
                        onClick={() => handleOpenEditModal(category)}
                        className="p-2 rounded-md text-blue-600 bg-white hover:bg-gray-100 border border-blue-200"
                        title="แก้ไข"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleRequestDeleteCategory(category.id)}
                        className="p-2 rounded-md text-red-600 bg-white hover:bg-gray-100 border border-red-200"
                        title="ลบ"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-8">
                ไม่พบหมวดหมู่สำหรับประเภทนี้
              </p>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCategory}
        />
      )}

      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
          <CheckCircleIcon />
          <span>{showToast}</span>
        </div>
      )}

      <ConfirmModal
        open={!!deleteCategoryId}
        tone="danger"
        title="ยืนยันการลบ"
        message={(<span>คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?<br />การกระทำนี้ไม่สามารถยกเลิกได้</span>)}
        highlight={categoryPendingDelete?.name || undefined}
        confirmLabel={isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
        cancelLabel="ยกเลิก"
        loading={isDeleting}
        onCancel={() => setDeleteCategoryId(null)}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
};

// --- Component ย่อยสำหรับ Modal ---
interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (formData: { id: string | null; name: string }) => Promise<void>;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>(category?.name || "");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("กรุณากรอกชื่อหมวดหมู่");
      return;
    }
    onSave({ id: category?.id || null, name: name });
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title={category ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
      description="กำหนดหมวดหมู่สำหรับการโอนเงิน เพื่อจัดการการเคลื่อนย้ายเงินได้ง่ายขึ้น"
  tone="warning"
      icon={<ArrowsIcon className="h-7 w-7 text-white" />}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="categoryName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ชื่อหมวดหมู่ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="categoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="เช่น โอนเข้าออมทรัพย์"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            บันทึก
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default TransferCategoriesPage;
