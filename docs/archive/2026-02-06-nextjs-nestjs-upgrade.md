# Next.js 16.1.4 & NestJS 11.1.9 Upgrade Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrar de forma segura Next.js 14.1 → 16.1.4 y NestJS 10.3 → 11.1.9 sin romper funcionalidad existente.

**Architecture:** Migración incremental con verificación de cada paso. Usaremos codemods automáticos donde sea posible y migración manual controlada para breaking changes críticos.

**Tech Stack:** Next.js 16.1.4, NestJS 11.1.9, React 19, Node.js 20.9+, Express 5

---

## Análisis de Estado Actual

### Versiones Actuales:
- **Next.js:** 14.1.0
- **NestJS:** 10.3.0
- **React:** 18.2.0
- **Node.js:** >= 18.0.0

### Versiones Objetivo:
- **Next.js:** 16.1.4
- **NestJS:** 11.1.9
- **React:** 19.x
- **Node.js:** >= 20.9.0

### 🔍 Hallazgos Específicos del Proyecto NutriFlow:

#### **Archivos que REQUIEREN Migración:**

1. **`apps/web/src/middleware.ts`** ✅ EXISTE
   - Maneja autenticación con Supabase
   - Usa `request.cookies` (compatible con Express 5)
   - **Necesita:** Migrar a `proxy.ts` (Next.js 16)
   - **Crítico:** Lógica de protección de rutas

2. **`apps/web/src/lib/supabase/server.ts`** ⚠️ CRÍTICO
   - Usa `cookies()` de `next/headers` (línea 5)
   - **Necesita:** Convertir función a `async` y agregar `await cookies()`
   - Usado en múltiples Server Components

3. **`apps/web/src/app/plan/[id]/page.tsx`** ✅ Client Component
   - Usa `useParams()` hook (NO necesita migración, es client-side)
   - **No requiere cambios**

4. **`apps/web/src/app/shopping-list/[id]/page.tsx`** ✅ Client Component
   - Usa `useParams()` hook (NO necesita migración)
   - **No requiere cambios**

5. **`apps/web/src/app/protocols/[id]/page.tsx`** ✅ Client Component
   - Usa `useParams()` hook (NO necesita migración)
   - **No requiere cambios**

6. **`apps/web/next.config.js`** ✅ OK
   - Configuración simple con rewrites a API backend
   - `experimental.typedRoutes: true` (compatible con Next 16)
   - **No requiere cambios estructurales**

#### **API (NestJS) - Estado:**

1. **Sin wildcards en rutas** ✅
   - Búsqueda de `@Get('*')`: No encontrado
   - **No requiere migración de rutas**

2. **Módulos Dinámicos** ✅ Verificar
   - `ConfigModule`, `SupabaseModule`, etc.
   - **Requiere:** Verificar imports duplicados

3. **Express 5 Compatibility** ✅
   - No hay uso de regex en rutas
   - No hay optional characters `?`
   - **Compatible por defecto**

#### **Tests:**
- Playwright para E2E (compatible)
- Vitest para unit tests (compatible)

#### **Dependencias Críticas:**
- `@supabase/ssr` - Verificar compatibilidad con React 19
- `framer-motion` - Verificar compatibilidad con React 19
- `@hookform/resolvers` + `react-hook-form` - Verificar compatibilidad

---

## Breaking Changes Críticos

### Next.js 14 → 16:

1. **Async Request APIs** - `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` ahora retornan Promises
2. **React 19 Required** - Actualización obligatoria a React 19
3. **Node.js 20.9+** - Mínimo requerido
4. **Middleware → Proxy** - `middleware.ts` reemplazado por `proxy.ts`
5. **ESLint Flat Config** - Nueva configuración obligatoria
6. **Caching Changes** - No hay cache por defecto, usar `use cache` directive
7. **Image Component** - Cambios en defaults y configuración

### NestJS 10 → 11:

