"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      console.log('AuthGuard: Checking authentication...', { hasToken: !!token });
      
      if (!token) {
        console.log('AuthGuard: No token found, redirecting to login');
        setIsAuthenticated(false);
        router.push('/login');
        return;
      }
      
      console.log('AuthGuard: Token found, user is authenticated');
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  // แสดง loading หรือ fallback ขณะตรวจสอบ
  if (isAuthenticated === null) {
    return fallback || (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</span>
      </div>
    );
  }

  // ถ้ายังไม่ authenticated ให้แสดง loading (จะ redirect ไปหน้า login อยู่แล้ว)
  if (!isAuthenticated) {
    return fallback || (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">กำลังเปลี่ยนหน้า...</span>
      </div>
    );
  }

  // ถ้า authenticated แล้วให้แสดง children
  return <>{children}</>;
}