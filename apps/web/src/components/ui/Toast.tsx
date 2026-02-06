'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    AlertCircle, 
    Info, 
    AlertTriangle, 
    X 
} from 'lucide-react';
import { useToast, ToastType, Toast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const toastVariants: Record<ToastType, string> = {
    success: 'border-green-100 dark:border-green-900/30 bg-green-50/80 dark:bg-green-900/10',
    error: 'border-red-100 dark:border-red-900/30 bg-red-50/80 dark:bg-red-900/10',
    info: 'border-blue-100 dark:border-blue-900/30 bg-blue-50/80 dark:bg-blue-900/10',
    warning: 'border-amber-100 dark:border-amber-900/30 bg-amber-50/80 dark:bg-amber-900/10',
};

export function ToastContainer() {
    const { toasts, hideToast } = useToast();

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full sm:w-auto items-end">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onHide={hideToast} />
                ))}
            </AnimatePresence>
        </div>
    );
}

const ToastItem = React.forwardRef<HTMLDivElement, { toast: Toast; onHide: (id: string) => void }>(
    ({ toast, onHide }, ref) => {
        return (
            <motion.div
                ref={ref}
                layout
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                    "pointer-events-auto relative group overflow-hidden flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-colors duration-300",
                    toastVariants[toast.type]
                )}
            >
                {/* Visual Indicator Line */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    toast.type === 'success' && "bg-green-500",
                    toast.type === 'error' && "bg-red-500",
                    toast.type === 'info' && "bg-blue-500",
                    toast.type === 'warning' && "bg-amber-500",
                )} />

                <div className="flex-shrink-0 animate-in zoom-in duration-300">
                    {icons[toast.type]}
                </div>

                <p className="flex-1 text-sm font-bold text-surface-900 dark:text-white mb-0 leading-tight">
                    {toast.message}
                </p>

                <button
                    onClick={() => onHide(toast.id)}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-surface-400 hover:text-surface-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                    <X size={16} />
                </button>

                {/* Progress bar animation if duration exists */}
                {toast.duration && (
                    <motion.div
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                        className={cn(
                            "absolute bottom-0 left-0 right-0 h-0.5 origin-left opacity-30",
                            toast.type === 'success' && "bg-green-500",
                            toast.type === 'error' && "bg-red-500",
                            toast.type === 'info' && "bg-blue-500",
                            toast.type === 'warning' && "bg-amber-500",
                        )}
                    />
                )}
            </motion.div>
        );
    }
);

ToastItem.displayName = 'ToastItem';
