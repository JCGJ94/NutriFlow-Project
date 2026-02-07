'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string | string[], type: ToastType, duration?: number) => void;
    hideToast: (id: string) => void;
    toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string | string[], type: ToastType, duration = 4000) => {
        const text = Array.isArray(message) ? message.join(', ') : message;
        // Prevent duplicate toasts
        const isDuplicate = toasts.some(t => t.message === text && t.type === type);
        if (isDuplicate) return;

        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, message: text, type, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, duration);
        }
    }, [toasts, hideToast]);

    return (
        <ToastContext.Provider value={{ showToast, hideToast, toasts }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
