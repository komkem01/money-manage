"use client";
import { useState, useCallback } from 'react';

export interface NotificationConfig {
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

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showNotification = useCallback((config: NotificationConfig) => {
    setNotification(config);
    setIsOpen(true);
  }, []);

  const hideNotification = useCallback(() => {
    setIsOpen(false);
    // Clear notification after animation
    setTimeout(() => setNotification(null), 300);
  }, []);

  // Predefined notification types
  const showSuccess = useCallback((title: string, message: string, options?: Partial<NotificationConfig>) => {
    showNotification({
      type: 'success',
      title,
      message,
      autoClose: true,
      autoCloseDelay: 3000,
      ...options,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<NotificationConfig>) => {
    showNotification({
      type: 'error',
      title,
      message,
      autoClose: false,
      ...options,
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<NotificationConfig>) => {
    showNotification({
      type: 'warning',
      title,
      message,
      autoClose: false,
      ...options,
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<NotificationConfig>) => {
    showNotification({
      type: 'info',
      title,
      message,
      autoClose: false,
      ...options,
    });
  }, [showNotification]);

  const showConfirmation = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void,
    options?: Partial<NotificationConfig>
  ) => {
    showNotification({
      type: 'warning',
      title,
      message,
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      onConfirm,
      ...options,
    });
  }, [showNotification]);

  return {
    notification,
    isOpen,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
  };
};