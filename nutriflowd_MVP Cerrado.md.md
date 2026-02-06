Crear mi aplicación Web NutriFlow — Documento maestro (estructura, stack y documentación)

\> \*\*Proyecto:\*\* NutriFlow    
\> \*\*Tipo:\*\* Aplicación web full-stack para generación de \*\*dieta semanal (Lunes–Domingo)\*\* orientada a \*\*pérdida de peso\*\* y \*\*buenos hábitos\*\*.    
\> \*\*MVP:\*\* Dieta basada en \*\*combinaciones de alimentos\*\* (no recetas paso a paso).    
\> \*\*Mercado futuro:\*\* España / UE (EU).    
\> \*\*Frontend:\*\* Next.js    
\> \*\*Backend:\*\* Nest.js (Node.js)    
\> \*\*DB/BaaS:\*\* Supabase (Postgres \+ Auth \+ RLS)

\---

\#\# 1\) Objetivo del producto

NutriFlow permite a un usuario:  
\- Crear su perfil nutricional (edad, sexo, peso, altura, actividad, objetivo pérdida de peso).  
\- Indicar \*\*restricciones\*\* (alergias, intolerancias) y \*\*preferencias\*\* (patrón de dieta).  
\- Generar automáticamente un \*\*plan semanal de lunes a domingo\*\* con:  
  \- 3–5 comidas/día (según perfil)  
  \- \*\*combinaciones de ingredientes\*\* con cantidades (gramos)  
  \- objetivos aproximados de calorías/macros (tolerancia configurable)  
\- Regenerar comidas o días manteniendo restricciones y objetivo.  
\- Obtener una \*\*lista de compra semanal\*\* agregada.

\*\*Importante (legal/salud):\*\*  
\- La app debe incluir un disclaimer: “recomendaciones generales; no sustituye consejo médico”.

\---

\#\# 2\) Stack técnico definitivo

\#\#\# 2.1 Frontend (apps/web)  
\- \*\*Next.js\*\* (App Router)  
\- TypeScript  
\- UI:  
  \- Opción A: Tailwind \+ shadcn/ui (recomendado por velocidad y consistencia)  
  \- Opción B: Material UI (si se busca estilo “Google” directo)  
\- Formularios: react-hook-form \+ zod  
\- Peticiones y caché: fetch \+ (opcional) TanStack Query  
\- Animaciones (UX premium): Framer Motion (opcional MVP, recomendado v1)

