# PRD: Integración Antigravity ⇄ MCP ⇄ Railway para NutriFlow

## 1. Resumen Ejecutivo
Este documento define la estrategia para dotar a **Antigravity** (el agente de desarrollo) de capacidades operativas sobre la infraestructura de **NutriFlow** en **Railway**.  
Se implementará un **servidor MCP (Model Context Protocol)** personalizado que actúe como interfaz entre Antigravity y la API de Railway. Esto permitirá al agente gestionar despliegues, variables de entorno y diagnósticos sin abandonar su entorno de chat, cerrando el ciclo de desarrollo (Code → Deploy → Verify).

## 2. Objetivos y No Objetivos

### Objetivos
- **Operatividad Agentica**: Que Antigravity pueda listar proyectos, configurar variables y desplegar servicios en Railway autónomamente.
- **Seguridad por Diseño**: Autenticación segura y limitación de alcance (Scope) para evitar destrucción accidental de infraestructura.
- **Integración Fluida**: Uso del estándar MCP para compatibilidad nativa con el stack actual de Antigravity.
- **Observabilidad**: Logs claros de las acciones del agente sobre la infraestructura.

### No Objetivos
- Reemplazar la consola web de Railway para tareas complejas de facturación o gestión de equipos.
- Automatización total sin supervisión humana (Human-in-the-loop se mantiene para acciones críticas).
- Soporte para plataformas distintas a Railway en esta fase.

## 3. Contexto Técnico de NutriFlow y User Stories

### Contexto Operativo
- **Monorepo**: Turborepo con `apps/web` (Next.js) y `apps/api` (NestJS).
- **Backend Architecture**: `apps/api` destinada a Railway.
- **Base de Datos**: Supabase (gestionada externamente, pero las env vars se inyectan en Railway).
- **IA**: Diet Engine híbrido con MCP para NotebookLM (Lazy Load).

### Casos de Uso (User Stories)
1.  **US-01 Exploración**: "Como Agente, quiero listar los proyectos y servicios de Railway para entender dónde desplegar el backend."
2.  **US-02 Configuración**: "Como Agente, quiero establecer variables de entorno (ej. `DATABASE_URL`, `OPENAI_API_KEY`) en el servicio `apps/api` antes del despliegue."
3.  **US-03 Despliegue**: "Como Agente, quiero disparar un despliegue desde la rama `main` del repo de GitHub y recibir la URL pública resultante."
4.  **US-04 Verificación**: "Como Agente, quiero consultar el estado del último despliegue y los logs de build para confirmar que el servicio está `HEALTHY`."

## 4. Arquitectura Propuesta

### Opciones Evaluadas
-   **Opción A (Seleccionada): MCP Server Local (STDIO)**.
    -   *Descripción*: El servidor MCP corre en la misma máquina que Antigravity (o en su contenedor de herramientas) y se comunica por entrada/salida estándar.
    -   *Trade-offs*: Mayor seguridad (las credenciales viven en el entorno local del usuario), menor latencia, pero requiere Node.js local. Ideal para desarrollo y uso por un solo usuario/agente.
-   **Opción B: MCP Server Remoto (HTTP)**.
    -   *Descripción*: El servidor MCP se despliega como un servicio web en Railway u otro lugar.
    -   *Trade-offs*: Accesible desde cualquier lugar, pero introduce complejidad de autenticación sobre HTTP y mayor superficie de ataque.

### Decisión por Defecto: Opción A (Local STDIO)
Se elige la **Opción A** por simplicidad, seguridad (no exponemos un endpoint de control de infraestructura a internet) y alineación con el uso actual de Antigravity como herramienta de "pair programming" local.

### Diagrama de Flujo y Componentes
```mermaid
graph LR
    subgraph "Entorno Local / Antigravity"
        A[Antigravity Agent] -- "MCP Protocol (JSON-RPC)" --> B[MCP Server (Node.js)]
    end
    
    subgraph "Nube"
        B -- "GraphQL / REST API" --> C[Railway API]
        C -- "Trigger Deploy" --> D[GitHub Repo (NutriFlow)]
        D -- "Source Code" --> E[Railway Infrastructure]
    end
```

## 5. Diseño del MCP Server (Node.js)

### Ubicación y Estructura
Se creará una nueva aplicación en el monorepo para facilitar el mantenimiento compartido.
-   **Ruta**: `apps/mcp-railway/`
-   **Tecnologías**: Node.js, TypeScript, SDK oficial de MCP (`@modelcontextprotocol/sdk`), Cliente GraphQL de Railway.

### Herramientas (Tools) a Implementar
| Tool Name | Descripción | Parámetros Clave |
| :--- | :--- | :--- |
| `railway_list_projects` | Lista proyectos y ambientes disponibles. | - |
| `railway_get_services` | Lista servicios dentro de un proyecto. | `projectId` |
| `railway_upsert_variables` | Crea o actualiza variables de entorno. | `serviceId`, `variables` (Dict) |
| `railway_deploy` | Dispara un despliegue desde el repo vinculado. | `serviceId`, `branch` (default: main) |
| `railway_get_deployment` | Obtiene estado y URL de un despliegue. | `deploymentId` o `serviceId` (último) |

### Logging Seguro
-   Logs estructurados (JSON) a `stderr` (para diagnósticos del agente) o archivo local.
-   **IMPORTANTE**: Redacción automática de valores sensibles (tokens, claves) antes de escribir logs.

## 6. Diseño Railway (Target de Despliegue)

### Estrategia de Despliegue
-   **Servicio**: `apps/api` (Backend NestJS).
-   **Build Command**: `turbo run build --filter=api...`
-   **Start Command**: `node apps/api/dist/main.js` (ajustar según salida del build).
-   **Monorepo Watch Paths**: Configurar Railway para que solo redespliegue si hay cambios en `apps/api/**` o `packages/**`.

