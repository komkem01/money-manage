"use client";
import React from "react";
import { useRouter } from 'next/navigation';

// --- ไอคอน SVG ---
const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * ปุ่มกลับที่ใช้ร่วมกันได้ทุกหน้า
 * สามารถกำหนด href, label, className และ onClick ได้
 */
export default function BackButton({ 
  href = "/dashboard", 
  label = "กลับหน้าหลัก",
  className = "",
  onClick
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 ${className}`}
    >
      <ArrowLeftIcon />
      {label}
    </button>
  );
}