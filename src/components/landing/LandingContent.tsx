'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const RING = { cx: 100, cy: 100, r: 78, gap: 10 };
const DAY_KEYS = [1, 2, 3, 4, 5, 6, 7].map((n) => `landing.day_${n}`);

function arcPath(i: number) {
  const span = 360 / 7;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const point = (deg: number) =>
    `${(RING.cx + RING.r * Math.cos(rad(deg))).toFixed(2)} ${(RING.cy + RING.r * Math.sin(rad(deg))).toFixed(2)}`;
  const start = -90 + i * span + RING.gap / 2;
  const end = -90 + (i + 1) * span - RING.gap / 2;
  return `M ${point(start)} A ${RING.r} ${RING.r} 0 0 1 ${point(end)}`;
}

function labelPoint(i: number) {
  const mid = ((-90 + (i + 0.5) * (360 / 7)) * Math.PI) / 180;
  const r = RING.r - 24;
  return { x: RING.cx + r * Math.cos(mid), y: RING.cy + r * Math.sin(mid) };
}

/** Seven arcs, one per day of the plan; they light up in order on load. */
function WeekRing({ label, days }: { label: string; days: string[] }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" role="img" aria-label={label} className="h-auto w-full">
      <g strokeWidth="9" strokeLinecap="round">
        {days.map((_, i) => (
          <g key={i}>
            <path d={arcPath(i)} stroke="var(--rule)" />
            <path d={arcPath(i)} stroke="var(--signal)" className="arc-lit" style={{ ['--i' as string]: i }} />
          </g>
        ))}
      </g>
      {days.map((d, i) => {
        const p = labelPoint(i);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted font-mono"
            style={{ fontSize: 9 }}
          >
            {d}
          </text>
        );
      })}
      <text x="100" y="98" textAnchor="middle" dominantBaseline="central" className="fill-ink font-heading" style={{ fontSize: 44, fontWeight: 600 }}>
        7
      </text>
      <text x="100" y="124" textAnchor="middle" className="fill-muted font-mono" style={{ fontSize: 8, letterSpacing: '0.12em' }}>
        {label.toUpperCase()}
      </text>
    </svg>
  );
}

const ALLERGENS = [
  { key: 'landing.al_gluten', excluded: true },
  { key: 'landing.al_crustaceans', excluded: false },
  { key: 'landing.al_eggs', excluded: false },
  { key: 'landing.al_fish', excluded: false },
  { key: 'landing.al_peanuts', excluded: true },
  { key: 'landing.al_soy', excluded: false },
  { key: 'landing.al_milk', excluded: true },
  { key: 'landing.al_nuts', excluded: false },
  { key: 'landing.al_sesame', excluded: false },
  { key: 'landing.al_mustard', excluded: false },
];

const SHOPPING = [
  { key: 'landing.shop_rice', done: true },
  { key: 'landing.shop_chicken', done: true },
  { key: 'landing.shop_broccoli', done: false },
  { key: 'landing.shop_bananas', done: false },
  { key: 'landing.shop_oil', done: false },
];

function StoryPanel({ active, t }: { active: number; t: (k: string) => string }) {
  const layer = (n: number) =>
    `absolute inset-0 flex flex-col justify-center gap-5 p-6 sm:p-8 transition-opacity duration-[420ms] ease-[var(--ease-out)] ${
      active === n ? 'opacity-100' : 'pointer-events-none opacity-0'
    }`;
  const pill = 'rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap';

  return (
    <div
      className="relative h-60 overflow-hidden rounded-3xl border border-rule bg-paper-2 sm:h-72 lg:h-[30rem]"
      aria-hidden="true"
    >
      <div className={layer(0)}>
        <div>
          <p className="mb-2.5 font-mono text-xs uppercase tracking-widest text-muted">{t('landing.mock_goal')}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`${pill} border-signal bg-signal text-signal-ink`}>{t('landing.mock_goal_lose')}</span>
            <span className={`${pill} border-rule text-muted`}>{t('landing.mock_goal_keep')}</span>
            <span className={`${pill} border-rule text-muted`}>{t('landing.mock_goal_gain')}</span>
          </div>
        </div>
        <div>
          <p className="mb-2.5 font-mono text-xs uppercase tracking-widest text-muted">{t('landing.mock_activity')}</p>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`h-2.5 w-10 rounded-full ${i < 3 ? 'bg-signal' : 'bg-paper-3'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className={layer(1)}>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{t('landing.mock_allergens')}</p>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((a) => (
            <span
              key={a.key}
              className={`${pill} ${a.excluded ? 'border-signal bg-signal text-signal-ink' : 'border-rule text-muted'}`}
            >
              {t(a.key)}
            </span>
          ))}
        </div>
      </div>

      <div className={layer(2)}>
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {DAY_KEYS.map((k, i) => (
            <div key={k} className="flex flex-col gap-2">
              <span className="text-center font-mono text-xs text-muted">{t(k)}</span>
              {[0, 1, 2].map((m) => (
                <span
                  key={m}
                  className={`h-9 rounded-lg sm:h-12 lg:h-16 ${i === 0 && m === 1 ? 'bg-signal' : 'bg-paper-3'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={layer(3)}>
        <ul className="flex flex-col gap-3">
          {SHOPPING.map((s) => (
            <li key={s.key} className="flex items-center gap-3">
              <span
                className={`h-5 w-5 shrink-0 rounded-md border ${s.done ? 'border-signal bg-signal' : 'border-rule'}`}
              />
              <span className={`text-base sm:text-lg ${s.done ? 'text-muted line-through' : 'text-ink'}`}>{t(s.key)}</span>
            </li>
          ))}
        </ul>
      </div>

      <span className="absolute bottom-3 right-4 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
        {t('landing.mock_note')}
      </span>
    </div>
  );
}

