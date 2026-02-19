# NutriFlow — Plan por fases (ESLint “pro” + Migración futura a Server Actions)

Este documento define un plan **incremental, seguro y reversible** para:
1) Mejorar el **linting** del monorepo (sin romper la demo).
2) Preparar y, más adelante, migrar `apiClient` a **Server Actions** para reducir/evitar dependencia de `/api` rewrites.

> Contexto técnico actual: monorepo con **Turborepo** (`turbo run lint`) y `eslint` instalado en root. :contentReference[oaicite:0]{index=0}

---

## Objetivos y restricciones

### Objetivos
- Reducir bugs “silenciosos” (hooks, dependencias, promesas, imports, dead code).
- Estandarizar calidad de código para contributors.
- Preparar arquitectura para Server Actions **sin reescribir** la app.

### Restricciones (no negociables)
- **Cero regresiones**: la aplicación debe seguir funcionando igual en demo/producción.
- Cambios **pequeños**, verificables y reversibles.
- En Fase 1, el lint **no puede bloquear** el avance (primero warnings, luego endurecer).

---

## Fase 0 — Baseline de seguridad (antes de tocar nada)

### 0.1. Congelar estado y medir
- Crear rama: `chore/lint-roadmap` (o similar).
- Asegurar que estos comandos pasan hoy:
  - `pnpm dev`
  - `pnpm build`
  - `pnpm lint`
- Guardar un “baseline” de resultados:
  - capturar salida de `pnpm lint` actual
  - nota rápida: apps que ejecuta turbo y sus comandos

### 0.2. Checklist de rollback
- Todo cambio de config debe ser revertible con:
  - `git revert <commit>` o rollback de la rama completa
- Nunca cambiar **2 grandes cosas** en el mismo PR.

---

# Fase 1 — ESLint profesional y equilibrado (sin romper la demo)

## Meta de la fase 1
- Conseguir lint consistente en el monorepo.
- Empezar con reglas **de alto valor** y **bajo ruido**.
- Mantener “warnings” al inicio para no bloquear.

---

## 1.1. Descubrir el estado real por app (diagnóstico rápido)
**Objetivo:** saber cómo está lintando hoy cada workspace.

Pasos:
1) Revisar cada workspace:
   - `apps/web/package.json` → buscar script `lint`
   - `apps/api/package.json` → buscar script `lint`
2) Confirmar si existen configs locales:
   - `apps/**/.eslintrc*`
   - `apps/**/eslint.config.*`
3) Confirmar si web usa `next lint` y api usa `eslint .`

Resultado esperado:
- Lista clara de:
  - “web lint command”
  - “api lint command”
  - configs existentes

> Regla: no tocar nada todavía; solo mapear.

---

## 1.2. Estándar de configuración (opción recomendada)
### Opción A (recomendada): “Config compartida + overrides por app”
- Root define reglas base.
- `apps/web` extiende con reglas Next/React.
- `apps/api` extiende con reglas Node/TS.

Ventajas:
- Escala bien en monorepo.
- Evita que web y api diverjan sin control.

---

## 1.3. Dependencias mínimas necesarias (añadir en root)
Instalar *solo lo necesario* para fase 1:

- Para TypeScript:
  - `@typescript-eslint/parser`
  - `@typescript-eslint/eslint-plugin`
- Para React/Next:
  - `eslint-plugin-react`
  - `eslint-plugin-react-hooks`
  - `eslint-config-next` (si web usa Next)
- (Opcional fase 1.5) Imports:
  - `eslint-plugin-import`

> Nota: hoy tienes `eslint` en root, pero no plugins. :contentReference[oaicite:1]{index=1}  
> Esto sugiere que actualmente dependes de configs internas de Next o configs por-app.

---

## 1.4. Config base (Root) — “Warn-first”
Crear en root **UNA** config (elige uno de estos caminos):

### Camino 1 (ESLint clásico): `.eslintrc.cjs` en root
- Ventaja: más simple y común.
- Ideal si tu repo ya usa `.eslintrc*` en apps.

### Camino 2 (ESLint flat config): `eslint.config.mjs`
- Ventaja: futuro-proof.
- Requiere más cuidado con compatibilidad.

**Recomendación:** empezar con `.eslintrc.cjs` si quieres mínimo riesgo.

---

## 1.5. Reglas Fase 1 (alto valor, bajo ruido)
### Reglas “core” (seguras)
- `no-unused-vars` (TS version) → `warn`
- `no-duplicate-imports` → `error`
- `no-debugger` → `warn`
- `no-console` → `warn` (opcional)

### Hooks (impacto alto)
- `react-hooks/rules-of-hooks` → `error`
- `react-hooks/exhaustive-deps` → `warn` (primero)

### TypeScript (mantenerlo suave)
- `@typescript-eslint/no-unused-vars` → `warn`
- `@typescript-eslint/consistent-type-imports` → `warn` (opcional)

> Importante: en fase 1, evitamos reglas que generen 500 errores de golpe.

---

## 1.6. Integración con Turborepo (sin romper el pipeline)
Como en root ejecutas `turbo run lint` :contentReference[oaicite:2]{index=2}, asegúrate de:

- Mantener el comando `lint` por workspace estable:
  - `apps/web`: `next lint` o `eslint .`
  - `apps/api`: `eslint .`
- Si web usa `next lint`, valida que use la config (Next la detecta automáticamente).

**Acción recomendada:**
- Standardizar scripts lint:
  - `eslint --max-warnings=0` **NO** todavía.
  - En fase 1: `eslint .` sin bloquear por warnings.

---

## 1.7. “No empeorar” (baseline) sin arreglar todo el repo
Para no tener que arreglar cientos de warnings de golpe:

Opción recomendada:
- Mantener warnings permitidos al inicio.
- Añadir una norma operativa:
  - “En PR nuevo: no se introducen *nuevos* warnings relevantes”
- Técnica práctica:
  - arreglar warnings solo en los archivos tocados en el PR.

---

## 1.8. Fase 1.5 — Endurecer gradualmente (cuando esté estable)
Tras 1–2 iteraciones sin fricción:
- Subir a `error` estas reglas:
  - `@typescript-eslint/no-unused-vars`
  - `react-hooks/exhaustive-deps`
- Considerar añadir:
  - `eslint-plugin-import` (order, no cycles) → empezar en `warn`

---

## Validación Fase 1 (checklist)
- [ ] `pnpm lint` pasa en local
- [ ] `pnpm build` pasa
- [ ] No cambia comportamiento de la app
- [ ] Se documenta “cómo lintamos” en 10 líneas (README o docs)

---

## Rollback Fase 1
Si el lint bloquea el trabajo:
- Bajar reglas a `warn`
- O desactivar solo la regla conflictiva por app
- O revert del commit de config

---

# Fase 2 — Server Actions (fase futura, preparada y segura)

## Meta de la fase 2
- Reducir dependencia de `/api` rewrites moviendo “mutations” a Server Actions.
- Mejorar coherencia de datos (revalidación/caché) y evitar “F5 fixes”.
- Migración **incremental**: 1 acción cada vez.

> Importante: esto puede tocar auth, cookies y revalidación. Se hace solo cuando Fase 1 esté estable.

---

## 2.1. Preparación (sin migrar aún)
### 2.1.1. Inventario del `apiClient`
- Enumerar endpoints/funciones que usa:
  - Plan nutrición (create/read/update)
  - Plan ejercicio (create/read/update)
  - Auth/session (si aplica)
  - i18n/otros
- Clasificar por tipo:
  - **Queries** (lecturas)
  - **Mutations** (acciones: crear, actualizar, borrar)

### 2.1.2. Elegir estrategia de migración
Recomendación:
- Migrar primero **mutations** a Server Actions.
- Mantener queries en el cliente temporalmente (con fetch o RSC), según el diseño.

---

## 2.2. Crear un “servicio de dominio” antes de mover a Actions
Para que el refactor sea clínico:
- Extraer la lógica real de negocio (validación, transformación) a funciones server-side reutilizables:
  - `src/server/services/*` (o equivalente)
- Que la Server Action sea solo “adaptador”:
  - valida input
  - llama al service
  - revalida rutas/cache
  - retorna resultado tipado

Esto evita duplicación y mantiene control.

---

## 2.3. Introducir Server Actions sin romper rutas actuales
### Estrategia de convivencia
- Mantener `/api/*` funcionando durante toda la fase 2.
- Implementar 1 Server Action paralela.
- Cambiar solo 1 pantalla/flujo para usarla.
- Verificar en demo.
- Repetir.

---

## 2.4. Orden recomendado de migración (incremental)
1) **Acción simple y aislada**
   - Ej: actualizar preferencia, guardar setting, algo con poco impacto.
2) **Crear plan nutrición** (mutation clave)
   - Añadir `revalidatePath()` o equivalente donde aplique.
3) **Generar/adjuntar plan ejercicio** (el bug típico del F5)
   - Asegurar que al crear nutrición:
     - se crea/obtiene plan ejercicio
     - se revalida la vista del ejercicio
4) Solo al final:
   - revisar si `/api` routes sobran y eliminar rewriters gradualmente

---

## 2.5. Revalidación y estado (clave para evitar F5)
Cada migration debe resolver:
- ¿Qué ruta/página necesita revalidación?
- ¿Dónde vive el “source of truth” del dato?
- ¿La UI depende de caches, SWR, React Query o fetch directo?

Patrones comunes:
- Tras mutation:
  - `revalidatePath("/ruta")`
  - o invalidación de cache del cliente (si hay librería)

---

## 2.6. Criterio “ready to remove rewrites”
Solo quitar rewrites cuando:
- 100% de las mutations críticas ya no usan `/api`
- las pantallas no dependen de esos endpoints
- hay verificación en staging/dominio real

---

## Validación Fase 2 (checklist)
- [ ] No hay necesidad de F5 en flujos clave
- [ ] Session/auth siguen correctas
- [ ] Revalidación consistente (sin datos stale)
- [ ] `/api` sigue funcionando como fallback durante transición
- [ ] Cada migration tiene rollback claro

---

## Rollback Fase 2
Para cada acción migrada:
- Mantener el `apiClient` viejo como fallback durante 1 release
- Feature flag simple (si quieres): `USE_SERVER_ACTIONS=false` para revert rápido
- Revert del PR aislado

---

# Plan de PRs recomendado (para no romper la app)

## PR 1 — Diagnóstico + dependencias mínimas + config warn-first
- Añadir plugins básicos
- Añadir config base
- Ajustar scripts lint sin bloquear
- Verificar `pnpm build` y demo ok

## PR 2 — Ajustes en apps (web/api) si hace falta
- Overrides por workspace
- Resolver 10–30 warnings fáciles (solo donde toque)

## PR 3+ — Endurecer gradualmente (cuando el equipo esté cómodo)
- Convertir 1–2 reglas a error
- Añadir import rules en warn

## PR Futuro — Preparación Server Actions (solo inventario + servicios)
- No cambia UI todavía

## PR Futuro — Migración 1 acción (pequeña)
- Con fallback a apiClient

---

# Decisión rápida (para hablarlo con tu gente)

✅ **Ahora:** Fase 1 (ESLint por fases) → riesgo bajo, valor alto, no afecta producción.  
⏳ **Más adelante:** Fase 2 (Server Actions) → valor alto, pero hacerlo incremental para no romper auth/caché.

---
