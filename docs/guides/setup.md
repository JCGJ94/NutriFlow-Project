# NutriFlow - Guía de Configuración de Supabase

Esta guía te ayudará a configurar Supabase Cloud para NutriFlow.

## 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta si no la tienes
2. Click en **"New Project"**
3. Configura:
   - **Project name:** `nutriflow`
   - **Database password:** Genera una contraseña segura (guárdala)
   - **Region:** Elige la más cercana (ej: `eu-west-1` para España)
4. Click en **"Create new project"** y espera ~2 minutos

## 2. Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Project Settings** (⚙️ icono en la barra lateral)
2. Click en **API**
3. Copia las siguientes credenciales:

```
SUPABASE_URL=https://[tu-project-id].supabase.co
SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_KEY=[tu-service-role-key]
```

4. Ve a **API** > **JWT Settings** y copia:

```
SUPABASE_JWT_SECRET=[tu-jwt-secret]
```

## 3. Ejecutar Migraciones

1. Ve a **SQL Editor** en la barra lateral
2. Click en **"New Query"**
3. Ejecuta los scripts en este orden:

### Paso 3.1: Schema
Copia y pega el contenido de:
```
infra/supabase/migrations/001_initial_schema.sql
```
Click en **"Run"**

### Paso 3.2: RLS Policies
Copia y pega el contenido de:
```
infra/supabase/migrations/002_rls_policies.sql
```
Click en **"Run"**

### Paso 3.3: Seed Data
Copia y pega el contenido de:
```
infra/supabase/seed/001_initial_seed.sql
```
Click en **"Run"**

## 4. Configurar Authentication

1. Ve a **Authentication** > **Providers**
2. Asegúrate de que **Email** está habilitado
3. Configura (opcional pero recomendado):
   - **Enable email confirmations:** OFF para desarrollo
   - **Enable double confirm:** OFF para desarrollo

## 5. Configurar Variables de Entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase
SUPABASE_URL=https://[tu-project-id].supabase.co
SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_KEY=[tu-service-role-key]
SUPABASE_JWT_SECRET=[tu-jwt-secret]

# API
API_PORT=3001
API_PREFIX=api
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 6. Verificar Setup

Tras ejecutar las migraciones, puedes verificar en **Table Editor**:

- `allergens`: 14 alérgenos (EU standard)
- `ingredients`: ~80 ingredientes con macros
- `ingredient_allergens`: Relaciones alérgeno-ingrediente

## 7. Testing Manual de Auth

Para probar la autenticación manualmente:

1. Ve a **Authentication** > **Users**
2. Click en **"Add user"** > **"Create new user"**
3. Ingresa email y password de prueba
4. El usuario aparecerá en la lista

## Solución de Problemas

### Error: "Invalid JWT"
- Verifica que `SUPABASE_JWT_SECRET` esté correctamente copiado
- Comprueba que el token no haya expirado

### Error: "RLS policy violation"
- Asegúrate de que las policies en `002_rls_policies.sql` se ejecutaron
- Verifica que el usuario esté autenticado

### Error: "Table does not exist"
- Ejecuta `001_initial_schema.sql` primero
- Verifica que no hubo errores en la ejecución

---

## Links Útiles

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Docs - Auth](https://supabase.com/docs/guides/auth)
- [Supabase Docs - RLS](https://supabase.com/docs/guides/auth/row-level-security)
