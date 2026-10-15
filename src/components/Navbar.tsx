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
    } catch (error) {
      console.error('Logout error:', error);
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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-rule bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group" data-testid="navbar-logo">
            <Logo size={40} className="transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" data-testid="navbar-desktop">
            {!isDashboard ? (
              <>
                <Link href="/#features" className="nav-link">{t('nav.features')}</Link>
                <Link href="/#how-it-works" className="nav-link">{t('nav.howItWorks')}</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'text-signal-text' : ''}`} data-testid="link-dashboard">
                  <LayoutDashboard className="w-4 h-4 inline mr-1" />
                  {t('nav.dashboard')}
                </Link>
                <Link href="/plans" className={`nav-link ${pathname.startsWith('/plans') ? 'text-signal-text' : ''}`} data-testid="link-plans">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('nav.plans')}
                </Link>
              </>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Premium Language Toggle */}
            <div className="flex bg-paper-2 p-1 rounded-full items-center relative gap-1 border border-rule">
              <button
                onClick={() => setLanguage('es')}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors duration-200 z-10 ${
                  language === 'es' 
                    ? 'bg-signal text-signal-ink' 
                    : 'text-muted hover:text-ink'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors duration-200 z-10 ${
                  language === 'en' 
                    ? 'bg-signal text-signal-ink' 
                    : 'text-muted hover:text-ink'
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
                  className="flex items-center gap-2 p-1 rounded-full border border-rule hover:bg-paper-2 transition-colors"
                  data-testid="profile-menu-button"
                >
                  <div className="w-8 h-8 rounded-full bg-signal flex items-center justify-center text-signal-ink font-bold">
                    {nameInitial.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-ink max-w-[100px] truncate">
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
                    <div className="absolute right-0 mt-2 w-56 bg-paper-2 rounded-2xl border border-rule py-2 z-20">
                      <div className="px-4 py-3 border-b border-rule mb-2">
                        <p className="text-sm font-bold text-ink truncate">{displayName}</p>
                        <p className="text-xs text-muted truncate">{user.email}</p>
                      </div>
                      
                      <Link 
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-ink hover:bg-paper-3 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                        data-testid="profile-dropdown-dashboard"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t('nav.dashboard')}
                      </Link>
                      <Link 
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-ink hover:bg-paper-3 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                        data-testid="profile-dropdown-settings"
                      >
                        <Settings className="w-4 h-4" />
                        {t('nav.settings')}
                      </Link>
                      
                      <div className="h-px bg-rule my-2" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-paper-3 transition-colors"
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
                <Link href="/login" className="text-sm font-medium text-muted hover:text-ink transition-colors">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="btn-primary py-2 px-5 text-sm">
                  {t('nav.startFree')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-paper border-b border-rule">
          <div className="px-4 py-6 space-y-4">
            {!isDashboard ? (
              <>
                <a href="#features" className="block text-lg font-medium text-ink px-2 py-1" onClick={() => setIsMenuOpen(false)}>{t('nav.features')}</a>
                <a href="#how-it-works" className="block text-lg font-medium text-ink px-2 py-1" onClick={() => setIsMenuOpen(false)}>{t('nav.howItWorks')}</a>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="flex items-center gap-3 text-lg font-medium text-ink px-2 py-1" onClick={() => setIsMenuOpen(false)} data-testid="mobile-link-dashboard">
                  <LayoutDashboard className="w-5 h-5" />
                  {t('nav.dashboard')}
                </Link>
                 <Link href="/plans" className="flex items-center gap-3 text-lg font-medium text-ink px-2 py-1" onClick={() => setIsMenuOpen(false)} data-testid="mobile-link-plans">
                  <Calendar className="w-5 h-5" />
                  {t('nav.plans')}
                </Link>
                <Link href="/settings" className="flex items-center gap-3 text-lg font-medium text-ink px-2 py-1" onClick={() => setIsMenuOpen(false)} data-testid="mobile-link-settings">
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