1. **Express 5** - Cambios en route matching (wildcards, regex)
2. **Node.js 20+** - No soporta Node 16/18
3. **Dynamic Module Keys** - Cambio de hash a object references
4. **Cache Manager v6** - Migración a Keyv
5. **Route Patterns** - Wildcards nombrados (`/*splat`), no más `?`

---

## Phase 1: Pre-Migration Preparation

### Task 1.1: Verificar Estado Inicial
**Files:** Terminal, documentación
**Steps:**
1. Detener servidores actuales (`pnpm dev`)
2. Hacer commit de todos los cambios pendientes
3. Crear rama de migración: `git checkout -b feat/upgrade-nextjs16-nestjs11`
4. Documentar versiones actuales en archivo temporal
5. Verificar que tests pasen: `pnpm test`

**Verification:**
```bash
git status  # debe estar limpio
git branch  # debe mostrar la nueva rama
```

---

### Task 1.2: Verificar Requisitos de Node.js
**Files:** `.nvmrc`, `package.json`
**Steps:**
1. Verificar versión de Node.js: `node --version`
2. Si es < 20.9, actualizar Node.js a 20.9+ o superior
3. Crear/actualizar `.nvmrc` con `20.9.0`
4. Actualizar `engines.node` en `package.json` raíz a `>=20.9.0`

**Code:**
```json
// package.json
{
  "engines": {
    "node": ">=20.9.0",
    "pnpm": ">=9.0.0"
  }
}
```

**Verification:**
```bash
node --version  # debe mostrar 20.9+
```

---

## Phase 2: NestJS Migration (API)

### Task 2.1: Actualizar Dependencias de NestJS
**Files:** `apps/api/package.json`
**Steps:**
1. Actualizar todas las dependencias `@nestjs/*` a `^11.1.9`
2. Actualizar `express` a `^5.x` (peer dependency de NestJS 11)
3. Actualizar `cache-manager` a `^6.x` si se usa
4. Instalar dependencias: `pnpm install`

**Code:**
```json
// apps/api/package.json
{
  "dependencies": {
    "@nestjs/common": "^11.1.9",
    "@nestjs/core": "^11.1.9",
    "@nestjs/config": "^3.3.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^11.1.9",
    "@nestjs/swagger": "^8.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.1.9"
  }
}
```

**Verification:**
```bash
cd apps/api && pnpm list @nestjs/core  # debe mostrar 11.1.9
```

---

### Task 2.2: Migrar Rutas con Wildcards
**Files:** Buscar en `apps/api/src/**/*.controller.ts`
**Steps:**
1. Buscar rutas con wildcards: `@Get('/*')` 
2. Reemplazar `*` con `*splat`: `@Get('/:splat*')`
3. Buscar uso de `?` en rutas y reemplazar con braces
4. Verificar que no hay regex directo en rutas

**Verification:**
```bash
grep -r "@Get('\*')" apps/api/src  # no debe encontrar nada
grep -r "@Get('.*?')" apps/api/src  # no debe encontrar nada
```

---

### Task 2.3: Actualizar Dynamic Modules (si hay)
**Files:** `apps/api/src/**/*.module.ts`
**Steps:**
1. Buscar módulos dinámicos importados múltiples veces
2. Verificar que se usen como singleton (mismo objeto importado)
3. Si hay duplicación de configuración, extraer a variable compartida

**Code Pattern:**
```typescript
// ❌ Antes (puede causar múltiples instancias)
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  ConfigModule.forRoot({ isGlobal: true })
]

// ✅ Después (singleton)
const sharedConfig = ConfigModule.forRoot({ isGlobal: true });
imports: [sharedConfig]
```

---

### Task 2.4: Probar Build del API
**Files:** Terminal
**Steps:**
1. Compilar API: `cd apps/api && pnpm build`
2. Verificar que no hay errores de TypeScript
3. Iniciar servidor: `pnpm dev`
4. Verificar que todas las rutas se mapean correctamente
5. Verificar logs de inicio sin warnings críticos

