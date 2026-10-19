'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { StoryPanel } from './StoryPanel';
import { useReducedMotion } from './useReducedMotion';

const SCENES = [
  { src: '/landing/stage-1.webp', origin: '62% 58%' },
  { src: '/landing/stage-2.webp', origin: '78% 58%' },
  { src: '/landing/stage-3.webp', origin: '42% 72%' },
  { src: '/landing/stage-4.webp', origin: '72% 58%' },
];
const N = SCENES.length;
const XF = 0.2; // overlap between two scenes, in scenes
const DIVE = 0.55; // how much each scene zooms in before the next one takes over
const VH_PER_SCENE = 150;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};
const inOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

/**
 * Scroll-driven "fly through" the four steps: a pinned stage where scroll position is the camera.
 * Each photo is dived into and the next one rises out of it. Pure transforms, no video.
 */
export function ScrollWorld({ t }: { t: (k: string) => string }) {
  const reduced = useReducedMotion();
  const track = useRef<HTMLElement>(null);
  const scenes = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let target = 0;
    let cur = 0;
    let raf = 0;
    let act = 0;

    const read = () => {
      const r = el.getBoundingClientRect();
      const total = Math.max(1, r.height - window.innerHeight);
      target = clamp(-r.top / total) * N;
    };

    const apply = (g: number) => {
      const shown = Math.min(N - 1, Math.floor(g + XF / 2));
      scenes.current.forEach((s, i) => {
        if (!s) return;
        const local = g - i;
        let scale = 1;
        let opacity = 1;
        if (reduced) {
          opacity = i === shown ? 1 : 0;
        } else if (local < -XF) {
          opacity = 0;
          scale = 0.8;
        } else if (local < 0) {
          const k = smooth((local + XF) / XF);
          opacity = k;
          scale = 0.8 + 0.2 * k;
        } else {
          scale = 1 + DIVE * inOut(clamp(local));
          opacity = i < N - 1 ? 1 - smooth((local - (1 - XF)) / XF) : 1;
        }
        s.style.opacity = String(opacity);
        s.style.transform = `scale(${scale.toFixed(4)})`;
      });
      if (bar.current) bar.current.style.transform = `scaleX(${(g / N).toFixed(4)})`;
      if (shown !== act) {
        act = shown;
        setActive(shown);
      }
    };

    const loop = () => {
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0008) {
        cur = target;
        raf = 0;
        apply(cur);
        return;
      }
      apply(cur);
      raf = requestAnimationFrame(loop);
    };
    const onScroll = () => {
      read();
      if (!raf) raf = requestAnimationFrame(loop);
    };

    scenes.current.forEach((s) => {
      if (s) s.style.transition = reduced ? 'opacity 500ms var(--ease-out)' : 'none';
    });
    read();
    cur = target;
    apply(cur);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section
      ref={track}
      id="how-it-works"
      className="relative bg-paper text-ink"
      style={{ height: `${N * VH_PER_SCENE + 100}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {SCENES.map((s, i) => (
          <div
            key={s.src}
            ref={(el) => {
              scenes.current[i] = el;
            }}
            className="absolute inset-0 will-change-transform"
            style={{ transformOrigin: s.origin, opacity: i === 0 ? 1 : 0 }}
          >
            <Image src={s.src} alt="" fill sizes="100vw" className="object-cover" />
          </div>
        ))}
        <div aria-hidden="true" className="absolute inset-0 bg-paper/55 dark:bg-paper/20" />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-paper/85 via-paper/45 to-transparent dark:from-paper/70 dark:via-paper/35" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-paper/70 to-transparent" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] flex-col justify-center gap-5 px-5 pb-10 pt-16 sm:gap-7 sm:px-8 sm:pt-20 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="text-xl text-muted [@media(max-height:700px)_and_(max-width:639px)]:hidden sm:text-2xl">{t('landing.story_title')}</h2>
            <div className="mt-5 grid">
              {[1, 2, 3, 4].map((n, i) => (
                <div
                  key={n}
                  className={`col-start-1 row-start-1 transition-[opacity,transform] duration-500 ease-[var(--ease-out)] ${
                    active === i ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
                  }`}
                >
                  <span className="text-xl text-signal-text">{`0${n}`}</span>
                  <h3 className="mt-2 text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.035em]">
                    {t(`landing.step_${n}_title`)}
                  </h3>
                  <p className="mt-4 max-w-md text-lg text-ink/85 sm:text-xl">{t(`landing.step_${n}_desc`)}</p>
                </div>
              ))}
            </div>
          </div>
          <StoryPanel active={active} t={t} />
        </div>

        <span className="absolute bottom-5 right-5 z-10 text-sm tracking-[0.1em] text-muted sm:right-8">
          {`0${active + 1} / 0${N}`}
        </span>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-rule/60">
          <div ref={bar} className="h-full origin-left bg-signal" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  );
}
