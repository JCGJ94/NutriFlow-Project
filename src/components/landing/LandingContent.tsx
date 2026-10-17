'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { HeroOrbit } from './HeroOrbit';
import { ScrollWorld } from './ScrollWorld';
import { ALLERGENS } from './StoryPanel';

const DAYS = [1, 2, 3, 4, 5, 6, 7];

/** Fades its children in once, the first time they scroll into view. */
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      data-in={seen ? '' : undefined}
      className={className}
      style={{ ['--d' as string]: delay }}
    >
      {children}
    </div>
  );
}

/** A slow, endless row of the dishes the plan is made of. */
function DishStrip({ t }: { t: (k: string) => string }) {
  return (
    <section className="dark bg-paper pb-24 pt-6 text-ink sm:pb-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p className="max-w-2xl text-2xl text-muted sm:text-3xl">{t('landing.strip_title')}</p>
        </Reveal>
      </div>
      <div
        className="marquee-wrap mt-10 overflow-hidden"
        style={{ maskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)' }}
      >
        <ul className="marquee flex w-max">
          {[...DAYS, ...DAYS].map((n, k) => (
            <li key={k} aria-hidden={k >= DAYS.length} className="mr-5 w-56 shrink-0 sm:w-64">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-paper-3">
                <Image src={`/landing/day-${n}.webp`} alt="" fill sizes="256px" className="object-cover" />
              </div>
              <p className="mt-3 text-lg text-muted">{t(`landing.dish_${n}`)}</p>
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto mt-6 w-full max-w-[1200px] px-5 text-xs uppercase tracking-[0.1em] text-muted sm:px-8">
        {t('landing.mock_note')}
      </p>
    </section>
  );
}

function FeatureCard({
  index,
  title,
  desc,
  image,
  delay,
}: {
  index: number;
  title: string;
  desc: string;
  image: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <article className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl bg-paper-3 p-6 text-white sm:p-7">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 768px) 380px, 90vw"
          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-105"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-black/35" />
        <div className="relative">
          <span className="text-lg opacity-80">{`0${index}`}</span>
          <h3 className="mt-1 text-3xl leading-tight sm:text-4xl">{title}</h3>
        </div>
        <p className="relative max-w-[18rem] text-xl">{desc}</p>
      </article>
    </Reveal>
  );
}

function Features({ t }: { t: (k: string) => string }) {
  return (
    <section id="features" className="light bg-paper py-24 text-ink sm:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <h2 className="type-display-sm max-w-3xl">{t('landing.features_title')}</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <FeatureCard
            index={1}
            title={t('landing.feat_nutrition_title')}
            desc={t('landing.feat_nutrition_desc')}
            image="/landing/card-paella.webp"
            delay={0}
          />
          <FeatureCard
            index={2}
            title={t('landing.feat_training_title')}
            desc={t('landing.feat_training_desc')}
            image="/landing/card-training.webp"
            delay={1}
          />
          <FeatureCard
            index={3}
            title={t('landing.feat_shopping_title')}
            desc={t('landing.feat_shopping_desc')}
            image="/landing/card-market.webp"
            delay={2}
          />
        </div>
      </div>
    </section>
  );
}

function Safe({ t }: { t: (k: string) => string }) {
  const [excluded, setExcluded] = useState(() => new Set(ALLERGENS.filter((a) => a.excluded).map((a) => a.key)));
  const toggle = (key: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const names = ALLERGENS.filter((a) => excluded.has(a.key)).map((a) => t(a.key));

  return (
    <section className="light bg-paper-2 py-24 text-ink sm:py-32">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <h2 className="type-display-sm">{t('landing.safe_title')}</h2>
          <p className="mt-6 max-w-lg text-xl text-muted">{t('landing.safe_desc')}</p>

          <div className="mt-9 flex flex-wrap gap-2.5">
            {ALLERGENS.map((a) => {
              const on = excluded.has(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(a.key)}
                  className={`rounded-full border px-4 py-2 text-lg whitespace-nowrap transition-colors duration-200 ${
                    on
                      ? 'border-signal bg-signal text-signal-ink'
                      : 'border-rule bg-paper text-muted hover:border-ink hover:text-ink'
                  }`}
                >
                  {t(a.key)}
                </button>
              );
            })}
          </div>
          <p className="mt-6 text-lg text-muted" aria-live="polite">
            {names.length ? (
              <>
                {t('landing.safe_out')} <span className="text-ink">{names.join(', ')}</span>
              </>
            ) : (
              t('landing.safe_none')
            )}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.1em] text-muted">{t('landing.safe_hint')}</p>
        </Reveal>

        <Reveal delay={1}>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl bg-paper-3">
            <Image
              src="/landing/card-tortilla.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 448px, 90vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ClosingCta({ t }: { t: (k: string) => string }) {
  return (
    <section className="dark relative isolate flex min-h-[78svh] items-end overflow-clip bg-paper text-ink">
      <Image src="/landing/table.webp" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-60" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/70 to-black/30" />
      <div className="mx-auto w-full max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <h2 className="type-display max-w-4xl">{t('landing.cta_title')}</h2>
          <p className="mt-6 max-w-xl text-xl text-muted sm:text-2xl">{t('landing.cta_desc')}</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/register" className="btn-primary px-9 py-4 text-lg">
              {t('landing.cta_button')}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <span className="text-base text-muted">{t('landing.cta_no_credit')}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingContent() {
  const { t } = useLanguage();

  return (
    <main className="overflow-x-clip">
      <HeroOrbit />
      <DishStrip t={t} />
      <ScrollWorld t={t} />
      <Features t={t} />
      <Safe t={t} />
      <ClosingCta t={t} />
    </main>
  );
}
