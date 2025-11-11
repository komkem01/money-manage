"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategoriesByType, createCategory, updateCategory, deleteCategory } from '@/lib/categories';
import { getAllTypes } from '@/lib/types';
import { getAuthToken } from '@/lib/auth';

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

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }

        console.log("Loading types and transfer categories...");
        
        // โหลด types ก่อน
        const typesResponse = await getAllTypes();
        if (typesResponse.success && typesResponse.data) {
          setTypes(typesResponse.data as Type[]);
          
          // หา transfer type ID
          const transferType = (typesResponse.data as Type[]).find(type => type.name === 'Transfer');
          if (transferType) {
            setTransferTypeId(transferType.id);
            
            // โหลด categories สำหรับ transfer type
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
    };

    loadData();
  }, [router]);

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
    if (!deleteCategoryId) return;
    
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
      setDeleteCategoryId(null);
    }
  };

  const handleSaveCategory = async (formData: {
    id: string | null;
    name: string;
  }) => {
    try {
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
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">กำลังโหลด...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  ลองใหม่
                </button>
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
                      {/* --- Modal แจ้งเตือนก่อนลบหมวดหมู่ --- */}
                      {deleteCategoryId && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
                            <div className="flex flex-col items-center text-center">
                              <DeleteIcon />
                              <h3 className="text-xl font-bold text-gray-800 mt-4">
                                ยืนยันการลบ
                              </h3>
                              <p className="text-gray-600 mt-2">
                                คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?
                                <br />
                                การกระทำนี้ไม่สามารถยกเลิกได้
                              </p>
                            </div>
                            <div className="flex justify-center gap-4 mt-6">
                              <button
                                onClick={() => setDeleteCategoryId(null)}
                                className="w-full px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                              >
                                ยกเลิก
                              </button>
                              <button
                                onClick={handleDeleteCategory}
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
    </div>
  );
};

// --- Component ย่อยสำหรับ Modal ---
interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (formData: { id: string | null; name: string }) => void;
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
    <div className="fixed inset-0 z-40 bg-white bg-opacity-80 flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-lg rounded-lg shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">
            {category ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"} (โอนเงิน)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

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
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น โอนเข้าออมทรัพย์"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

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

export default TransferCategoriesPage;
