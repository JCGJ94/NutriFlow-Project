'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, Twitter, Instagram, Linkedin, Github, Mail } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) return null;

  return (
    <footer className="bg-white dark:bg-surface-950 border-t border-surface-200 dark:border-surface-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-primary-600 rounded-lg group-hover:scale-110 transition-transform">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold text-surface-900 dark:text-white">
                NutriFlow
              </span>
            </Link>
            <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider mb-4">
              {t('footer.product')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#features" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.features')}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.how_it_works')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.pricing')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.testimonials')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company/Support */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider mb-4">
              {t('footer.company')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.careers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider mb-4">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-3 mb-6">
              <li>
                <Link href="/privacy" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  {t('footer.cookies')}
                </Link>
              </li>
            </ul>
            
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                  <Mail className="w-4 h-4" />
                  <span>hola@nutriflow.app</span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800">
          <p className="text-center text-surface-500 dark:text-surface-500 text-sm">
            © {currentYear} NutriFlow. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
