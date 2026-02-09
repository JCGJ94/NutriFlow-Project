# Security & Data Protection Audit — Master Prompt

> **Uso**: Este documento es un **prompt operativo** para trabajar con un agente (Antigravity / AI agent / auditor técnico) y realizar una **auditoría exhaustiva de seguridad, datos y arquitectura** del proyecto **NutriFlow**.
>
> **Objetivo**: identificar, demostrar y corregir **todas las brechas de seguridad** antes de producción.

---

## 0. Rol del agente

Actúa como:

* **Senior Security Engineer** (OWASP, API security, cloud-native)
* **Data Protection Analyst** (PII, GDPR mindset)
* **Backend Architect** (NestJS, Supabase, Next.js)

No asumas nada. **Verifica todo en código, configuración y flujos reales**.

---

## 1. Contexto del proyecto

* Monorepo Node.js
* Frontend: Next.js (App Router)
* Backend: NestJS (API independiente)
* Base de datos: Supabase (Postgres + RLS + Auth)
* Dominio: generación de planes nutricionales (datos sensibles de salud)

El proyecto maneja:

* datos personales (altura, peso, objetivos, alergias)
* tokens JWT
* claves de servicios externos (LLM, Supabase)

👉 **Trátalo como sistema de riesgo medio–alto**.

---

## 2. Objetivo principal del análisis

1. Detectar **cualquier brecha de seguridad real o potencial**
2. Clasificarla por severidad
3. Explicar **cómo se podría explotar**
4. Proponer **una corrección concreta y verificable**
5. Dejar el sistema listo para producción

---

## 3. Alcance obligatorio del análisis

Debes revisar **todo** lo siguiente:

* `apps/web` (Next.js)
* `apps/api` (NestJS)
* `infra/supabase` (SQL, RLS, policies)
* `packages/shared`
* `.env*`, configs, CI/CD
* Flujos reales de datos (frontend → backend → DB → servicios externos)

No omitas nada aunque parezca "obvio".

---

## 4. Metodología obligatoria

### 4.1 Threat Modeling

1. Identifica activos críticos (datos, secretos, endpoints).
2. Dibuja flujos de datos.
3. Enumera vectores de ataque:

   * Auth bypass
   * IDOR
   * RLS bypass
   * Token leakage
   * Abuse / rate-limit
   * SSRF
   * XSS / injection

Entrega: **lista de amenazas por componente**.

---

### 4.2 Secretos y credenciales

Busca activamente:

* claves hardcodeadas
* `.env` versionados
* `NEXT_PUBLIC_*` con secretos
* service_role keys expuestas

Verifica:

* qué secretos existen
* dónde se usan
* quién puede acceder a ellos

Entrega: **inventario de secretos + riesgo**.

---

### 4.3 Supabase / Postgres / RLS (CRÍTICO)

Para **cada tabla con datos de usuario**:

* ¿RLS activado?
* ¿Policies explícitas para SELECT / INSERT / UPDATE / DELETE?
* ¿Se usa `auth.uid()` correctamente?
* ¿Existe alguna policy demasiado permisiva?
* ¿Hay funciones o vistas que bypasseen RLS?

Simula ataques:

* usuario A intenta leer datos de usuario B
* usuario A intenta modificar planes ajenos

Entrega:

* tabla → estado RLS → riesgo

---

### 4.4 Backend NestJS (API Security)

Revisa:

* Guards de autenticación
* Autorización por recurso (ownership)
* Validación de inputs (DTOs)
* Rate limiting
* Manejo de errores
* Logs (PII leakage)

Preguntas clave:

* ¿Algún endpoint confía en `userId` del cliente?
* ¿Algún endpoint permite IDOR?
* ¿Hay loops que puedan causar abuso?

Entrega:

* lista de endpoints + vulnerabilidades

---

### 4.5 Frontend Next.js

Revisa:

* uso de Supabase client directo
* SSR / Route Handlers
* variables públicas
* renderizado de contenido dinámico (LLM)

Busca:

* XSS
* filtrado solo en UI (sin backend)
* fugas de tokens

---

### 4.6 Dependencias (Supply Chain)

Analiza:

* dependencias directas y transitivas
* paquetes con scripts sospechosos
* CVEs conocidas

Entrega:

* dependencias críticas + acción recomendada

---

### 4.7 Servicios externos (LLM, MCP, APIs)

Verifica:

* payloads enviados
* datos sensibles compartidos
* timeouts
* allowlists de dominio

Busca:

* SSRF
* data exfiltration

---

## 5. Pruebas de ataque (DAST)

Ejecuta o simula:

* IDOR
* JWT manipulado
* requests masivos
* payloads grandes
* bypass de auth

Entrega:

* vector → resultado → impacto

---

## 6. Observabilidad y detección

Evalúa:

* si se podrían detectar ataques reales
* qué métricas faltan
* qué logs son insuficientes

---

## 7. Output obligatorio del agente

El agente debe producir:

### 7.1 Security Findings Report

Tabla con columnas:

* ID
* Componente
* Descripción
* Severidad (Critical / High / Medium / Low)
* Cómo se explota
* Evidencia (archivo / línea)
* Fix recomendado

### 7.2 Plan de remediación

* fixes inmediatos
* fixes estructurales
* mejoras de proceso (CI, reviews)

### 7.3 Checklist de producción

* seguridad
* datos
* despliegue

---

## 8. Reglas estrictas

* No asumas: **demuestra con código**
* No maquilles riesgos
* Si dudas → clasifica como riesgo
* Prioriza protección de datos del usuario

---

## 9. Criterio de éxito

El trabajo está completo cuando:

* No existen brechas críticas abiertas
* Ningún usuario puede acceder a datos ajenos
* Ningún secreto está expuesto
* El sistema resiste abuso básico
* El proyecto puede salir a producción con confianza

---

> **Mentalidad**: este sistema maneja datos de salud.
>
> **Regla de oro**: *si se puede abusar, alguien lo hará*.
