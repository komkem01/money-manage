/**
 * Transaction API Service Functions
 * ฟังก์ชันสำหรับเรียก API เกี่ยวกับธุรกรรม
 */

import { getAuthToken as getAuthTokenFromAuth } from './auth';
import { Transaction, TransactionFormData, ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://money-manage-five-gold.vercel.app/api'
    : 'http://localhost:3000/api');

// Using interfaces from lib/types.ts

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
  errorCode?: string;
  field?: string;
  status?: number;
  details?: unknown;
}

interface ApiErrorDetails {
  error?: string;
  message?: string;
  field?: string;
  details?: unknown;
  [key: string]: unknown;
}

function buildErrorResponse<T>(
  error: Error,
  options: {
    status?: number;
    payload?: ApiErrorDetails | null;
  } = {}
): ApiResponse<T> {
  const payload = options.payload ?? {};
  return {
    success: false,
    error: (payload.message as string) || error.message || 'Unknown error',
    field: payload.field as string | undefined,
    message: (payload.message as string) || error.message || 'Unknown error'
  };
}

function buildPaginatedErrorResponse<T>(
  error: Error,
  options: {
    status?: number;
    payload?: ApiErrorDetails | null;
  } = {}
): PaginatedResponse<T> {
  const payload = options.payload ?? {};
  return {
    success: false,
    error: (payload.message as string) || error.message || 'Unknown error',
    field: payload.field as string | undefined,
    message: (payload.message as string) || error.message || 'Unknown error'
  };
}

async function parseJsonSafely(response: Response): Promise<ApiErrorDetails | null> {
  try {
    return await response.json();
  } catch (error) {
    console.warn('Failed to parse JSON response:', error);
    return null;
  }
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

    const payload = await parseJsonSafely(response);

    if (!response.ok || payload?.success === false) {
      if (response.status === 401) {
        return buildPaginatedErrorResponse<Transaction>(
          new Error(payload?.message as string || 'Authentication failed. Please login again.'),
          { status: response.status, payload }
        );
      }

      return buildPaginatedErrorResponse<Transaction>(
        new Error(payload?.message as string || `HTTP error! status: ${response.status}`),
        { status: response.status, payload }
      );
    }

    console.log('Transactions response:', payload);

    return {
      success: true,
      data: (payload?.data as Transaction[]) || [],
      pagination: payload?.pagination as PaginatedResponse<Transaction>['pagination'],
      message: payload?.message as string | undefined,
    };
  } catch (error: any) {
    console.error('Get all transactions error:', error);
    return buildPaginatedErrorResponse<Transaction>(error instanceof Error ? error : new Error(String(error)));
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

    const payload = await parseJsonSafely(response);

    if (!response.ok || payload?.success === false) {
      if (response.status === 401) {
        return buildErrorResponse<Transaction>(
          new Error(payload?.message as string || 'Authentication failed. Please login again.'),
          { status: response.status, payload }
        );
      }
      if (response.status === 404) {
        return buildErrorResponse<Transaction>(
          new Error(payload?.message as string || 'Transaction not found'),
          { status: response.status, payload }
        );
      }

      return buildErrorResponse<Transaction>(
        new Error(payload?.message as string || `HTTP error! status: ${response.status}`),
        { status: response.status, payload }
      );
    }

    console.log('Transaction response:', payload);

    return {
      success: true,
      data: payload?.data as Transaction,
      message: payload?.message as string | undefined,
    };
  } catch (error: any) {
    console.error('Get transaction by ID error:', error);
    return buildErrorResponse<Transaction>(error instanceof Error ? error : new Error(String(error)));
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

    const payload = await parseJsonSafely(response);

    if (!response.ok || payload?.success === false) {
      if (response.status === 401) {
        return buildErrorResponse<Transaction>(
          new Error(payload?.message as string || 'Authentication failed. Please login again.'),
          { status: response.status, payload }
        );
      }

      return buildErrorResponse<Transaction>(
        new Error(payload?.message as string || `HTTP error! status: ${response.status}`),
        { status: response.status, payload }
      );
    }

    console.log('Create transaction response:', payload);

    return {
      success: true,
      data: payload?.data as Transaction,
      message: payload?.message as string | undefined,
    };
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return buildErrorResponse<Transaction>(error instanceof Error ? error : new Error(String(error)));
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
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    const payload = await parseJsonSafely(response);

    if (!response.ok || payload?.success === false) {
      if (response.status === 401) {
        return buildErrorResponse<Transaction>(
          new Error(payload?.message as string || 'Authentication failed. Please login again.'),
          { status: response.status, payload }
        );
      }
      if (response.status === 404) {
        return buildErrorResponse<Transaction>(
          new Error(payload?.message as string || 'Transaction not found'),
          { status: response.status, payload }
        );
      }

      return buildErrorResponse<Transaction>(
        new Error(payload?.message as string || `HTTP error! status: ${response.status}`),
        { status: response.status, payload }
      );
    }

    console.log('Update transaction response:', payload);

    return {
      success: true,
      data: payload?.data as Transaction,
      message: payload?.message as string | undefined,
    };
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return buildErrorResponse<Transaction>(error instanceof Error ? error : new Error(String(error)));
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

    const payload = await parseJsonSafely(response);

    if (!response.ok || payload?.success === false) {
      if (response.status === 401) {
        return buildErrorResponse<null>(
          new Error(payload?.message as string || 'Authentication failed. Please login again.'),
          { status: response.status, payload }
        );
      }
      if (response.status === 404) {
        return buildErrorResponse<null>(
          new Error(payload?.message as string || 'Transaction not found'),
          { status: response.status, payload }
        );
      }

      return buildErrorResponse<null>(
        new Error(payload?.message as string || `HTTP error! status: ${response.status}`),
        { status: response.status, payload }
      );
    }

    console.log('Delete transaction response:', payload);

    return {
      success: true,
      data: null,
      message: payload?.message as string | undefined,
    };
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    return buildErrorResponse<null>(error instanceof Error ? error : new Error(String(error)));
  }
}