\#\#\# 2.2 Backend (apps/api)  
\- \*\*Nest.js\*\* (Node.js \+ TypeScript)  
\- API: REST (MVP)  
\- Validación: class-validator \+ class-transformer  
\- Documentación API: Swagger/OpenAPI (\`@nestjs/swagger\`)  
\- Seguridad:  
  \- Autenticación con Supabase Auth (token Bearer)  
  \- Guards \+ Roles (user/admin)

\#\#\# 2.3 Base de datos / Plataforma  
\- \*\*Supabase\*\*  
  \- Auth (gestión usuarios)  
  \- Postgres  
  \- Row Level Security (RLS) para privacidad por usuario  
  \- Storage (futuro: imágenes, exports, etc.)  
\- Migraciones SQL versionadas en el repo

\#\#\# 2.4 Observabilidad y calidad  
\- Logging estructurado en backend  
\- Manejo global de errores (filters/interceptors)  
\- Tests:  
  \- Unit: DietEngine (crítico)  
  \- Integración: endpoints clave (generate-week, profile)  
  \- E2E (v1 recomendado): flujo completo con Playwright

\---

\#\# 3\) Arquitectura (visión general)

\#\#\# 3.1 Componentes principales  
\- \*\*Web (Next.js)\*\*: UI, onboarding, vista plan semanal, lista compra  
\- \*\*API (Nest.js)\*\*: lógica de negocio, validación, motor dietético, persistencia  
\- \*\*Supabase (Postgres \+ Auth \+ RLS)\*\*: almacenamiento seguro multiusuario  
\- \*\*DietEngine (módulo aislado)\*\*: reglas de generación y cálculos (testeable)

\#\#\# 3.2 Principio clave del MVP  
\- Menú semanal \*\*7 días\*\*  
\- Sin recetas; solo \*\*combinaciones de ingredientes\*\* (con gramos \+ macros)  
\- Regeneración de comida/día respetando:  
  \- alergias/intolerancias  
  \- patrón dietético (omnivore/vegetarian/vegan/pescatarian)  
  \- objetivo calórico y macros aproximados

\---

\#\# 4\) Estructura del repositorio (monorepo profesional)

\*\*Recomendación:\*\* Turborepo \+ pnpm

nutriflow/  
apps/  
web/ \# Next.js (frontend)  
api/ \# Nest.js (backend)  
packages/  
ui/ \# Design System compartido (componentes)  
shared/ \# tipos, enums, utilidades, schemas compartidos  
config/ \# eslint, prettier, tsconfig base  
docs/  
product/ \# PRD/SRS, backlog, reglas negocio, disclaimer  
architecture/  
adr/ \# decisiones técnicas (ADRs)  
diagrams/ \# diagramas (opcional)  
api/ \# OpenAPI export, ejemplos  
runbooks/ \# despliegue, RLS, backups, incidencias  
infra/  
supabase/  
migrations/ \# SQL versionado (schema \+ RLS)  
seed/ \# seeds (ingredientes/alérgenos)  
docker/ \# docker-compose local (opcional)  
.github/  
workflows/ \# CI (lint/test/build)  
README.md  
CONTRIBUTING.md  
turbo.json  
pnpm-workspace.yaml  
package.json

\---

\#\# 5\) Backend Nest.js — estructura interna (capas limpias)

apps/api/src/  
main.ts  
app.module.ts

config/  
env.schema.ts \# validación variables entorno  
supabase.ts \# cliente server-side

common/  
guards/ \# auth guard, roles guard  
filters/ \# excepciones globales  
interceptors/ \# logging, transform responses  
pipes/ \# validation pipe  
decorators/ \# @User(), @Roles(), etc.  
errors/ \# errores tipados

modules/  
auth/  
auth.module.ts  
supabase-jwt.strategy.ts \# validación JWT de Supabase  
auth.guard.ts  
roles.guard.ts

users/  
  users.module.ts  
  users.controller.ts  
  users.service.ts  
  users.repository.ts

profiles/  
  profiles.module.ts  
  profiles.controller.ts  
  profiles.service.ts  
  profiles.repository.ts  
  dto/

ingredients/  
  ingredients.module.ts  
  ingredients.controller.ts  
  ingredients.service.ts  
  ingredients.repository.ts  
  dto/

plans/  
  plans.module.ts  
  plans.controller.ts  
  plans.service.ts  
  plans.repository.ts  
  dto/

diet-engine/  
  diet-engine.module.ts  
  diet-engine.service.ts  
  types.ts  
  calculators/               \# BMR/TDEE \+ macros  
  selectors/                 \# selección de ingredientes combinables  
  rules/                     \# restricciones alergias/patrón dietético

shopping-list/  
  shopping-list.module.ts  
  shopping-list.service.ts  
  shopping-list.repository.ts

admin/  
  admin.module.ts  
  admin.controller.ts  
  admin.service.ts

\*\*Capas y responsabilidad\*\*  
\- \*\*Controller:\*\* request/response \+ DTO  
\- \*\*Service:\*\* negocio  
\- \*\*Repository:\*\* queries DB  
\- \*\*DietEngine:\*\* lógica de generación (aislada y testeable)

\---

\#\# 6\) Frontend Next.js — estructura interna

apps/web/  
app/  
(public)/  
page.tsx \# landing  
(auth)/  
login/page.tsx  
register/page.tsx  
(app)/  
onboarding/page.tsx  
dashboard/page.tsx  
plan/\[planId\]/page.tsx  
shopping-list/\[planId\]/page.tsx  
settings/page.tsx  
layout.tsx

components/  
common/  
forms/  
plan/  
layout/

lib/  
api-client.ts \# cliente API tipado  
auth.ts \# helper auth  
validators/ \# zod schemas

\---

\#\# 7\) Base de datos (Supabase/Postgres) — entidades principales

\#\#\# 7.1 Tablas del MVP  
\- \`profiles\` (perfil nutricional)  
\- \`allergens\` (catálogo alérgenos)  
\- \`profile\_allergens\` (restricciones por usuario)  
\- \`ingredients\` (ingredientes base \+ macros por 100g)  
\- \`ingredient\_allergens\` (relación ingrediente-alérgeno)  
\- \`plans\` (plan semanal \+ targets kcal/macros)  
\- \`plan\_meals\` (estructura de comidas por día)  
\- \`plan\_meal\_items\` (ingredientes \+ gramos por comida)  
\- \`shopping\_lists\` y \`shopping\_list\_items\` (lista compra agregada)  
\- \`weight\_logs\` (opcional MVP)  
\- \`user\_roles\` (admin/user)

\#\#\# 7.2 Seguridad con RLS  
\- El usuario solo puede leer/escribir:  
  \- su perfil, alergias, planes, comidas, items, lista compra, peso  
\- Solo admin puede escribir:  
  \- ingredientes, alérgenos, relaciones ingrediente-alérgeno y roles

\> \*\*Nota:\*\* El esquema SQL \+ policies RLS están definidos en el archivo de migración (infra/supabase/migrations/xxxx\_initial.sql).

\---

\#\# 8\) API REST (MVP) — endpoints definitivos

\#\#\# 8.1 Perfil  
\- \`GET /me/profile\`  
\- \`PUT /me/profile\`  
\- \`GET /me/allergens\`  
\- \`PUT /me/allergens\`

\#\#\# 8.2 Planes  
\- \`POST /plans/generate-week\`  → genera plan de \*\*7 días (L–D)\*\*  
\- \`GET /plans\`                 → lista planes del usuario  
\- \`GET /plans/:id\`             → detalle plan (meals \+ items)  
\- \`POST /plans/:id/regenerate-meal\`  
\- \`POST /plans/:id/regenerate-day\`  
\- \`POST /plans/:id/lock-meal\`  
\- \`POST /plans/:id/archive\`

\#\#\# 8.3 Lista de compra  
\- \`GET /plans/:id/shopping-list\`

\#\#\# 8.4 Admin  
\- \`GET /ingredients\` (lectura pública para app)  
\- \`POST /admin/ingredients\`  
\- \`PUT /admin/ingredients/:id\`  
\- \`POST /admin/allergens\`  
\- \`PUT /admin/allergens/:id\`

\*\*Regla clave:\*\*  
\- \`weekStart\` debe ser \*\*lunes\*\* (YYYY-MM-DD).    
  \- O se valida (400) o se normaliza al lunes anterior (decisión ADR).

\---

\#\# 9\) Contratos (DTOs Nest.js) — dónde viven

Ubicación recomendada:  
\- \`apps/api/src/modules/\*/dto/\*.ts\`

Incluye:  
\- \`UpsertProfileDto\`  
\- \`SetProfileAllergensDto\`  
\- \`GenerateWeeklyPlanDto\`  
\- \`RegenerateMealDto\`  
\- \`RegenerateDayDto\`  
\- \`SetMealLockDto\`  
\- \`CreateIngredientDto\`, \`UpdateIngredientDto\`  
\- Tipos de respuesta compartidos:  
  \- \`PlanResponse\`, \`MealResponse\`, \`MealItemResponse\`, \`MacroTotals\`

\> Se recomienda duplicar enums/contratos en \`packages/shared\` para tipado end-to-end (front/back).

\---

\#\# 10\) DietEngine (MVP) — reglas explícitas

\#\#\# 10.1 Inputs  
\- Perfil: edad, sexo, altura, peso, actividad, comidas/día, patrón dieta  
\- Restricciones: alergias/intolerancias \+ avoidFoods  
\- Catálogo ingredientes (kcal/macros por 100g \+ tags/categoría \+ alérgenos)

\#\#\# 10.2 Outputs  
\- Plan semanal (7 días)  
  \- meals por día (breakfast/lunch/dinner/(snack))  
  \- items por meal: \`ingredient \+ grams\` \+ macros

\#\#\# 10.3 Reglas  
\- \*\*Nunca\*\* incluir ingredientes con alérgenos marcados para el usuario.  
\- Respetar \`diet\_pattern\`:  
  \- vegan: no alimentos animales  
  \- vegetarian: no carne/pescado  
  \- pescatarian: no carne, sí pescado  
\- Ajustar porciones para aproximar:  
  \- objetivo kcal \+ macros (tolerancia ±10% MVP)  
\- Regeneración:  
  \- si meal/día está \`locked\`, no regenerar (salvo \`force\` admin/debug)

\---

\#\# 11\) Documentación obligatoria (la app “está documentada” de verdad)

\#\#\# 11.1 Documentación técnica (mínimos)  
\- \*\*README.md (root)\*\*:  
  \- qué es NutriFlow  
  \- cómo correr local (paso a paso)  
  \- variables de entorno  
  \- scripts (dev/lint/test/build)  
  \- arquitectura de alto nivel (enlace a docs)  
\- \*\*Swagger/OpenAPI\*\* (apps/api):  
  \- Swagger UI en \`/api/docs\`  
  \- JSON en \`/api/docs-json\`  
\- \*\*ADRs\*\* (docs/architecture/adr):  
  \- ADR-001 monorepo \+ turborepo  
  \- ADR-002 supabase auth \+ RLS  
  \- ADR-003 diet engine heurístico MVP  
  \- ADR-004 normalización weekStart lunes  
\- \*\*Runbooks\*\* (docs/runbooks):  
  \- deploy staging/prod  
  \- backups  
  \- rotación keys  
  \- troubleshooting generación de planes  
\- \*\*Docs de producto\*\* (docs/product):  
  \- PRD/SRS  
  \- backlog (MVP/v1/v2)  
  \- reglas negocio  
  \- disclaimer médico y copy

\#\#\# 11.2 Documentación de desarrollo (calidad)  
\- CONTRIBUTING.md (estándares, ramas, PRs)  
\- Convenciones:  
  \- lint \+ prettier  
  \- commit conventions (opcional)  
  \- definición de “Done”: tests \+ docs \+ CI ok

\---

\#\# 12\) Backlog priorizado (resumen explícito)

\#\#\# MVP (core)  
\- Fundaciones (repo, envs, auth, roles)  
\- Perfil \+ restricciones  
\- DietEngine:  
  \- cálculo objetivos  
  \- plan semanal 7 días  
  \- compatibilidad restricciones  
  \- ajuste porciones  
\- UI plan semanal \+ regeneración \+ lock  
\- Lista de compra semanal  
\- Admin mínimo ingredientes \+ alérgenos \+ seed inicial

\#\#\# v1 (calidad \+ personalización)  
\- lista negra “no me gusta”  
\- presupuesto  
\- tracking peso y adaptación  
\- export PDF  
\- optimización de macros más precisa  
\- import masivo CSV

\#\#\# v2 (IA/copiloto \+ escalado)  
\- copiloto conversacional  
\- aprendizaje de preferencias  
\- integraciones (actividad real)  
\- recetas paso a paso (mejora futura)  
\- localización avanzada EU por país/temporada

\---

\#\# 13\) Entregables finales del repo (checklist)

\#\#\# Código  
\- \[ \] apps/web (Next.js)  
\- \[ \] apps/api (Nest.js)  
\- \[ \] infra/supabase (migrations \+ RLS \+ seed)  
\- \[ \] packages/shared (tipos/constantes)  
\- \[ \] packages/ui (opcional MVP, recomendado v1)

\#\#\# Documentación  
\- \[ \] README.md  
\- \[ \] docs/product/PRD\_SRS.md  
\- \[ \] docs/product/BACKLOG.md  
\- \[ \] docs/architecture/adr/ADR-001..005.md  
\- \[ \] docs/api/openapi.json (export)  
\- \[ \] docs/runbooks/deploy.md \+ backups.md \+ [troubleshooting.md](http://troubleshooting.md)

\#\#\# Calidad  
\- \[ \] CI lint/test/build  
\- \[ \] Unit tests DietEngine  
\- \[ \] Swagger UI activo

\---

\#\# 14\) Nota final (MVP scope sin ambigüedad)

\*\*NutriFlow MVP \=\*\*  
\- Perfil \+ restricciones  
\- Generación semanal L–D  
\- Combinaciones de alimentos (ingredientes \+ gramos)  
\- Regenerar comida/día \+ bloquear  
\- Lista compra semanal  
\- Persistencia \+ historial  
\- Admin mínimo para ingredientes/alérgenos  
\- Documentación completa (Swagger \+ ADR \+ runbooks \+ README)

