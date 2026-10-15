import Link from 'next/link';
import { Logo } from './Logo';

/**
 * Two-column frame for login and register: a quiet brand panel on large
 * screens and the form on a plain paper ground.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[0.9fr_1.1fr]">
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden border-r border-rule bg-paper-2 lg:block"
      >
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(70% 60% at 30% 85%, var(--bloom), transparent 70%)' }}
        />
        <svg viewBox="0 0 200 200" fill="none" className="absolute -bottom-24 -left-24 h-[34rem] w-[34rem]">
          <g strokeWidth="9" strokeLinecap="round" transform="rotate(-90 100 100)">
            <circle cx="100" cy="100" r="78" pathLength="7" strokeDasharray="0.6 0.4" stroke="var(--rule)" />
            <circle cx="100" cy="100" r="78" pathLength="7" strokeDasharray="0.6 6.4" stroke="var(--signal)" />
          </g>
        </svg>
      </aside>

      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" className="w-fit" aria-label="NutriFlow">
          <Logo size={36} />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </main>
  );
}
