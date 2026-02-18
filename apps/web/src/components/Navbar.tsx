'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X,
  Calendar,
} from 'lucide-react';
import { Logo } from './Logo';
import { useUser } from '@/context/UserContext';
import { useLanguage } from '@/context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signOut } = useUser();
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    // Close menus first for immediate feedback
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    
    try {
      await signOut();
      router.push('/');
      router.refresh(); // Ensure clean state
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect even if error
      window.location.href = '/';
    }
  };

  const displayName = profile?.username || 'userNutriflow';
  const nameInitial = displayName.charAt(0).toUpperCase();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isDashboard = pathname.startsWith('/dashboard') || 
                      pathname.startsWith('/plan') || 
                      pathname.startsWith('/settings') || 
                      pathname.startsWith('/shopping-list');

  if (isAuthPage) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass dark:glass-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" data-testid="navbar-logo">
            <Logo size={40} className="transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" data-testid="navbar-desktop">
            {!isDashboard ? (
              <>
                <a href="/#features" className="nav-link">{t('nav.features')}</a>
                <a href="/#how-it-works" className="nav-link">{t('nav.howItWorks')}</a>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'text-primary-600 dark:text-primary-400' : ''}`} data-testid="link-dashboard">
                  <LayoutDashboard className="w-4 h-4 inline mr-1" />
                  {t('nav.dashboard')}
                </Link>
                <Link href="/plans" className={`nav-link ${pathname.startsWith('/plans') ? 'text-primary-600 dark:text-primary-400' : ''}`} data-testid="link-plans">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('nav.plans')}
                </Link>
              </>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Premium Language Toggle */}
            <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl items-center relative gap-1 border border-surface-200 dark:border-surface-700 shadow-inner">
              <button
                onClick={() => setLanguage('es')}
                className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all duration-300 z-10 ${
                  language === 'es' 
                    ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm scale-110' 
                    : 'text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all duration-300 z-10 ${
                  language === 'en' 
                    ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm scale-110' 
                    : 'text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300'
                }`}
              >
                EN
              </button>
            </div>

            <ThemeToggle />
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                  data-testid="profile-menu-button"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shadow-sm">
                    {nameInitial.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-surface-700 dark:text-surface-300 max-w-[100px] truncate">
                    {displayName}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsProfileOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-800 py-2 z-20 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-3 border-b border-surface-50 dark:border-surface-800 mb-2">
                        <p className="text-sm font-bold text-surface-900 dark:text-white truncate">{displayName}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user.email}</p>
                      </div>
                      
                      <Link 
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                        data-testid="profile-dropdown-dashboard"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t('nav.dashboard')}
                      </Link>
                      <Link 
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                        data-testid="profile-dropdown-settings"
                      >
                        <Settings className="w-4 h-4" />
                        {t('nav.settings')}
                      </Link>
                      
                      <div className="h-px bg-surface-50 dark:bg-surface-800 my-2" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="btn-primary py-2 px-5 text-sm">
                  {t('nav.startFree')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-surface-600 dark:text-surface-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 animate-in slide-in-from-top-4">
          <div className="px-4 py-6 space-y-4">
            {!isDashboard ? (
              <>
                <a href="#features" className="block text-lg font-medium text-surface-700 dark:text-surface-300 px-2 py-1" onClick={() => setIsMenuOpen(false)}>{t('nav.features')}</a>
                <a href="#how-it-works" className="block text-lg font-medium text-surface-700 dark:text-surface-300 px-2 py-1" onClick={() => setIsMenuOpen(false)}>{t('nav.howItWorks')}</a>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="flex items-center gap-3 text-lg font-medium text-surface-700 dark:text-surface-300 px-2 py-1" onClick={() => setIsMenuOpen(false)} data-testid="mobile-link-dashboard">
                  <LayoutDashboard className="w-5 h-5" />
                  {t('nav.dashboard')}
                </Link>
                 <Link href="/plans" className="flex items-center gap-3 text-lg font-medium text-surface-700 dark:text-surface-300 px-2 py-1" onClick={() => setIsMenuOpen(false)} data-testid="mobile-link-plans">
                  <Calendar className="w-5 h-5" />
                  {t('nav.plans')}
                </Link>
                <Link href="/settings" className="flex items-center gap-3 text-lg font-medium text-surface-700 dark:text-surface-300 px-2 py-1" onClick={() => setIsMenuOpen(false)} data-testid="mobile-link-settings">
                  <Settings className="w-5 h-5" />
                  {t('nav.settings')}
                </Link>
              </>
            )}
            
            {!user && (
              <div className="pt-4 flex flex-col gap-3">
                <Link href="/login" className="btn-secondary w-full text-center py-3" onClick={() => setIsMenuOpen(false)}>{t('nav.login_mobile')}</Link>
                <Link href="/register" className="btn-primary w-full text-center py-3" onClick={() => setIsMenuOpen(false)}>{t('nav.register_mobile')}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

