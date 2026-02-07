# Deployment & Future Scaling Plan

> **Proyecto**: NutriFlow
> **Estado**: Activo (preparado para crecimiento)
> **Objetivo**: Dejar la arquitectura lista para escalar sin refactors dolorosos en 2–6 meses.

---

## 1. Visión general de despliegue

La arquitectura se basa en **separación clara de responsabilidades**:

- **Next.js (Frontend + BFF ligero)** → Vercel
- **NestJS (Backend de dominio / Diet Engine)** → Servicio independiente
- **Supabase** → Base de datos, Auth y Storage

```
Usuario
  ↓
Vercel (Next.js)
  ↓ HTTPS
API Backend (NestJS)
  ↓
Supabase (Postgres)
```

Esta separación permite:
- evitar límites serverless para lógica pesada
- añadir workers/colas en el backend sin tocar frontend
- cambiar proveedor de frontend o backend sin acoplamiento

---

## 2. Frontend — Next.js en Vercel

### Responsabilidades
- UI / UX
- Autenticación (Supabase Auth)
- Orquestación ligera
- Llamadas HTTP al backend NestJS

### Variables de entorno

```env
NEXT_PUBLIC_API_BASE_URL=https://api.tudominio.com
```

### Buenas prácticas
- Nunca lógica de dominio pesada en Route Handlers
- Todas las operaciones largas se delegan a NestJS
- Reintentos controlados (no en 429)
- Enviar `x-request-id` en cada request

---

## 3. Backend — NestJS como servicio independiente

### Responsabilidades
- Diet Engine (motor determinista)
- Narración con LLM (opcional)
- Validaciones nutricionales
- Cache y estados de jobs
- Futuros workers/colas

### Hosting recomendado
- **Render** o **Railway** (fase actual)
- Docker-based, sin límite de ejecución

### Variables de entorno

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://tudominio.vercel.app
LLM_PRIMARY=gemini
LLM_FALLBACK=ollama
LLM_LAST_RESORT=null
ALLOW_OLLAMA_IN_PROD=false
```

---

## 4. Contrato API (Future-proof)

### Versionado

Todas las rutas deben estar versionadas:

```
/v1/diet/...
```

### Endpoints principales

#### Crear plan (asíncrono)
```
POST /v1/diet/plans
→ 202 Accepted
{
  "jobId": "uuid",
  "status": "PENDING"
}
```

#### Estado del job
```
GET /v1/diet/jobs/:jobId
```

#### Obtener plan final
```
GET /v1/diet/plans/:planId
```

#### Narración del plan
```
POST /v1/diet/plans/:planId/narrate
```

---

## 5. Jobs y ejecución (sin colas aún)

### Tabla `diet_jobs`

Campos recomendados:
- `id`
- `type` (`PLAN_GENERATION`, `PLAN_NARRATION`)
- `status` (`PENDING`, `RUNNING`, `READY`, `FAILED`)
- `input_hash`
- `plan_id`
- `error_code`, `error_message`
- `created_at`, `updated_at`

### Patrón de ejecución

- Controller crea el job
- Orchestrator decide qué hacer
- Runner ejecuta inline (hoy)

> En el futuro, el Runner se moverá a workers sin cambiar el API.

---

## 6. Preparación para colas y workers

### Diseño recomendado

- Introducir interfaz `JobQueue`
- Implementación actual: `InlineQueue`
- Implementación futura: `BullMQQueue` / `Cloud Tasks`

El código del dominio **no debe saber** si hay cola o no.

---

## 7. Cache y deduplicación

### Narraciones

Tabla `plan_narrations`:
- `plan_id`
- `signature_hash`
- `provider`
- `content_json`
- `created_at`

**Regla**: si la firma coincide → no llamar LLM.

### Input hash

Evita generar dos veces el mismo plan:
```
hash(profile + goal + constraints + week)
```

---

## 8. Observabilidad mínima

### Headers
- `x-request-id` generado en Next

### Logs estructurados
- `request_id`
- `job_id`
- `type`
- `status`
- `provider_used`
- `fallback_reason`
- `duration_ms`

---

## 9. Seguridad

- Auth centralizada en Supabase
- JWT reenviado a NestJS
- Guard en Nest valida usuario y permisos
- CORS estricto

---

## 10. Dominio y DNS

- `app.tudominio.com` → Vercel
- `api.tudominio.com` → NestJS

---

## 11. Escenarios futuros contemplados

- Añadir Redis + BullMQ sin cambiar endpoints
- Añadir workers de narración
- Añadir batch jobs (regenerar planes)
- Cambiar proveedor LLM sin tocar dominio
- Migrar frontend sin tocar backend

---

## 12. Checklist final

- [ ] API versionada (`/v1`)
- [ ] Backend separado de Vercel
- [ ] Jobs persistidos
- [ ] Lógica asíncrona
- [ ] Cache de narraciones
- [ ] Observabilidad mínima
- [ ] Dominio independiente del framework

---

> **Principio rector**: Diseñar hoy como si mañana hubiera 10× más tráfico, pero implementar solo lo necesario.
>
> **Resultado**: el proyecto puede crecer sin refactor estructural.

