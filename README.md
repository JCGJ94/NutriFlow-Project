# NutriFlow MVP

> Aplicación web full-stack para generación de **dietas semanales personalizadas** orientadas a pérdida de peso.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **Backend** | Nest.js, TypeScript, Class Validator |
| **Base de datos** | Supabase (PostgreSQL + Auth + RLS) |
| **Monorepo** | Turborepo + pnpm |

## 📁 Estructura del Proyecto

```
nutriflow/
├── apps/
│   ├── api/          # Backend Nest.js (port 3001)
│   └── web/          # Frontend Next.js (port 3000)
├── packages/
│   └── shared/       # Tipos y DTOs compartidos
├── infra/
│   └── supabase/     # Migraciones SQL y seeds
├── docs/
│   └── runbooks/     # Guías de configuración
└── turbo.json        # Configuración Turborepo
```

## 🏁 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- pnpm 9+
- Cuenta en [Supabase](https://supabase.com)

### 1. Clonar e Instalar

```bash
git clone <repo-url>
cd nutriflow
pnpm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ejecuta las migraciones SQL en orden:
   - `infra/supabase/migrations/001_initial_schema.sql`
   - `infra/supabase/migrations/002_rls_policies.sql`
   - `infra/supabase/seed/001_initial_seed.sql`
3. Copia las credenciales (ver [Guía completa](docs/runbooks/supabase-setup.md))

### 3. Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
# Supabase
SUPABASE_URL=https://[tu-project-id].supabase.co
SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_KEY=[tu-service-role-key]
SUPABASE_JWT_SECRET=[tu-jwt-secret]

# Frontend (Next.js)
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# API
API_PORT=3001
```

### 4. Ejecutar

```bash
# Desarrollo (ambos apps)
pnpm dev

# Solo backend
pnpm --filter @nutriflow/api dev

# Solo frontend
pnpm --filter @nutriflow/web dev
```

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **Swagger:** http://localhost:3001/api/docs

## 🔧 Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia todos los apps en desarrollo |
| `pnpm build` | Compila todos los apps |
| `pnpm lint` | Ejecuta ESLint |
| `pnpm test` | Ejecuta tests |
| `pnpm clean` | Limpia builds y node_modules |

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [Supabase Setup](docs/runbooks/supabase-setup.md) | Guía paso a paso para configurar Supabase |

## 🔐 Autenticación

NutriFlow usa **Supabase Auth** con email/password:

- Los usuarios se registran con email y contraseña
- El backend valida JWT tokens de Supabase
- RLS (Row Level Security) protege los datos por usuario

## 🍽️ Módulos Principales

### Diet Engine (Algoritmo de Generación)

1. **BMR Calculator**: Fórmula Mifflin-St Jeor para metabolismo basal
2. **Macros Calculator**: Distribución 30P/40C/30F con déficit calórico
3. **Ingredient Selector**: Selección por categoría con control de porciones
4. **Rules**: Filtrado por alérgenos y patrón de dieta

### API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Crear cuenta |
| GET/PUT | `/api/me/profile` | Perfil nutricional |
| GET/PUT | `/api/me/allergens` | Restricciones alimentarias |
| POST | `/api/plans/generate-week` | Generar plan semanal |
| GET | `/api/plans/:id` | Detalle del plan |
| POST | `/api/plans/:id/regenerate-meal` | Regenerar comida |
| GET | `/api/shopping-list/:planId` | Lista de compra |
| GET | `/api/ingredients` | Catálogo de ingredientes |

## 📱 Páginas Frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/onboarding` | Configuración inicial del perfil |
| `/dashboard` | Panel principal |
| `/plan/:id` | Detalle del plan semanal |
| `/shopping-list/:id` | Lista de compra |
| `/settings` | Configuración del perfil |

## 📊 Base de Datos

### Tablas Principales

- `profiles` - Perfil nutricional del usuario
- `allergens` - Catálogo de 14 alérgenos EU
- `profile_allergens` - Restricciones por usuario
- `ingredients` - ~80 ingredientes con macros
- `ingredient_allergens` - Relaciones ingrediente-alérgeno
- `plans` - Planes semanales
- `plan_meals` - Comidas por día
- `plan_meal_items` - Ingredientes por comida

### RLS (Row Level Security)

Todas las tablas tienen políticas RLS que aseguran:
- Usuarios solo acceden a sus propios datos
- Ingredientes y alérgenos son públicos (lectura)
- Admin puede gestionar catálogos

## ⚠️ Aviso Legal

Las recomendaciones nutricionales de NutriFlow son **orientativas** y no sustituyen el consejo de un profesional de la salud. Consulta con tu médico antes de iniciar cualquier plan dietético.

## 📄 Licencia

MIT
