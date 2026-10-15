'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from '../context/ToastContext';
import { UserProvider } from '../context/UserContext';
import { PlansProvider } from '../context/PlansContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ConfirmationProvider } from '../context/ConfirmationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <UserProvider>
          <PlansProvider>
            <LanguageProvider>
              <ConfirmationProvider>
                {children}
              </ConfirmationProvider>
            </LanguageProvider>
          </PlansProvider>
        </UserProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
