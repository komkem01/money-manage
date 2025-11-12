"use client";
import React from 'react';

export type FormTone = 'primary' | 'success' | 'danger' | 'warning';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  tone?: FormTone;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const toneStyles: Record<FormTone, {
  accent: string;
  header: string;
  text: string;
}> = {
  primary: {
    accent: 'from-blue-500 via-blue-400 to-blue-600',
    header: 'bg-gradient-to-r from-blue-600/95 via-blue-500/95 to-blue-400/90',
    text: 'text-blue-100',
  },
  success: {
    accent: 'from-green-500 via-emerald-400 to-teal-500',
    header: 'bg-gradient-to-r from-emerald-600/95 via-emerald-500/95 to-teal-400/90',
    text: 'text-emerald-100',
  },
  danger: {
    accent: 'from-red-500 via-rose-400 to-orange-400',
    header: 'bg-gradient-to-r from-rose-600/95 via-rose-500/95 to-orange-400/90',
    text: 'text-rose-100',
  },
  warning: {
    accent: 'from-amber-500 via-yellow-400 to-orange-400',
    header: 'bg-gradient-to-r from-amber-500/95 via-yellow-400/95 to-orange-400/90',
    text: 'text-amber-100',
  },
};

const widthMap: Record<NonNullable<FormModalProps['maxWidth']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
};

const CloseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FormModal: React.FC<FormModalProps> = ({
  open,
  onClose,
  title,
  description,
  tone = 'primary',
  icon,
  maxWidth = 'md',
  children,
}) => {
  if (!open) {
    return null;
  }

  const palette = toneStyles[tone];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${widthMap[maxWidth]} overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${palette.accent}`} />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="ปิดหน้าต่าง"
        >
          <CloseIcon />
        </button>

        <div className={`${palette.header} px-6 py-6 text-white`}
          style={{ backgroundBlendMode: 'multiply' }}
        >
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-2xl font-semibold drop-shadow-sm">{title}</h3>
              {description && (
                <p className={`mt-2 text-sm leading-relaxed ${palette.text}`}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white px-6 pb-7 pt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormModal;
