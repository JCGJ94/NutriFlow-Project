# NutriFlow — Security Audit Results

Este documento resume los hallazgos y correcciones aplicadas durante la fase de endurecimiento (hardening) del MVP.

## 🛡️ Hallazgos Críticos

### 1. Row Level Security (RLS)
- **Estado:** ✅ Corregido.
- **Detalle:** Se verificó que todas las tablas en el esquema `public` de Supabase tengan RLS activo.
- **Corrección:** Se aplicaron políticas `USING (auth.uid() = user_id)` para asegurar que ningún usuario pueda listar o modificar datos ajenos.

### 2. Exposición de SERVICE_ROLE_KEY
- **Estado:** ✅ Mitigado.
- **Detalle:** Se unificaron los archivos `.env` y se añadió una advertencia crítica en `.env.example`.
- **Acción:** Se movió el uso de `SERVICE_ROLE_KEY` exclusivamente a servicios backend inyectado vía variables de entorno seguras.

## ⚔️ Pruebas de Penetración Básicas

- **SQL Injection:** Protegido por el uso de Prisma/Supabase Client que parametrizan todas las consultas por defecto.
- **JWT Spoofing:** El backend valida la firma de cada token con `SUPABASE_JWT_SECRET`.
- **Broken Access Control:** Verificado mediante tests E2E que intentan acceder a rutas de "admin" sin los permisos adecuados.

## 🚀 Recomendaciones Futuras
- Implementar **Rate Limiting** estricto en el endpoint de generación de dietas para prevenir abuso de la API de Gemini.
- Integrar **Snyk** o **Dependabot** para monitorear vulnerabilidades en dependencias de npm.
