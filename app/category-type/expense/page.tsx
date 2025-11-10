"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
type CategoryType = "expense" | "income" | "transfer";

interface Category {
  id: string;
  name: string;
  type: CategoryType;
}

// --- Mock Data (ข้อมูลจำลอง) ---
// (เราจะเก็บข้อมูลทั้งหมดไว้ก่อน แต่จะกรองเฉพาะ expense)
const mockCategories: Category[] = [
  { id: "c1", name: "ค่าอาหาร", type: "expense" },
  { id: "c2", name: "ค่าเดินทาง", type: "expense" },
  { id: "c3", name: "ค่าที่พัก", type: "expense" },
  { id: "c4", name: "เงินเดือน", type: "income" },
  { id: "c5", name: "รายได้เสริม", type: "income" },
  { id: "c6", name: "โอนเข้าบัญชีออมทรัพย์", type: "transfer" },
];

/**
 * (ใหม่) หน้าจัดการหมวดหมู่ "รายจ่าย" (Expense Categories Page)
 */
const ExpenseCategoriesPage: React.FC = () => {
  const router = useRouter();

  // (ใหม่) กำหนดประเภทตายตัวสำหรับหน้านี้
  const pageType: CategoryType = "expense";

  // State สำหรับเก็บรายการหมวดหมู่ทั้งหมด (Mock)
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showToast, setShowToast] = useState<string>("");
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  // (แก้ไข) กรองหมวดหมู่ตามประเภทของหน้านี้ (expense)
  const filteredCategories = categories.filter((c) => c.type === pageType);

  /**
   * เปิด Modal สำหรับ "เพิ่ม" หมวดหมู่ใหม่
   */
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  /**
   * เปิด Modal สำหรับ "แก้ไข" หมวดหมู่
   */
  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // เปิด Modal แจ้งเตือนลบ
  const handleRequestDeleteCategory = (id: string) => {
    setDeleteCategoryId(id);
  };

  // ดำเนินการลบจริง
  const handleDeleteCategory = () => {
    if (deleteCategoryId) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteCategoryId));
      setDeleteCategoryId(null);
      showToastMessage("ลบหมวดหมู่สำเร็จ!");
    }
  };

  /**
   * (Mock) จัดการการบันทึก (ทั้งเพิ่มและแก้ไข)
   * (แก้ไข) ไม่ต้องรับ type จากฟอร์มแล้ว เพราะหน้านี้กำหนด type ตายตัว
   */
  const handleSaveCategory = (formData: {
    id: string | null;
    name: string;
  }) => {
    if (formData.id) {
      // Logic แก้ไข (Mock)
      setCategories((prev) =>
        prev.map(
          (c) =>
            c.id === formData.id
              ? { ...c, name: formData.name, type: pageType }
              : c // ใช้ pageType
        )
      );
      showToastMessage("แก้ไขหมวดหมู่สำเร็จ!");
    } else {
      // Logic เพิ่มใหม่ (Mock)
      const newCategory: Category = {
        id: `c${Math.random()}`,
        name: formData.name,
        type: pageType, // ใช้ pageType
      };
      setCategories((prev) => [...prev, newCategory]);
      showToastMessage("เพิ่มหมวดหมู่สำเร็จ!");
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
    }, 3000);
  };

  /**
   * ฟังก์ชันจำลองการนำทาง
   */
  const mockNavigate = (path: string, pageName: string) => {
    alert(`(Mock Navigate)\nกำลังไปที่: ${pageName}\n(Path: ${path})`);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {/* (แก้ไข) เปลี่ยนชื่อ Header */}
          <h1 className="text-2xl font-bold text-gray-800">
            จัดการหมวดหมู่รายจ่าย
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
        {/* (ลบ) ลบส่วน Tabs ออก */}

        {/* --- ส่วนแสดงผล (รายการ + ปุ่มเพิ่ม) --- */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              หมวดหมู่รายจ่ายทั้งหมด
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
            {filteredCategories.length > 0 ? (
              <ul role="list" className="divide-y divide-gray-200">
                {filteredCategories.map((category) => (
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
              <h3 className="text-xl font-bold text-gray-800 mt-4">ยืนยันการลบ</h3>
              <p className="text-gray-600 mt-2">คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?<br/>การกระทำนี้ไม่สามารถยกเลิกได้</p>
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

      {/* --- Modal (หน้าต่างเด้ง) สำหรับ เพิ่ม/แก้ไข --- */}
      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCategory}
          // (แก้ไข) ส่งประเภทของหน้านี้ (expense) ไปให้ Modal
          defaultType={pageType}
        />
      )}

      {/* --- Toast Notification --- */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
          <CheckCircleIcon />
          <span>{showToast}</span>
        </div>
      )}
    </div>
  );
};

// --- Component ย่อยสำหรับ Modal (แก้ไข) ---
interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  // (แก้ไข) onSave ไม่ต้องรับ type กลับมาแล้ว
  onSave: (formData: { id: string | null; name: string }) => void;
  defaultType: CategoryType; // รับประเภทของหน้านี้มา
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  onClose,
  onSave,
  defaultType,
}) => {
  const [name, setName] = useState<string>(category?.name || "");
  // (แก้ไข) ลบ State ของ type ออก
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("กรุณากรอกชื่อหมวดหมู่");
      return;
    }
    onSave({
      id: category?.id || null,
      name: name,
      // (แก้ไข) ไม่ต้องส่ง type กลับไป
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-white bg-opacity-80 flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-lg rounded-lg shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header Modal --- */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">
            {category ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"} (
            {defaultType === "expense" ? "รายจ่าย" : ""})
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
          {/* (แก้ไข) ลบช่องเลือกประเภท (Type) ออก เพราะหน้านี้กำหนดประเภทตายตัวแล้ว */}

          {/* ช่องกรอกชื่อ */}
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
              placeholder="เช่น ค่าอาหาร, ค่าเดินทาง"
            />
          </div>

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
export default ExpenseCategoriesPage;
