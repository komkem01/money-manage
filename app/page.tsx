"use client";
import { redirect } from 'next/navigation';

/**
 * หน้าหลัก (Homepage)
 * ทำหน้าที่ redirect ผู้ใช้ไปยังหน้า /login ทันที
 */
export default function Home() {
  redirect('/login');
  return null;
}