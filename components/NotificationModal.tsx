"use client";
import React, { useEffect } from 'react';

// --- ไอคอน SVG ---
const CheckCircleIcon = () => (
  <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationCircleIcon = () => (
  <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InformationCircleIcon = () => (
  <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon = () => (
  <svg className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const XIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Interface ---
export interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
  showCancelButton?: boolean;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = false,
  autoCloseDelay = 3000,
  showConfirmButton = true,
  confirmButtonText = 'ตกลง',
  showCancelButton = false,
  cancelButtonText = 'ยกเลิก',
  onConfirm,
  onCancel,
}) => {
  // Auto close functionality
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ExclamationCircleIcon />;
      case 'warning':
        return <ExclamationTriangleIcon />;
      case 'info':
        return <InformationCircleIcon />;
      default:
        return <InformationCircleIcon />;
    }
  };

  const getThemeColors = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          confirmBg: 'bg-green-600 hover:bg-green-700',
          confirmText: 'text-white',
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'text-white',
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          confirmText: 'text-white',
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          confirmText: 'text-white',
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700',
          confirmBg: 'bg-gray-600 hover:bg-gray-700',
          confirmText: 'text-white',
        };
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const colors = getThemeColors();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`
          relative w-full max-w-md transform overflow-hidden rounded-2xl 
          ${colors.bgColor} ${colors.borderColor} border-2 
          shadow-2xl transition-all duration-300 ease-out
          animate-in fade-in zoom-in-95
        `}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50 transition-colors"
          >
            <XIcon />
          </button>

          {/* Content */}
          <div className="p-6 pt-8">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>

            {/* Title */}
            <h3 className={`text-xl font-bold text-center mb-3 ${colors.titleColor}`}>
              {title}
            </h3>

            {/* Message */}
            <p className={`text-center mb-6 ${colors.messageColor} leading-relaxed`}>
              {message}
            </p>

            {/* Buttons */}
            <div className="flex justify-center space-x-3">
              {showCancelButton && (
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  {cancelButtonText}
                </button>
              )}
              
              {showConfirmButton && (
                <button
                  onClick={handleConfirm}
                  className={`px-6 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${colors.confirmBg} ${colors.confirmText}`}
                >
                  {confirmButtonText}
                </button>
              )}
            </div>
          </div>

          {/* Auto-close progress bar */}
          {autoClose && (
            <div className="h-1 bg-gray-200">
              <div 
                className={`h-full transition-all ease-linear ${
                  type === 'success' ? 'bg-green-500' :
                  type === 'error' ? 'bg-red-500' :
                  type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
                style={{
                  animation: `shrink ${autoCloseDelay}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationModal;