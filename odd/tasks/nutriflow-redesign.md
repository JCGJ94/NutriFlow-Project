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

S8. "fuente para toda la web https://bestfreefonts.com/petrona Light Italic 300" - Petrona (SIL OFL, served by `next/font/google`, verified: weights 100-900, styles normal and italic) replaces Geist everywhere. The user's font wins over DESIGN.md's Proxima Nova and over Hallmark's no-italic-headers rule. Assumption: Light 300 italic is the display and body voice; legibility risk in dashboard numbers, inputs and tables is raised once and the user decides.
S9. "C:\Users\jcgon\Downloads\DESIGN.md guia de diseño definitiva" - style reference (a WHOOP style sheet): split canvas (full-bleed black bands alternating with white bands), one violet accent `#4a53ff` on primary actions, pill buttons (300px radius), 24px cards with no shadow and flat Lab Mist fills, oversized display type with tight tracking, one 1200px content well. Style only: no WHOOP name, photos or copy. Assumptions: (a) DESIGN.md contradicts itself on the violet CTA, the Components section and the Do's win; (b) violet text on black fails AA, dark mode uses a lighter violet; (c) display tracking and line-height are retuned for Petrona (accented capitals collide at 0.71).
S10. "Necesitamos que la landing venda nuestro producto por sí solo. Por lo tanto, debe estar más viva, debe tener más imágenes." / "ese hero debe crear un efecto wow en la gente" / "recuerda que la landing es el que vende el producto" - the landing is the sales page: lively, image-rich, dark, with effects that push people to register.
S11. "usa stock libre de imagenes de aliemntos, acorde con dietas españolas" - food imagery comes from free-licence stock (Unsplash, Pexels, Pixabay, Wikimedia CC0), Spanish-diet dishes, every photo recorded in a provenance manifest in the repo. Copy-protected sources are never used. The two MotionSites videos the user linked (calorie tracker preview, "Craftwork" hero) are reference only: their terms say "All rights reserved" and forbid redistribution, so they are not committed; the hero effect is built in code.

S12. "esta [Image #1] puede valer" - the user's chosen landing reference: a screenshot of a fitness-coaching landing ("ORBIT"): full-bleed photographic hero with one large subject, bold headline top-left, short subtitle, pill email field with a high-contrast pill button, glass-pill nav with a white "Get Started" pill, small icon chips next to the headline, thin annotation lines with labels pointing at parts of the subject, an avatar stack with a people counter. Taken as layout and interaction reference only. Adaptations (assumptions): food photo replaces the person, annotations point at ingredients and plan features, dark treatment (S10) and violet accent (S9) replace the light blue-grey and lime, and the "500+ individuals" counter is dropped (S7, no invented metrics).

## Tasks

