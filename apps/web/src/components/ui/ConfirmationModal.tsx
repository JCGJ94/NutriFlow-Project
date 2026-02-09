'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export type ConfirmationVariant = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'danger',
}: ConfirmationModalProps) => {
    const { t } = useLanguage();

    const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />,
          button: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
          iconBg: 'bg-red-100 dark:bg-red-900/30'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />,
          button: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
          iconBg: 'bg-green-100 dark:bg-green-900/30'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-primary-600 dark:text-primary-400" />,
          button: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
          iconBg: 'bg-primary-100 dark:bg-primary-900/30'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
            {/* Backdrop & Modal Wrapper for perfect centering */}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            >
                {/* Modal */}
                <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md p-6 overflow-hidden rounded-2xl bg-white dark:bg-surface-900 shadow-xl border border-surface-200 dark:border-surface-800"
                >
                    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                        <div className={cn("p-3 rounded-full mb-4", styles.iconBg)}>
                            {styles.icon}
                        </div>
                        
                        <h3 className="text-xl font-heading font-semibold text-surface-900 dark:text-white mb-2">
                            {title}
                        </h3>
                        
                        {description && (
                            <p className="text-sm text-surface-600 dark:text-surface-300 mb-6">
                                {description}
                            </p>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row w-full gap-3 mt-2 sm:justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-surface-700 bg-surface-100 hover:bg-surface-200 dark:text-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-surface-400"
                            >
                                {cancelText || t('common.cancel')}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
                                    styles.button
                                )}
                            >
                                {confirmText || t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