**Verification:**
```bash
curl http://localhost:4000/api/health  # debe responder 200
```

---

## Phase 3: Next.js Migration (Web)

### Task 3.1: Actualizar React a v19
**Files:** `apps/web/package.json`, `package.json` (root)
**Steps:**
1. Actualizar `react` y `react-dom` a `^19.0.0`
2. Actualizar tipos: `@types/react` y `@types/react-dom` a `^19.0.0`
3. Instalar: `pnpm install`

**Code:**
```json
// apps/web/package.json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

---

### Task 3.2: Actualizar Next.js a 16.1.4
**Files:** `apps/web/package.json`
**Steps:**
1. Actualizar `next` a `16.1.4`
2. Instalar: `pnpm install`

**Code:**
```json
// apps/web/package.json
{
  "dependencies": {
    "next": "16.1.4"
  }
}
```

---

### Task 3.3: Ejecutar Codemod Automático
**Files:** `apps/web/**`
**Steps:**
1. Ejecutar codemod de Next.js: `npx @next/codemod@canary upgrade latest`
2. Revisar cambios sugeridos
3. Aceptar transformaciones automáticas de async APIs
4. Commit de cambios del codemod

**Verification:**
```bash
git diff  # revisar cambios del codemod
```

---

### Task 3.4: Migrar `cookies()` en Supabase Server Client
**Files:** `apps/web/src/lib/supabase/server.ts` ⚠️ CRÍTICO
**Steps:**
1. Convertir función `createClient()` a `async`
2. Agregar `await` antes de `cookies()`
3. **IMPORTANTE:** Esto romperá todos los llamados actuales
4. Buscar todos los archivos que importan `createClient` de `server.ts`
5. Verificar que los componentes que usan `createClient` sean async

**Code Pattern:**
```typescript
// ❌ Antes (apps/web/src/lib/supabase/server.ts)
import { cookies } from 'next/headers';

export function createClient() {
    const cookieStore = cookies();  // SYNC
    
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                // ...
            },
        }
    );
}

// ✅ Después
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();  // ASYNC
    
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                // ...
            },
        }
    );
}
```

**Verification:**
```bash
# Buscar archivos que importan createClient de server.ts
grep -r "from '@/lib/supabase/server'" apps/web/src --include="*.tsx" --include="*.ts"
```

**⚠️ NOTA:** Este cambio es CRÍTICO y afectará múltiples Server Components. Verificar cada uno.

---

### Task 3.5: Actualizar Server Components que usan Supabase
**Files:** Todos los archivos que importan `createClient` de `server.ts`
**Steps:**
1. Buscar imports: `grep -r "from '@/lib/supabase/server'" apps/web/src`
2. Para cada archivo encontrado:
   - Verificar que el componente sea `async`
   - Agregar `await` antes de `createClient()`
3. Común en: layouts, server actions, route handlers

**Code Pattern:**
```typescript
// ❌ Antes
import { createClient } from '@/lib/supabase/server';

export default function ServerComponent() {
    const supabase = createClient();
    // ...
}

// ✅ Después
import { createClient } from '@/lib/supabase/server';

export default async function ServerComponent() {
    const supabase = await createClient();
    // ...
}
```

---

### Task 3.6: Migrar `params` y `searchParams` (si hay Server Components con params)
**Files:** Buscar Server Components con `{ params }` o `{ searchParams }`
**Steps:**
1. Buscar: `grep -r "params.*:" apps/web/src/app --include="page.tsx" --include="layout.tsx"`
2. Filtrar solo Server Components (sin `'use client'` en primera línea)
3. Para cada uno, migrar a async pattern

**Code Pattern:**
```typescript
// ❌ Antes (Server Component)
export default function Page({ params, searchParams }: PageProps) {
  const { id } = params;
}

// ✅ Después
export default async function Page(props: PageProps) {
  const params = await props.params;
  const { id } = params;
}
```

**⚠️ NOTA:** Según análisis, la mayoría de páginas con params son Client Components, por lo que este paso debería ser mínimo.

---

### Task 3.7: Migrar Middleware a Proxy
**Files:** `apps/web/middleware.ts` → `apps/web/proxy.ts`
**Steps:**
1. Verificar si existe `middleware.ts`
2. Si existe, renombrar a `proxy.ts`
3. Actualizar imports y exports según nueva API
4. Verificar que lógica de intercepción funcione

**Code Pattern:**
```typescript
// proxy.ts (nueva convención)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Tu lógica de intercepción
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

---

### Task 3.7: Migrar useFormState a useActionState
**Files:** `apps/web/src/**/*.tsx`, buscar `useFormState`
**Steps:**
1. Buscar uso de `useFormState` de React
2. Reemplazar con `useActionState`
3. Actualizar imports: `react` → `useActionState`

**Code Pattern:**
```typescript
// ❌ Antes
import { useFormState } from 'react';