### Health Check
-   Ruta esperada: `/health` o `/api/health`.
-   El MCP server verificará que este endpoint devuelva `200 OK` tras el despliegue.

## 7. Configuración Antigravity

### Registro del Servidor
Configuración JSON para el cliente MCP de Antigravity:

```json
{
  "mcpServers": {
    "railway": {
      "command": "node",
      "args": ["path/to/apps/mcp-railway/dist/index.js"],
      "env": {
        "RAILWAY_API_TOKEN": "ry_... (user provided)"
      }
    }
  }
}
```

### Allowlist y Límites
-   Por defecto, **no implementar** herramientas de destrucción (`delete_project`, `delete_service`) en la v1 para mitigar riesgos.
-   Antigravity tendrá visibilidad completa de lectura y permisos de despliegue/configuración.

## 8. Runbook Paso a Paso (E2E)

### Fase 1: Preparación
1.  **Obtener Token de Railway**:
    -   Ir a `Railway Dashboard` -> `Account Settings` -> `Tokens`.
    -   Crear un nuevo token con alcance de "Project" (o Team si es necesario).
2.  **Preparar Entorno Local**:
    -   Asegurar Node.js v20+ instalado.
    -   Clonar el repo `NutriFlow`.

### Fase 2: Implementación y Setup del MCP Server
1.  **Crear App**: `pnpm --filter mcp-railway create ...` (o copia manual de estructura básica).
2.  **Instalar Dependencias**: `@modelcontextprotocol/sdk`, `zod`, `axios`/`graphql-request`.
3.  **Compilar**: `pnpm build` en `apps/mcp-railway`.

### Fase 3: Conexión con Antigravity
1.  **Configurar**: Añadir la entrada al archivo de configuración de servidores MCP de Antigravity (usando el path absoluto al build).
2.  **Reiniciar**: Reiniciar el servidor MCP o recargar la configuración en Antigravity.
3.  **Validar**: Pedir a Antigravity "Lista las herramientas disponibles de Railway" y verificar que aparecen.

### Fase 4: Ejecución del Flujo (Backend Deploy)
1.  **Vincular Repo**: Asegurar que en Railway UI el servicio `apps/api` está vinculado al repo GitHub `NutriFlow`.
2.  **Configurar Vars**:
    -   Prompt: "Antigravity, configura las variables de entorno para `apps/api` en Railway Production usando los valores seguros predefinidos (SUPABASE_URL, etc)."
3.  **Desplegar**:
    -   Prompt: "Antigravity, despliega la última versión de `main` en Railway."
4.  **Verificar**:
    -   Prompt: "Antigravity, monitorea el despliegue y avísame cuando esté online y el health check pase."

### Troubleshooting
-   **Error de Autenticación**: Verificar `RAILWAY_API_TOKEN` en la config del MCP (env).
-   **Timeout**: Si Railway tarda mucho, la herramienta `railway_deploy` debe retornar el `deploymentId` inmediatamente y pedir al usuario que consulte el estado después (polling), en lugar de bloquear.
-   **Build Fallido**: Usar `railway_get_deployment_logs` (si se implementa) o consultar UI de Railway.

## 9. Matriz de Seguridad y Riesgos

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| **Fuga de Secretos** | Alto | El servidor MCP nunca debe retornar valores de secretos en texto plano en las respuestas de las herramientas ("read_vars" debe ofuscar valores). Logs depurados. |
| **Deploy Destructivo** | Medio | Restringir herramientas a `upsert` y `deploy`. No `delete`. Requerir confirmación humana para cambios en PROD (vía política de Antigravity `BlockedOnUser`). |
| **Alucinación de Antigravity** | Medio | Validación estricta con Zod en los inputs de las herramientas. Si Antigravity inventa un ID de proyecto, la API de Railway fallará controladamente. |
| **Token en Logs** | Alto | `RAILWAY_API_TOKEN` solo se pasa por ENV, nunca por argumentos de línea de comandos visibles en `ps`. |

## 10. Plan de Pruebas

### Smoke Test
- [ ] Ejecutar `railway_list_projects`. ¿Devuelve JSON válido?
- [ ] Ejecutar `railway_get_services` con un ID inválido. ¿Devuelve error manejado?

### Integration Test
- [ ] Crear un proyecto "Sandbox" en Railway manualmente.
- [ ] Usar Antigravity para inyectar una variable `TEST_VAR=123`.
- [ ] Verificar en consola de Railway que la variable existe.
- [ ] Disparar despliegue y confirmar que se inicia.

## 11. Rollout y Definition of Done (DoD)

### Criterios de Éxito (DoD)
- [ ] Servidor MCP implementado en `apps/mcp-railway`.
- [ ] Compila y corre localmente sin errores.
- [ ] Antigravity reconoce las herramientas.
- [ ] Se ha realizado un despliegue exitoso (o simulación) desde el chat.
- [ ] Documentación en `apps/mcp-railway/README.md`.

## Anexos: Plantillas

### Variables de Entorno Requeridas (MCP Server)
```env
RAILWAY_API_TOKEN=ry_...
# Opcional: ID de proyecto por defecto si se desea acotar
DEFAULT_PROJECT_ID=...
```

### Configuración Monorepo
Se aconseja que el `railway.json` o configuración de deploy ignore `apps/mcp-railway` para no intentar desplegar el servidor MCP en el mismo contenedor que la API (a menos que se desee Opción B en el futuro).

---
**Documento Generado por:** Antigravity Architect  
**Fecha:** 2026-02-13  
**Versión:** 1.0.0