| ID | Specs | Route | Status | Unit |
| - | - | - | - | - |
| R0 | S3,S4,S5 | inline + researcher | done | Research of the 8 resources (licences, patterns, fit). Result in S4. |
| R1 | S1,S3,S6 | inline | done | Design system, register B (user choice): dark-first with warm light twin, one amber `signal` accent, Geist + Geist Mono through `next/font`, tokens `--paper/--ink/--rule/--signal` in `globals.css`, new Logo (week ring), legacy v3 class names kept as thin utilities until R4/R5. Original plan text: playful/Hum (cream paper, pear / cyan / coral accents, Plus Jakarta Sans + JetBrains Mono through `next/font`), tokens in the Tailwind 4 `@theme`, rebuilt base styles and component classes (button system, cards, inputs), replacing the converted v3 classes. |
| R2 | S1,S3,S6,S7 | inline | done (Footer only re-tokenised, structure kept) | Landing page (macrostructure Narrative Workflow: profile, allergens, weekly plan, shopping list, training), new Navbar and Footer archetypes, i18n ES/EN copy, honest claims. Screenshot check desktop/mobile, light/dark. |
| R3 | S1,S6 | inline | done (AuthShell, no logic change; e2e not run) | Auth screens: login, register. |
| R4 | S1,S6 | inline | partial: mechanical token recolor of 26 files (no layout redesign, authenticated screens not viewed) | Authenticated screens: dashboard, plans, plan view, shopping list, onboarding, settings (needs a real Supabase session or mocked data to review; split per screen). |
| R5 | S6 | inline | pending | Remove the dead v3 classes and tokens from `globals.css`; final verifier on a fresh clone. |
| R6 | S8,S9 | inline | done (Petrona verified in dev and build; contrast of the violet on black and white checked by tokens, not measured) | Reopens R1: Petrona 300 italic through `next/font/google` replaces Geist; violet `signal` tokens (dark and light), flip `--signal-ink`, retuned display scale, pill and 24px radius utilities; check contrast and the 26 recoloured files. |
| R7 | S10,S11 | inline + 3 researchers | done (9 Pexels / CC0 photos; the 3 Unsplash candidates were dropped because the photographer could not be verified; every photo viewed) | Free-licence Spanish-diet food photos, downloaded, viewed, optimised (webp, sized) into `public/landing/`, with `public/landing/SOURCES.md` (photographer, page URL, licence). |
| R8 | S9,S10,S11,S12,S6,S7 | inline | done locally (hero ring over dish photos, dish strip, scroll-driven pinned story in the spirit of the user's scroll-world link, light features and allergens bands, dark CTA); no video: scroll-world needs paid generation (Monid / Higgsfield, about 11-32 USD) and the user's login, not authorised | Reopens R2: landing rebuilt as the sales page: code-built wow hero (week ring + dish photos + light arc), split black/white bands, photo cards, honest copy, CTA band; ES/EN copy; reduced-motion and no horizontal scroll at 320-1280. |

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

### L5 - 2026-10-15 - user feedback on the landing (verbatim, Spanish)

> Mejoras de diseño en esta nueva versión
>
> La landing no me gusta. Voy a buscar ejemplos precisos de una landing, más las que ya tiene, para darte una en concreto para que sea cual sea que me guste y cómo la quiero.
>
> Necesitamos que la landing venda nuestro producto por sí solo. Por lo tanto, debe estar más viva, debe tener más imágenes. Debemos generar imágenes. Debemos ser capaces de hacer oscuro, hacer efectos guapos que llamen a la gente a registrarse o utilizar la página.
>
> fuente para toda la web https://bestfreefonts.com/petrona Light Italic 300
>
> C:\Users\jcgon\Downloads\DESIGN.md guia de diseño definitiva

Then the user linked two MotionSites videos ("alimentos" and "hero"), answered the image question with "usa stock libre de imagenes de aliemntos, acorde con dietas españolas", and added "recuerda que la landing es el que vende el producto" and "ese hero debe crear un efecto wow en la gente". The membership question about MotionSites went unanswered, so the code-built path is the default. Reopens R1 (tokens, font) and R2 (landing).

### L4 - 2026-10-15 - register chosen

User: "sube M·3 y prefiero el B". M3 pushed (`bb483d8`). Register B = cinematic, dark-first. R1 and R2 built: sticky scroll story (IntersectionObserver, no scroll-jacking), CSS/SVG week ring hero, honest copy (no counts, mockups labelled "Ejemplo ilustrativo"), reduced-motion fallback. Checks: tsc 0, lint 0 errors, 129 tests, build OK, no horizontal overflow at 320/375/414/768/1280 in dark and light. Not run: Playwright e2e, Footer archetype change.

### L6 - 2026-10-15 - scroll-world reference

User: "aqui esta el toque perfecto para mi landing esta scroll https://github.com/oso95/scroll-world". Verified: MIT agent skill that generates scene stills and camera clips with paid services and scrubs video.currentTime with scroll; assets are not shipped. Built the same idea in code from the stock photos (ScrollWorld.tsx: pinned stage, scroll progress is the camera, each photo is dived into and the next rises out of it). Open decision for the user: run the real pipeline (cost, login) or keep the photo version. Checks: tsc 0, lint 0 errors, 129 tests, build OK (first attempt failed on a Google Fonts network error, repeat passed), no horizontal overflow at 320/375/414/768/1280 in dark and light. Not run: Playwright e2e, Safari/Firefox, a real device.