// ✅ Después
import { useActionState } from 'react';
```

**Verification:**
```bash
grep -r "useFormState" apps/web/src  # debe estar vacío
```

---

### Task 3.8: Actualizar Configuración ESLint
**Files:** `apps/web/.eslintrc.json` → `apps/web/eslint.config.js`
**Steps:**
1. Ejecutar codemod de ESLint: `npx @next/codemod@canary eslint-flat-config`
2. Revisar nuevo `eslint.config.js`
3. Eliminar `.eslintrc.json` antiguo
4. Probar: `pnpm lint`

**Verification:**
```bash
cd apps/web && pnpm lint  # debe ejecutar sin errores
```

---

### Task 3.9: Actualizar Configuración de Imágenes (si hay)
**Files:** `apps/web/next.config.js`
**Steps:**
1. Verificar si hay `images.domains` y cambiar a `images.remotePatterns`
2. Revisar `minimumCacheTTL` (ahora default 4 horas)
3. Verificar `imageSizes` (ya no incluye `16`)

**Code Pattern:**
```javascript
// ❌ Antes
module.exports = {
  images: {
    domains: ['example.com']
  }
}

// ✅ Después
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com'
      }
    ]
  }
}
```

---

### Task 3.10: Probar Build de Web App
**Files:** Terminal
**Steps:**
1. Compilar: `cd apps/web && pnpm build`
2. Verificar que no hay errores de build
3. Iniciar servidor: `pnpm start`
4. Verificar navegación básica funciona
5. Verificar que no hay errores en consola del navegador

**Verification:**
```bash
curl http://localhost:3000  # debe responder 200
```

---

## Phase 4: Integration Testing

### Task 4.1: Probar Dev Mode Completo
**Files:** Terminal
**Steps:**
1. Detener todos los servidores
2. Limpiar: `pnpm clean && pnpm install`
3. Iniciar dev mode: `pnpm dev`
4. Verificar que API y Web inician sin errores
5. Verificar hot reload funciona

**Verification:**
- API corriendo en `http://localhost:4000`
- Web corriendo en `http://localhost:3000`
- Sin errores en consolas

---

### Task 4.2: Probar Rutas de API
**Files:** Postman/curl
**Steps:**
1. Probar endpoints críticos:
   - `GET /api/health`
   - `GET /api/me/profile`
   - `POST /api/plans/generate-week`
2. Verificar responses correctos
3. Verificar autenticación funciona

---

### Task 4.3: Probar Flujo de Usuario en Web
**Files:** Browser
**Steps:**
1. Probar páginas principales:
   - Landing page `/`
   - Login `/login`
   - Dashboard `/dashboard`
   - Plans `/plans`
2. Verificar navegación funciona
3. Verificar componentes se renderizan correctamente
4. Verificar dark mode funciona

