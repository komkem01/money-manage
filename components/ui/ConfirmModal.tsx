"use client";
import React from 'react';

export type ConfirmTone = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  highlight?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  tone?: ConfirmTone;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const toneStyles: Record<ConfirmTone, {
  accent: string;
  iconBg: string;
  icon: React.ReactNode;
  confirm: string;
  confirmHover: string;
  focusRing: string;
}> = {
  danger: {
    accent: 'from-red-500 via-orange-400 to-yellow-400',
    iconBg: 'bg-red-50',
    icon: (
      <svg className="h-7 w-7 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 5c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 .73 3z" />
      </svg>
    ),
    confirm: 'bg-red-600',
    confirmHover: 'hover:bg-red-700',
    focusRing: 'focus:ring-red-300',
  },
  warning: {
    accent: 'from-yellow-500 via-amber-400 to-orange-400',
    iconBg: 'bg-yellow-50',
    icon: (
      <svg className="h-7 w-7 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 5c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 .73 3z" />
      </svg>
    ),
    confirm: 'bg-yellow-500',
    confirmHover: 'hover:bg-yellow-600',
    focusRing: 'focus:ring-yellow-300',
  },
  info: {
    accent: 'from-blue-500 via-cyan-400 to-sky-400',
    iconBg: 'bg-blue-50',
    icon: (
      <svg className="h-7 w-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    confirm: 'bg-blue-600',
    confirmHover: 'hover:bg-blue-700',
    focusRing: 'focus:ring-blue-300',
  },
  success: {
    accent: 'from-green-500 via-emerald-400 to-teal-400',
    iconBg: 'bg-green-50',
    icon: (
      <svg className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    confirm: 'bg-green-600',
    confirmHover: 'hover:bg-green-700',
    focusRing: 'focus:ring-green-300',
  },
};

const CloseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  highlight,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  loading = false,
  disabled = false,
  tone = 'danger',
  errorMessage,
  onConfirm,
  onCancel,
}) => {
  if (!open) {
    return null;
  }

  const palette = toneStyles[tone];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${palette.accent}`} />
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="ปิดหน้าต่างยืนยัน"
        >
          <CloseIcon />
        </button>

        <div className="flex flex-col items-center px-6 pt-10 pb-6 text-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full shadow-inner ${palette.iconBg}`}>
            {palette.icon}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
          <div className="mt-2 text-sm leading-relaxed text-gray-600">{message}</div>
          {highlight && (
            <div className="mt-4 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
              {highlight}
            </div>
          )}
          {errorMessage && (
            <div className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || disabled}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              disabled ? 'bg-gray-400' : `${palette.confirm} ${palette.confirmHover} ${palette.focusRing}`
            }`}
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <circle className="opacity-25" cx="12" cy="12" r="10" />
                <path className="opacity-75" d="M4 12a8 8 0 018-8V2.5a9.5 9.5 0 00-9.5 9.5H4zm2 5.291A7.962 7.962 0 014 12.5H1.5c0 3.042 1.135 5.824 3 7.938L6 17.291z" />
              </svg>
            )}
            {loading ? 'กำลังดำเนินการ...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
