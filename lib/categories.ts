import { getAuthToken as getAuthTokenFromAuth } from './auth';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'https://your-domain.com/api'
  : 'http://192.168.1.44:5000/api';

// Types
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
 * Get categories by type
 */
export const getCategoriesByType = async (typeId: string): Promise<CategoryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/type/${typeId}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get categories by type error:', error);
    throw error;
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
 * Update category
 */
export const updateCategory = async (id: string, categoryData: CategoryFormData): Promise<CategoryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
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