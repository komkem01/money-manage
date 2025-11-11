// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://money-manage-five-gold.vercel.app/api'
    : 'http://localhost:3000/api');// Types
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  displayname: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    tokenType: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

// Register Data Interface
export interface RegisterData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  displayname: string;
  phone: string;
}

// Login Data Interface
export interface LoginData {
  email: string;
  password: string;
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
 * Register new user
 */
export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get user profile (with token)
 */
export const getUserProfile = async (token: string): Promise<{ success: boolean; data: { user: User } }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับจัดการ Cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${isSecure ? ';Secure' : ''}`;
};

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

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
};

/**
 * Store token in cookie with localStorage fallback
 */
export const storeAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    // เก็บใน cookie (primary)
    setCookie('authToken', token, 7); // เก็บ 7 วัน
    
    // เก็บใน localStorage (fallback สำหรับ compatibility)
    localStorage.setItem('authToken', token);
    
    console.log('Token stored in cookie and localStorage');
  }
};

/**
 * Get token from cookie with localStorage fallback
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // ลองอ่านจาก cookie ก่อน (primary)
    const cookieToken = getCookie('authToken');
    if (cookieToken) {
      console.log('Token retrieved from cookie');
      return cookieToken;
    }
    
    // ถ้าไม่มีใน cookie ลองใน localStorage (fallback)
    const localToken = localStorage.getItem('authToken');
    if (localToken) {
      console.log('Token retrieved from localStorage (fallback)');
      // ถ้าเรื่องใน localStorage มีแต่ cookie ไม่มี ให้ sync กลับไปใน cookie
      setCookie('authToken', localToken, 7);
    }
    
    return localToken;
  }
  return null;
};

/**
 * Remove token from both cookie and localStorage
 */
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    deleteCookie('authToken');
    localStorage.removeItem('authToken');
    console.log('Token removed from cookie and localStorage');
  }
};

/**
 * Store user data in cookie with localStorage fallback
 */
export const storeUserData = (user: User): void => {
  if (typeof window !== 'undefined') {
    const userData = JSON.stringify(user);
    
    // เก็บใน cookie (primary)
    setCookie('userData', userData, 7); // เก็บ 7 วัน
    
    // เก็บใน localStorage (fallback)
    localStorage.setItem('userData', userData);
    
    console.log('User data stored in cookie and localStorage');
  }
};

/**
 * Get user data from cookie with localStorage fallback
 */
export const getUserData = (): User | null => {
  if (typeof window !== 'undefined') {
    // ลองอ่านจาก cookie ก่อน (primary)
    const cookieData = getCookie('userData');
    if (cookieData) {
      try {
        console.log('User data retrieved from cookie');
        return JSON.parse(cookieData);
      } catch (e) {
        console.error('Error parsing cookie userData:', e);
        deleteCookie('userData'); // ลบ cookie ที่เสียหาย
      }
    }
    
    // ถ้าไม่มีใน cookie ลองใน localStorage (fallback)
    const localData = localStorage.getItem('userData');
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        console.log('User data retrieved from localStorage (fallback)');
        // sync กลับไปใน cookie
        setCookie('userData', localData, 7);
        return parsedData;
      } catch (e) {
        console.error('Error parsing localStorage userData:', e);
        localStorage.removeItem('userData'); // ลบ localStorage ที่เสียหาย
      }
    }
  }
  
  return null;
};

/**
 * Remove user data from both cookie and localStorage
 */
export const removeUserData = (): void => {
  if (typeof window !== 'undefined') {
    deleteCookie('userData');
    localStorage.removeItem('userData');
    console.log('User data removed from cookie and localStorage');
  }
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  storeAuthToken,
  getAuthToken,
  removeAuthToken,
  storeUserData,
  getUserData,
  removeUserData,
};