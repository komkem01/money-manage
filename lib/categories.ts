import { getAuthToken as getAuthTokenFromAuth } from './auth';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://money-manage-five-gold.vercel.app/api'
    : 'http://localhost:3000/api');// Types
export interface Category {
  id: string;
  name: string;
  user_id: string;
  type_id: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  type: {
    id: string;
    name: string;
  };
}

export interface CategoryFormData {
  name: string;
  type_id: string;
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data?: Category | Category[];
}

/**
 * Handle API Response
 */
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }
  
  return data;
};

/**
 * Get Cookie Helper
 */
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * ดึง auth token จาก auth.ts
 */
const getAuthToken = () => {
  return getAuthTokenFromAuth();
};

/**
 * Get Authorization Header
 */
const getAuthHeader = (): Record<string, string> => {
  const token = getAuthToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  }
  return { 'Content-Type': 'application/json' };
};

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<CategoryResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error('No authentication token found in getAllCategories');
      return {
        success: false,
        message: 'Authentication token not found',
        data: undefined
      };
    }

    console.log('Fetching categories with token:', token.substring(0, 10) + '...');

    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    const result = await handleResponse(response);
    console.log('Categories API response:', result);
    
    return result;
  } catch (error: any) {
    console.error('Get categories error:', error);
    return {
      success: false,
      message: error.message || 'Network error',
      data: undefined
    };
  }
};

/**
 * Get categories by type (filter จาก getAllCategories)
 */
export const getCategoriesByType = async (typeId: string): Promise<CategoryResponse> => {
  try {
    console.log('Getting categories by type:', typeId);
    const allCategoriesResponse = await getAllCategories();
    
    if (!allCategoriesResponse.success) {
      console.error('Failed to get all categories:', allCategoriesResponse.message);
      return allCategoriesResponse;
    }

    // API /categories ตอนนี้ return { data: Array, grouped: Object }
    const responseData = allCategoriesResponse.data as any;
    
    // ใช้ data array และ filter ตาม type_id
    if (responseData && Array.isArray(responseData)) {
      const filteredCategories = responseData.filter(
        (category: Category) => category.type_id === typeId
      );
      
      console.log('Filtered categories:', filteredCategories);
      
      return {
        success: true,
        data: filteredCategories,
        message: allCategoriesResponse.message
      };
    }

    // Fallback ถ้า format ไม่ตรง
    console.error('Unexpected data format from getAllCategories:', responseData);
    return {
      success: false,
      message: 'Unexpected data format from server'
    };
  } catch (error) {
    console.error('Get categories by type error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch categories by type'
    };
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: string): Promise<CategoryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get category error:', error);
    throw error;
  }
};

/**
 * Create new category
 */
export const createCategory = async (categoryData: CategoryFormData): Promise<CategoryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(categoryData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Create category error:', error);
    throw error;
  }
};

/**
 * Update category (ใช้ PATCH method สำหรับ partial updates)
 */
export const updateCategory = async (id: string, categoryData: Partial<CategoryFormData>): Promise<CategoryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(categoryData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (id: string): Promise<CategoryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
};

export default {
  getAllCategories,
  getCategoriesByType,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};