function Story({ t }: { t: (k: string) => string }) {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    steps.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="border-t border-rule py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <h2 className="max-w-2xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">{t('landing.story_title')}</h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-16">
          <div className="sticky top-16 z-10 -mx-5 bg-paper px-5 py-3 sm:-mx-8 sm:px-8 lg:top-24 lg:mx-0 lg:h-fit lg:px-0 lg:py-0">
            <StoryPanel active={active} t={t} />
          </div>

          <ol className="flex flex-col">
            {[1, 2, 3, 4].map((n, i) => (
              <li
                key={n}
                data-step={i}
                ref={(el) => {
                  steps.current[i] = el;
                }}
                className={`flex min-h-[42vh] flex-col justify-center py-8 transition-opacity duration-[420ms] ease-[var(--ease-out)] lg:min-h-[60vh] ${
                  active === i ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <span className="font-mono text-sm text-signal-text">{`0${n}`}</span>
                <h3 className="mt-3 text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">{t(`landing.step_${n}_title`)}</h3>
                <p className="mt-3 max-w-md text-lg text-muted">{t(`landing.step_${n}_desc`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function LandingContent() {
  const { t } = useLanguage();
  const days = DAY_KEYS.map((k) => t(k));

  return (
    <main className="overflow-x-clip">
      <section className="relative isolate pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(55% 60% at 78% 38%, var(--bloom), transparent 70%)' }}
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="reveal text-[clamp(2.75rem,7.5vw,5.75rem)] leading-[1.02]" style={{ ['--i' as string]: 0 }}>
              {t('landing.hero_title_1')}
              <br />
              <span className="text-signal-text">{t('landing.hero_title_2')}</span>
            </h1>
            <p className="reveal mt-6 max-w-xl text-lg text-muted sm:text-xl" style={{ ['--i' as string]: 1 }}>
              {t('landing.hero_subtitle')}
            </p>
            <div className="reveal mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ ['--i' as string]: 2 }}>
              <Link href="/register" className="btn-primary px-7 py-3.5 text-base">
                {t('landing.hero_cta')}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link href="#how-it-works" className="text-base font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
                {t('landing.hero_discover')}
              </Link>
            </div>
            <p className="reveal mt-4 text-sm text-muted" style={{ ['--i' as string]: 3 }}>
              {t('landing.hero_no_credit')}
            </p>
          </div>

          <div className="mx-auto w-full max-w-md lg:-mr-24 lg:max-w-none">
            <WeekRing label={t('landing.ring_label')} days={days} />
          </div>
        </div>
      </section>

      <Story t={t} />

      <section id="features" className="border-t border-rule py-20 sm:py-28">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <h2 className="max-w-2xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">{t('landing.features_title')}</h2>
          <ol className="mt-12">
            {['nutrition', 'training', 'shopping'].map((k, i) => (
              <li
                key={k}
                className="grid gap-2 border-t border-rule py-8 last:border-b md:grid-cols-[6rem_1fr_1.2fr] md:gap-8"
              >
                <span className="font-mono text-sm text-muted">{`0${i + 1}`}</span>
                <h3 className="text-2xl sm:text-3xl">{t(`landing.feat_${k}_title`)}</h3>
                <p className="text-lg text-muted">{t(`landing.feat_${k}_desc`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-rule bg-paper-2 py-20 sm:py-28">
        <div className="mx-auto grid w-full max-w-6xl items-end gap-8 px-5 sm:px-8 md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="max-w-2xl text-[clamp(2rem,5vw,4rem)] leading-[1.03]">{t('landing.cta_title')}</h2>
            <p className="mt-4 max-w-xl text-lg text-muted">{t('landing.cta_desc')}</p>
          </div>
          <div>
            <Link href="/register" className="btn-primary px-8 py-4 text-base">
              {t('landing.cta_button')}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <p className="mt-3 text-sm text-muted">{t('landing.cta_no_credit')}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
