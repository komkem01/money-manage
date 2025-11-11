/**
 * Transaction API Service Functions
 * ฟังก์ชันสำหรับเรียก API เกี่ยวกับธุรกรรม
 */

import { getAuthToken as getAuthTokenFromAuth } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://money-manage-five-gold.vercel.app/api'
    : 'http://localhost:3000/api');

// Interface สำหรับ Transaction
export interface Transaction {
  id: string;
  amount: string; // BigInt จาก database จะมาเป็น string
  description?: string;
  date: string; // ฟิลด์ date แทน transaction_date
  created_at: string;
  updated_at?: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type_id: string;
  related_account_id?: string;
  account: {
    id: string;
    name: string;
    amount: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
  };
  category: {
    id: string;
    name: string;
    user_id: string;
    type_id: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    type: {
      id: string;
      name: string;
      created_at?: string;
      updated_at?: string;
    };
  };
  type: {
    id: string;
    name: string;
    created_at?: string;
    updated_at?: string;
  };
  related_account?: {
    id: string;
    name: string;
    amount: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
  } | null;
}

// Interface สำหรับ Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Interface สำหรับ Pagination
interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string;
  error?: string;
}

/**
 * Helper function to get authentication token from auth.ts
 */
function getAuthToken(): string | null {
  return getAuthTokenFromAuth();
}

/**
 * ดึงรายการธุรกรรมทั้งหมดของผู้ใช้ (พร้อม pagination)
 */
export async function getAllTransactions(
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedResponse<Transaction>> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const url = `${API_BASE_URL}/transactions?page=${page}&limit=${limit}`;
    console.log('Fetching transactions from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Transactions response:', data);

    return {
      success: true,
      data: data.data || [],
      pagination: data.pagination,
    };
  } catch (error: any) {
    console.error('Get all transactions error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch transactions',
    };
  }
}

/**
 * ดึงธุรกรรมตาม ID
 */
export async function getTransactionById(id: string): Promise<ApiResponse<Transaction>> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const url = `${API_BASE_URL}/transactions/${id}`;
    console.log('Fetching transaction from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      if (response.status === 404) {
        throw new Error('Transaction not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Transaction response:', data);

    return {
      success: true,
      data: data.data,
    };
  } catch (error: any) {
    console.error('Get transaction by ID error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch transaction',
    };
  }
}

/**
 * สร้างธุรกรรมใหม่
 */
export async function createTransaction(transactionData: {
  amount: number;
  description?: string;
  date?: string;
  transaction_date?: string;
  account_id: string;
  category_id: string;
  related_account_id?: string;
}): Promise<ApiResponse<Transaction>> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const url = `${API_BASE_URL}/transactions`;
    console.log('Creating transaction:', transactionData);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Create transaction response:', data);

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create transaction',
    };
  }
}

/**
 * อัปเดตธุรกรรม
 */
export async function updateTransaction(
  id: string,
  transactionData: {
    amount?: number;
    description?: string;
    date?: string;
    transaction_date?: string;
    account_id?: string;
    category_id?: string;
    related_account_id?: string;
  }
): Promise<ApiResponse<Transaction>> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const url = `${API_BASE_URL}/transactions/${id}`;
    console.log('Updating transaction:', id, transactionData);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      if (response.status === 404) {
        throw new Error('Transaction not found');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Update transaction response:', data);

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update transaction',
    };
  }
}

/**
 * ลบธุรกรรม (Soft Delete)
 */
export async function deleteTransaction(id: string): Promise<ApiResponse<null>> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const url = `${API_BASE_URL}/transactions/${id}`;
    console.log('Deleting transaction:', id);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      if (response.status === 404) {
        throw new Error('Transaction not found');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Delete transaction response:', data);

    return {
      success: true,
      data: null,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete transaction',
    };
  }
}