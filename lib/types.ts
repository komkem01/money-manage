// Global TypeScript interfaces for the Money Management System
// Based on database schema

export interface User {
  id: string;
  firstname?: string;
  lastname?: string;
  displayname?: string;
  phone?: string;
  email: string;
  password: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Type {
  id: string;
  name: string; // 'income', 'expense', 'transfer'
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  amount: string; // numeric in database, string for precision
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // Virtual fields for UI
  balance?: string; // alias for amount
}

export interface Category {
  id: string;
  user_id: string;
  type_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // Relations
  type?: Type;
}

export interface Transaction {
  id: string;
  user_id: string;
  type_id: string;
  category_id: string;
  account_id: string;
  related_account_id?: string; // for transfers
  date: string; // bigint timestamp
  description?: string;
  amount: string; // numeric in database, string for precision
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // Relations
  type?: Type;
  category?: Category;
  account?: Account;
  related_account?: Account;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  field?: string;
  count?: number;
}

// Form data types
export interface AccountFormData {
  id?: string | null;
  name: string;
  amount: number;
}

export interface CategoryFormData {
  id?: string | null;
  name: string;
  type_id: string;
}

export interface TransactionFormData {
  id?: string | null;
  type_id: string;
  category_id: string;
  account_id: string;
  related_account_id?: string;
  date: string;
  description?: string;
  amount: number;
}

// Legacy type for backward compatibility
export interface TypeResponse {
  success: boolean;
  message?: string;
  data?: Type[];
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
 * ดึง auth token จาก cookie และ localStorage
 */
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // ลองจาก cookie ก่อน
    const cookieToken = getCookie('authToken');
    if (cookieToken) return cookieToken;
    
    // fallback ไป localStorage
    return localStorage.getItem('authToken');
  }
  return null;
};

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://money-manage-five-gold.vercel.app/api'
    : 'http://localhost:3000/api');

/**
 * Get all types (ไม่ต้องใช้ authentication)
 */
export const getAllTypes = async (): Promise<TypeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get types error:', error);
    throw error;
  }
};

export default {
  getAllTypes,
};