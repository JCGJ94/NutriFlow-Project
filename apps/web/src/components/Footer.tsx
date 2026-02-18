'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Twitter, Instagram, Github, Mail } from 'lucide-react';
import { Logo } from './Logo';

import { useLanguage } from '@/context/LanguageContext';

import { useToast } from '@/context/ToastContext';

export function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const currentYear = new Date().getFullYear();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) return null;

  const handlePlaceholder = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast('Esta función estará disponible pronto', 'info');
  };

  return (
    <footer className="bg-white dark:bg-surface-950 border-t border-surface-200 dark:border-surface-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Column - Spans 2 columns on mobile */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <Logo size={32} className="transition-transform group-hover:scale-105" />
              <span className="font-heading font-bold text-xl text-surface-900 dark:text-white">NutriFlow</span>
            </Link>
            <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a 
                href="https://twitter.com/nutriflow_app" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handlePlaceholder}
                className="text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/nutriflow_app" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handlePlaceholder}
                className="text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              {/* GitHub Link - functional if public, otherwise placeholder */}
              <a 
                href="https://github.com/jcgonzalez94/NutriFlow-Project" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="col-span-1">
            <h3 className="text-xs font-bold text-surface-900 dark:text-white uppercase tracking-wider mb-4">
              {t('footer.product')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#features" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors block py-0.5">
                  {t('footer.features')}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors block py-0.5">
                  {t('footer.how_it_works')}
                </Link>
              </li>
              <li>
                <a href="#" onClick={handlePlaceholder} className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors block py-0.5">
                  {t('footer.pricing')}
                </a>
              </li>
              <li>
                <a href="#" onClick={handlePlaceholder} className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors block py-0.5">
                  {t('footer.testimonials')}
                </a>
              </li>
            </ul>
          </div>

          {/* Company/Support */}
          <div className="col-span-1">
            <h3 className="text-xs font-bold text-surface-900 dark:text-white uppercase tracking-wider mb-4">
              {t('footer.company')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" onClick={handlePlaceholder} className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors block py-0.5">
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a href="#" onClick={handlePlaceholder} className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors block py-0.5">
                  {t('footer.blog')}
                </a>
              </li>
              <li>
                <a href="mailto:hola@nutriflow.app" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors block py-0.5">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Contact Info - Spans 2 columns on mobile if needed, but let's keep it 1 for grid symmetry or 2 if we want footer-bottom style */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-xs font-bold text-surface-900 dark:text-white uppercase tracking-wider mb-4">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-3 mb-6">
              <li>
                <Link href="/privacy" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors block py-0.5">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors block py-0.5">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors block py-0.5">
                  {t('footer.cookies')}
                </Link>
              </li>
            </ul>
            
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-900/50 p-3 rounded-xl border border-surface-100 dark:border-surface-800 w-fit">
               <Mail className="w-4 h-4 text-primary-600" />
               <a href="mailto:hola@nutriflow.app" className="hover:text-primary-600 transition-colors font-medium">hola@nutriflow.app</a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-center md:text-left text-surface-500 text-xs">
            © {currentYear} NutriFlow. {t('footer.rights')}
          </p>
          <div className="flex gap-4 text-xs text-surface-500">
             <span>v0.1.0 Beta</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
