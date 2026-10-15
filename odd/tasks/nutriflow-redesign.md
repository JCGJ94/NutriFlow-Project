# NutriFlow redesign (Tailwind 4, new visual identity)

Objective: rebuild the NutriFlow interface on Tailwind CSS 4 with a modern, striking identity, using the design resources the user pointed to and the Hallmark design skill. Public surfaces first (landing, auth), authenticated screens after.
Branch: `feat/nextjs-full-stack-migration`; push and `main` only on explicit user approval. Delivery: `ask-on-risk`. Test runner: vitest, `bun run typecheck`, `bun run lint`, `bun run build`, plus screenshots of the public pages.
Depends on: `odd/tasks/nutriflow-stack-migration.md` M3 (Tailwind 4 in place). This file is M9 of that plan.

## Specs

S1. "tailwind 4, el diseño sera restructurdo completamente" - the previous look is not preserved; no effort goes into keeping the Tailwind 3 look.
S2. "quiero que ahora mismo lo adaptes a al nueva arquitectura y nueva idea" - adapt the interface to the new architecture (flat Next.js app, Tailwind 4, Bun) and the new idea.
S3. "quiero que para las ideas de diseño utilices estar herramietnas y etsas guias" and "aprende de ellas y creemos algo asombroso y moderno" - design ideas come from the eight resources in the post (https://x.com/amananimates/status/2110584646794887669) and the Hallmark skill; the result must feel modern and striking.
S4. (research, verified 2026-10-15) The eight resources are mostly screenshot galleries with no reuse licence: supahero.io, cta.gallery, navbar.gallery, footer.design and styles.refero.design are inspiration only; scrolltide.co is paid and bars redistribution (never copy it into this public repo); 3dicons.co states CC0 but its footer says "All rights reserved" (do not depend on it); glass.samasante.com has no visible code or licence. Nothing is copied, only patterns are learned.
S5. (assumption, to confirm with the user) The "new idea" is not described beyond the design direction: until the user says otherwise it means a new visual identity and page structure for the existing product (nutrition and exercise plans, allergens, shopping list), not new product features.
S6. Existing behaviour is preserved: routes, data flow, i18n (ES/EN), auth guards, 129 tests, `tsc`, lint (0 errors) and `next build` stay green per unit. Accessibility floor: contrast, `prefers-reduced-motion`, keyboard focus, no horizontal scroll at 320, 375, 414 and 768 px.
S7. Honest copy: no invented metrics or claims. The current landing ships "La app de nutrición #1 basada en IA" and "Más de 10,000 usuarios felices", which are not backed by data and are removed.

## Tasks

| ID | Specs | Route | Status | Unit |
| - | - | - | - | - |
| R0 | S3,S4,S5 | inline + researcher | done | Research of the 8 resources (licences, patterns, fit). Result in S4. |
| R1 | S1,S3,S6 | inline | done | Design system, register B (user choice): dark-first with warm light twin, one amber `signal` accent, Geist + Geist Mono through `next/font`, tokens `--paper/--ink/--rule/--signal` in `globals.css`, new Logo (week ring), legacy v3 class names kept as thin utilities until R4/R5. Original plan text: playful/Hum (cream paper, pear / cyan / coral accents, Plus Jakarta Sans + JetBrains Mono through `next/font`), tokens in the Tailwind 4 `@theme`, rebuilt base styles and component classes (button system, cards, inputs), replacing the converted v3 classes. |
| R2 | S1,S3,S6,S7 | inline | done (Footer only re-tokenised, structure kept) | Landing page (macrostructure Narrative Workflow: profile, allergens, weekly plan, shopping list, training), new Navbar and Footer archetypes, i18n ES/EN copy, honest claims. Screenshot check desktop/mobile, light/dark. |
| R3 | S1,S6 | inline | pending | Auth screens: login, register. |
| R4 | S1,S6 | inline | pending | Authenticated screens: dashboard, plans, plan view, shopping list, onboarding, settings (needs a real Supabase session or mocked data to review; split per screen). |
| R5 | S6 | inline | pending | Remove the dead v3 classes and tokens from `globals.css`; final verifier on a fresh clone. |

## Log

### L1 - 2026-10-15 - user request (verbatim, Spanish)

> tailwind 4, el diseño sera restructurdo completamente
>
> quiero que ahora mismo lo adaptes a al nueva arquitectura y nueva idea

> quiero que para las ideas de diseño utilices estar herramietnas y etsas guias
>
> https://x.com/amananimates/status/2110584646794887669
>
> aqui se hace referencias a todas la guias de diseño aprende de ellas y creemos algo asombroso y moderno

### L2 - 2026-10-15 - research

X blocked a direct fetch (HTTP 402); the post text was read through a public embed API. It lists eight resources (scrolltide.co, navbar.gallery, footer.design, cta.gallery, styles.refero.design, supahero.io, 3dicons.co, glass.samasante.com). Three researchers checked each one; findings are in S4. Hallmark's playful genre bans glassmorphism, gradient text and invented metrics, so the "glass" resource is not used.

### L3 - 2026-10-15 - advisor review applied

Before any CSS: show the Hallmark pre-flight and preview, state the inferred audience / use case / tone, and ask one question about the register (the user's references point to scroll-driven, 3D and glass work, while the Hum theme is light and playful and bans glass). Constraints added: keep dark mode (class-based, `next-themes`) with dark tokens; decide the brand assets (`Logo.tsx`, favicon, `manifest.json`) before picking the palette; honest counters only (14 EU allergens, 7-day plan, 83 catalogue ingredients), no streaks or celebrations tied to calorie targets; keep the 34 `data-testid` values and run the Playwright public specs before and after; split or protect the shared Navbar (R4 owns the authenticated branch); R5 stays after R4; new copy goes in `src/lib/i18n.ts` as ES and EN; fonts through `next/font`; list files before each edit; decide whether `.hallmark/log.json` is ignored by git. Line forecast: well over 400 authored lines; ask the chain strategy at the first work-unit commit. M3 is still unpushed.

### L4 - 2026-10-15 - register chosen

User: "sube M·3 y prefiero el B". M3 pushed (`bb483d8`). Register B = cinematic, dark-first. R1 and R2 built: sticky scroll story (IntersectionObserver, no scroll-jacking), CSS/SVG week ring hero, honest copy (no counts, mockups labelled "Ejemplo ilustrativo"), reduced-motion fallback. Checks: tsc 0, lint 0 errors, 129 tests, build OK, no horizontal overflow at 320/375/414/768/1280 in dark and light. Not run: Playwright e2e, Footer archetype change.
