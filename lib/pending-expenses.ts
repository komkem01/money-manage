import { PendingExpense, PendingExpenseFormData, ApiResponse } from './types';
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://money-manage-five-gold.vercel.app/api'
    : 'http://localhost:3000/api');

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
 * Get all pending expenses
 */
export const getAllPendingExpenses = async (): Promise<ApiResponse<PendingExpense[]>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/pending-expenses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get pending expenses error:', error);
    throw error;
  }
};

/**
 * Get pending expense by ID
 */
export const getPendingExpenseById = async (id: string): Promise<ApiResponse<PendingExpense>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/pending-expenses/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get pending expense error:', error);
    throw error;
  }
};

/**
 * Create new pending expense
 */
export const createPendingExpense = async (data: Omit<PendingExpenseFormData, 'id'>): Promise<ApiResponse<PendingExpense>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/pending-expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Create pending expense error:', error);
    throw error;
  }
};

/**
 * Update pending expense
 */
export const updatePendingExpense = async (id: string, data: Partial<PendingExpenseFormData>): Promise<ApiResponse<PendingExpense>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/pending-expenses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Update pending expense error:', error);
    throw error;
  }
};

/**
 * Delete pending expense
 */
export const deletePendingExpense = async (id: string): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/pending-expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Delete pending expense error:', error);
    throw error;
  }
};

/**
 * Convert pending expense to transaction
 */
export const convertToTransaction = async (id: string, account_id: string): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/pending-expenses/${id}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ account_id })
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Convert to transaction error:', error);
    throw error;
  }
};

/**
 * Mark pending expense as paid (without creating transaction)
 */
export const markAsPaid = async (id: string): Promise<ApiResponse<PendingExpense>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/pending-expenses/${id}/mark-paid`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Mark as paid error:', error);
    throw error;
  }
};