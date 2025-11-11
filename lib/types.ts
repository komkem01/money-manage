// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://money-manage-five-gold.vercel.app/api'
    : 'http://localhost:3000/api');// Types
export interface Type {
  id: string;
  name: 'Income' | 'Expense' | 'Transfer';
}

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