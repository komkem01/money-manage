// Account API functions

// Interface definitions
export interface Account {
  id: string;
  name: string;
  balance: string;
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

import { getAuthToken as getAuthTokenFromAuth } from './auth';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://money-manage-five-gold.vercel.app/api'
    : 'http://localhost:3000/api');

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
/**
 * ดึง auth token จาก auth.ts
 */
export const getAuthToken = (): string | null => {
  return getAuthTokenFromAuth();
};

/**
 * ดึงบัญชีทั้งหมดของผู้ใช้
 */
export const getAllAccounts = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error('No authentication token found in getAllAccounts');
      return {
        success: false,
        message: 'Authentication token not found',
        data: null
      };
    }

    console.log('Fetching accounts with token:', token.substring(0, 10) + '...');

    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('Accounts API response:', { status: response.status, data });

    if (!response.ok) {
      console.error('Accounts API error:', data);
      return {
        success: false,
        message: data.message || 'Failed to fetch accounts',
        data: null
      };
    }

    return data;
  } catch (error: any) {
    console.error('Get accounts error:', error);
    return {
      success: false,
      message: error.message || 'Network error',
      data: null
    };
  }
};

/**
 * ดึงบัญชีเดียว
 */
export const getAccountById = async (accountId: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch account');
    }

    return data;
  } catch (error) {
    console.error('Get account by ID error:', error);
    throw error;
  }
};

/**
 * สร้างบัญชีใหม่
 */
export const createAccount = async (accountData: {
  name: string;
  amount: number;
}) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(accountData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create account');
    }

    return data;
  } catch (error) {
    console.error('Create account error:', error);
    throw error;
  }
};

/**
 * อัปเดตบัญชี (ใช้ PATCH method สำหรับ partial updates)
 */
export const updateAccount = async (accountId: string, accountData: {
  name?: string;
  amount?: number;
}) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(accountData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update account');
    }

    return data;
  } catch (error) {
    console.error('Update account error:', error);
    throw error;
  }
};

/**
 * ลบบัญชี
 */
export const deleteAccount = async (accountId: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete account');
    }

    return data;
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};