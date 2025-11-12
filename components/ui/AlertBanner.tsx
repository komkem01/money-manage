"use client";
import React from 'react';

export type AlertTone = 'success' | 'error' | 'warning' | 'info';

interface AlertBannerProps {
  tone?: AlertTone;
  title?: string;
  message: React.ReactNode;
  onDismiss?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const iconStyles: Record<AlertTone, { icon: React.ReactNode; gradient: string; iconBg: string; title: string; message: string; border: string; close: string; }>
  = {
    success: {
      icon: (
        <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-green-50 via-white to-white',
      iconBg: 'bg-green-100',
      title: 'text-green-800',
      message: 'text-green-700',
      border: 'border-green-200',
      close: 'text-green-500/70 hover:text-green-600 hover:bg-green-50',
    },
    error: {
      icon: (
        <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-red-50 via-white to-white',
      iconBg: 'bg-red-100',
      title: 'text-red-800',
      message: 'text-red-700',
      border: 'border-red-200',
      close: 'text-red-500/70 hover:text-red-600 hover:bg-red-50',
    },
    warning: {
      icon: (
        <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 5c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 .73 3z" />
        </svg>
      ),
      gradient: 'from-yellow-50 via-white to-white',
      iconBg: 'bg-yellow-100',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      border: 'border-yellow-200',
      close: 'text-yellow-500/70 hover:text-yellow-600 hover:bg-yellow-50',
    },
    info: {
      icon: (
        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-blue-50 via-white to-white',
      iconBg: 'bg-blue-100',
      title: 'text-blue-800',
      message: 'text-blue-700',
      border: 'border-blue-200',
      close: 'text-blue-500/70 hover:text-blue-600 hover:bg-blue-50',
    },
  };

const CloseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AlertBanner: React.FC<AlertBannerProps> = ({
  tone = 'info',
  title,
  message,
  onDismiss,
  actions,
  className = '',
}) => {
  const palette = iconStyles[tone];

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white shadow-lg ${palette.border} ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${palette.gradient}`} />
      <div className="relative flex items-start gap-4 p-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${palette.iconBg}`}>
          {palette.icon}
        </div>
        <div className="flex-1">
          {title && <p className={`text-sm font-semibold ${palette.title}`}>{title}</p>}
          <div className={`mt-1 text-sm leading-relaxed ${palette.message}`}>
            {message}
          </div>
          {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`rounded-full p-1 transition ${palette.close}`}
            aria-label="ปิดการแจ้งเตือน"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;