---

### Task 4.4: Ejecutar Suite de Tests
**Files:** Terminal
**Steps:**
1. Ejecutar tests unitarios: `pnpm test`
2. Verificar que todos los tests pasan
3. Si hay fallos, analizar y corregir (probablemente por async changes)

**Verification:**
```bash
pnpm test  # todos los tests deben pasar
```

---

### Task 4.5: Ejecutar E2E Tests
**Files:** Terminal
**Steps:**
1. Ejecutar tests E2E: `npx playwright test`
2. Verificar que flow completo funciona
3. Si hay fallos, analizar cambios necesarios

---

## Phase 5: Production Verification

### Task 5.1: Build de Producción
**Files:** Terminal
**Steps:**
1. Limpiar: `pnpm clean`
2. Instalar fresh: `pnpm install`
3. Build completo: `pnpm build`
4. Verificar que ambos builds (api, web) pasan sin errores
5. Verificar tamaño de bundles (debería ser menor con Turbopack)

**Verification:**
```bash
pnpm build  # debe completar sin errores
```

---

### Task 5.2: Optimizaciones Post-Migración
**Files:** Varios
**Steps:**
1. Revisar si hay warnings de deprecación en logs
2. Considerar usar `use cache` directive en componentes estáticos
3. Verificar que Turbopack esté activo (default en Next 16)
4. Revisar performance con Lighthouse

---

### Task 5.3: Documentar Cambios
**Files:** `CHANGELOG.md`, `README.md`
**Steps:**
1. Actualizar `CHANGELOG.md` con versiones nuevas
2. Actualizar `README.md` con requisitos nuevos (Node 20.9+)
3. Documentar breaking changes aplicados
4. Actualizar guías de desarrollo si es necesario

---

### Task 5.4: Merge y Deploy
**Files:** Git
**Steps:**
1. Commit final: `git commit -m "feat: upgrade to Next.js 16.1.4 and NestJS 11.1.9"`
2. Push branch: `git push origin feat/upgrade-nextjs16-nestjs11`
3. Crear Pull Request
4. Revisión de código
5. Merge a main
6. Deploy a staging
7. Verificar en staging
8. Deploy a producción

---

## Rollback Plan

Si algo falla críticamente:

1. **Revertir branch:** `git checkout main`
2. **Force deploy anterior:** Re-deploy última versión estable
3. **Análisis:** Revisar logs de error específico
4. **Fix incremental:** Aplicar fix específico en nueva branch

---

## Success Criteria

- ✅ API inicia sin errores en dev y prod
- ✅ Web inicia sin errores en dev y prod
- ✅ Todos los tests pasan
- ✅ E2E tests pasan
- ✅ No hay errores en logs de producción
- ✅ Performance igual o mejor que antes
- ✅ Todas las features funcionan correctamente

---

## Notas Técnicas

### Beneficios Esperados:
- **Turbopack:** 2-5x builds más rápidos
- **React Compiler:** Mejor performance automática
- **Express 5:** Mejor manejo de async/await
- **Mejor DX:** Hot reload más rápido

### Riesgos Potenciales:
- Async APIs pueden requerir refactor extenso
- Dynamic modules en NestJS pueden necesitar ajustes
- Tests pueden fallar por cambios en APIs

### Tiempo Estimado:
- **Preparation:** 30 min
- **NestJS Migration:** 1-2 horas
- **Next.js Migration:** 2-3 horas
- **Testing & Verification:** 1-2 horas
- **Total:** 4-7 horas

---

## Post-Migration Monitoring

**First 48 hours:**
- Monitorear logs de errores
- Verificar métricas de performance
- Revisar reportes de usuarios
- Estar listo para hotfix o rollback

**First week:**
- Investigar warnings de deprecación
- Optimizar con nuevas features (use cache, etc.)
- Actualizar documentación basada en aprendizajes
