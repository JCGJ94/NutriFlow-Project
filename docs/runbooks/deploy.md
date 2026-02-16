# NutriFlow Deployment Runbook

Guía paso a paso para el despliegue en producción. NutriFlow utiliza una arquitectura desacoplada en un entorno monorepo.

## 🚀 Despliegue del Backend (Railway)

1. **Conexión:** Conecta tu repositorio de GitHub a un nuevo proyecto en Railway.
2. **Configuración del Servicio:**
   - **Root Directory:** `./` (la raíz del monorepo).
   - **Build Command:** `pnpm install && pnpm turbo run build --filter=@nutriflow/api...`
   - **Start Command:** `pnpm --filter @nutriflow/api start:prod`
3. **Variables de Entorno:**
   - Copia los valores de `.env.example` (sección Backend) al panel de Railway.
   - Asegúrate de que `PORT` sea 3000 o el configurado en Railway.
4. **Health Check:**
   - Configura el health check en Railway para apuntar a `/v1/health`.

## 🌐 Despliegue del Frontend (Vercel)

1. **Proyecto:** Crea un nuevo proyecto en Vercel importando el mismo repositorio.
2. **Configuración:**
   - **Framework Preset:** Next.js.
   - **Root Directory:** `apps/web`.
3. **Build settings (Automático):** Vercel detectará el monorepo de Turbo automáticamente.
4. **Variables de Entorno:**
   - `NEXT_PUBLIC_API_URL`: La URL del backend desplegado en Railway (ej: `https://api-production.up.railway.app/v1`).
   - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 🔒 Post-Despliegue

1. **CORS:** Actualiza `CORS_ORIGIN` en el backend con la URL final de Vercel.
2. **Supabase:** Asegúrate de mapear las URLs de redirección de Auth a la URL de producción.
