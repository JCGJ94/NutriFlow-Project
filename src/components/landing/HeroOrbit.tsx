'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Dumbbell, ShieldCheck, ShoppingBasket } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useReducedMotion } from './useReducedMotion';

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const STEP_MS = 3400;
const RING = { cx: 100, cy: 100, r: 92, gap: 5 };

function arcPath(i: number) {
  const span = 360 / DAYS.length;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const point = (deg: number) =>
    `${(RING.cx + RING.r * Math.cos(rad(deg))).toFixed(2)} ${(RING.cy + RING.r * Math.sin(rad(deg))).toFixed(2)}`;
  const start = -90 + i * span + RING.gap / 2;
  const end = -90 + (i + 1) * span - RING.gap / 2;
  return `M ${point(start)} A ${RING.r} ${RING.r} 0 0 1 ${point(end)}`;
}

const chip =
  'absolute z-10 hidden max-w-[15rem] items-center gap-2 rounded-full border border-rule bg-paper/80 px-3.5 py-2 text-sm text-ink backdrop-blur-sm md:flex';

/** Full-viewport hero: a seven-day ring around a dish photo that changes with the day. */
export function HeroOrbit() {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);

  const auto = !reduced && !paused;

  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % DAYS.length), STEP_MS);
    return () => clearTimeout(id);
  }, [active, auto]);

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== 'mouse' || !root.current || !tilt.current) return;
    const r = root.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.current.style.setProperty('--rx', `${(x * 9).toFixed(2)}deg`);
    tilt.current.style.setProperty('--ry', `${(-y * 9).toFixed(2)}deg`);
  };
  const onLeave = () => {
    tilt.current?.style.setProperty('--rx', '0deg');
    tilt.current?.style.setProperty('--ry', '0deg');
  };

  const dayLabel = `${t(`landing.dayfull_${active + 1}`)} · ${t(`landing.dish_${active + 1}`)}`;

  return (
    <section
      ref={root}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="dark relative isolate overflow-clip bg-paper text-ink"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-[62%] h-[130vmin] w-[130vmin] -translate-x-1/2 -translate-y-1/2 lg:left-[72%] lg:top-1/2"
          style={{ background: 'radial-gradient(closest-side, var(--bloom), transparent 72%)' }}
        />
      </div>

      <div className="mx-auto grid min-h-[100svh] w-full max-w-[1200px] items-center gap-12 px-5 pb-14 pt-24 sm:px-8 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-12 lg:pt-24">
        <div>
          <p
            className="reveal inline-flex items-center gap-2 rounded-full border border-rule px-3.5 py-1.5 text-sm uppercase tracking-[0.1em] text-muted"
            style={{ ['--i' as string]: 0 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
            {t('landing.hero_eyebrow')}
          </p>
          <h1 className="reveal type-display mt-6" style={{ ['--i' as string]: 1 }}>
            {t('landing.hero_title_1')}
            <br />
            <span className="text-signal-text">{t('landing.hero_title_2')}</span>
          </h1>
          <p className="reveal mt-6 max-w-[32rem] text-lg text-muted sm:mt-7 sm:text-2xl" style={{ ['--i' as string]: 2 }}>
            {t('landing.hero_subtitle')}
          </p>
          <div className="reveal mt-9 flex flex-wrap items-center gap-x-7 gap-y-4" style={{ ['--i' as string]: 3 }}>
            <Link href="/register" className="btn-primary px-8 py-4 text-lg">
              {t('landing.hero_cta')}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link href="#how-it-works" className="text-lg text-muted underline-offset-4 hover:text-ink hover:underline">
              {t('landing.hero_discover')}
            </Link>
          </div>
          <p className="reveal mt-4 text-base text-muted" style={{ ['--i' as string]: 4 }}>
            {t('landing.hero_no_credit')}
          </p>
          <ul className="reveal mt-10 hidden flex-wrap gap-2.5 sm:flex" style={{ ['--i' as string]: 5 }}>
            {[
              [ShieldCheck, 'landing.hero_chip_1'],
              [ShoppingBasket, 'landing.hero_chip_2'],
              [Dumbbell, 'landing.hero_chip_3'],
            ].map(([Icon, key]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <li
                  key={key as string}
                  className="inline-flex items-center gap-2 rounded-full bg-paper-3 px-4 py-2 text-base text-ink"
                >
                  <I className="h-4 w-4 text-signal-text" aria-hidden="true" />
                  {t(key as string)}
                </li>
              );
            })}
          </ul>
        </div>

        <div
          className="mx-auto w-full max-w-[min(88vw,34rem)]"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            ref={tilt}
            className="stage-in relative aspect-square"
            style={{
              transform: 'perspective(1400px) rotateX(var(--ry, 0deg)) rotateY(var(--rx, 0deg))',
              transition: 'transform 380ms var(--ease-out)',
            }}
          >
            <div aria-hidden="true" className="hero-sweep absolute -inset-[5%] rounded-full opacity-70" />

            <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
              <g strokeWidth="4.5">
                {DAYS.map((_, i) => (
                  <g key={i}>
                    <path
                      d={arcPath(i)}
                      pathLength={1}
                      stroke="var(--rule)"
                      className="arc-base"
                      style={{ ['--i' as string]: i }}
                    />
                    {i < active && (
                      <path
                        d={arcPath(i)}
                        stroke="var(--signal)"
                        strokeOpacity="0.5"
                        style={{ transition: 'stroke-opacity 400ms' }}
                      />
                    )}
                    {i === active && (
                      <path
                        key={`${active}-${auto}`}
                        d={arcPath(i)}
                        pathLength={1}
                        stroke="var(--signal)"
                        className="arc-fill"
                        data-hold={auto ? undefined : ''}
                        style={{ ['--dur' as string]: `${STEP_MS}ms`, filter: 'drop-shadow(0 0 5px var(--signal))' }}
                      />
                    )}
                  </g>
                ))}
              </g>
            </svg>

            <div className="absolute inset-[10%] overflow-hidden rounded-full bg-paper-3">
              {DAYS.map((n, i) => (
                <Image
                  key={n}
                  src={`/landing/day-${n}.webp`}
                  alt={t(`landing.dish_${n}`)}
                  aria-hidden={i !== active}
                  fill
                  sizes="(min-width: 1024px) 460px, 70vw"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  className={`object-cover transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out)] ${
                    i === active ? 'kb opacity-100' : 'scale-110 opacity-0'
                  }`}
                />
              ))}
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/15" />
            </div>

            <svg
              viewBox="0 0 200 200"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full md:block"
            >
              <g stroke="var(--ink)" strokeOpacity="0.55" strokeWidth="1" vectorEffect="non-scaling-stroke">
                <polyline points="148,62 168,30" vectorEffect="non-scaling-stroke" />
                <polyline points="60,72 50,48" vectorEffect="non-scaling-stroke" />
                <polyline points="142,120 150,146" vectorEffect="non-scaling-stroke" />
              </g>
              <g fill="var(--ink)">
                <circle cx="148" cy="62" r="2.2" />
                <circle cx="60" cy="72" r="2.2" />
                <circle cx="142" cy="120" r="2.2" />
              </g>
            </svg>

            <span className={`${chip} right-[-3%] top-[6%]`}>
              <ShieldCheck className="h-4 w-4 shrink-0 text-signal-text" aria-hidden="true" />
              {t('landing.callout_allergens')}
            </span>
            <span className={`${chip} left-[-4%] top-[16%]`}>{dayLabel}</span>
            <span className={`${chip} right-[-4%] bottom-[22%]`}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal text-signal-ink">
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
              {t('landing.callout_list')}
            </span>
          </div>

          <p className="mt-6 text-center text-lg text-ink md:hidden" aria-live="polite">
            {dayLabel}
          </p>

          <div className="mt-6 flex justify-center gap-2" role="group" aria-label={t('landing.ring_label')}>
            {DAYS.map((n, i) => (
              <button
                key={n}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={t(`landing.dayfull_${n}`)}
                className={`h-11 w-11 rounded-full border text-base transition-colors duration-200 ${
                  i === active
                    ? 'border-signal bg-signal text-signal-ink'
                    : 'border-rule text-muted hover:border-ink hover:text-ink'
                }`}
              >
                {t(`landing.day_${n}`)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs uppercase tracking-[0.1em] text-muted">{t('landing.mock_note')}</p>
        </div>
      </div>
    </section>
  );
}
