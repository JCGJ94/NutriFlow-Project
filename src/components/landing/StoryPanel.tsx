'use client';

import Image from 'next/image';

const DAY_KEYS = [1, 2, 3, 4, 5, 6, 7].map((n) => `landing.day_${n}`);

export const ALLERGENS = [
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

/** Illustrative product mock-up: one layer per story step, the active one is shown. */
export function StoryPanel({ active, t }: { active: number; t: (k: string) => string }) {
  const layer = (n: number) =>
    `absolute inset-0 flex flex-col justify-center gap-5 p-6 sm:p-8 transition-opacity duration-[420ms] ease-[var(--ease-out)] ${
      active === n ? 'opacity-100' : 'pointer-events-none opacity-0'
    }`;
  const pill = 'rounded-full border px-3.5 py-1.5 text-base whitespace-nowrap';

  return (
    <div
      className="relative h-60 overflow-hidden rounded-3xl border border-rule bg-paper-2 sm:h-72 lg:h-[30rem]"
      aria-hidden="true"
    >
      <div className={layer(0)}>
        <div>
          <p className="mb-2.5 text-sm uppercase tracking-[0.1em] text-muted">{t('landing.mock_goal')}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`${pill} border-signal bg-signal text-signal-ink`}>{t('landing.mock_goal_lose')}</span>
            <span className={`${pill} border-rule text-muted`}>{t('landing.mock_goal_keep')}</span>
            <span className={`${pill} border-rule text-muted`}>{t('landing.mock_goal_gain')}</span>
          </div>
        </div>
        <div>
          <p className="mb-2.5 text-sm uppercase tracking-[0.1em] text-muted">{t('landing.mock_activity')}</p>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`h-2.5 w-10 rounded-full ${i < 3 ? 'bg-signal' : 'bg-paper-3'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className={layer(1)}>
        <p className="text-sm uppercase tracking-[0.1em] text-muted">{t('landing.mock_allergens')}</p>
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
              <span className="text-center text-sm text-muted">{t(k)}</span>
              <span className="relative block aspect-square overflow-hidden rounded-xl bg-paper-3 sm:rounded-2xl">
                <Image src={`/landing/day-${i + 1}.webp`} alt="" fill sizes="72px" className="object-cover" />
              </span>
              <span className={`h-2 rounded-full ${i === 0 ? 'bg-signal' : 'bg-paper-3'}`} />
              <span className="h-2 w-2/3 rounded-full bg-paper-3" />
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
              <span className={`text-lg sm:text-xl ${s.done ? 'text-muted line-through' : 'text-ink'}`}>{t(s.key)}</span>
            </li>
          ))}
        </ul>
      </div>

      <span className="absolute bottom-3 right-4 text-xs uppercase tracking-[0.1em] text-muted">
        {t('landing.mock_note')}
      </span>
    </div>
  );
}
