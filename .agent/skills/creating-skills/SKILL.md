---
name: creating-skills
description: Generates high-quality, predictable, and efficient .agent/skills/ directories for expanding agent capabilities. Use this skill when requested to create a new skill or when defining specialized agent instructions.
---

# Creador de Skills de Antigravity

Este skill permite la creación estandarizada de capacidades para agentes Antigravity, asegurando que cada nueva funcionalidad siga los principios de integridad y mantenibilidad.

## Cuándo usar este skill

- Cuando se necesite automatizar una nueva tarea compleja.
- Cuando el usuario pida "crear un nuevo skill".
- Para estandarizar instrucciones de herramientas o flujos de trabajo específicos.

## Flujo de trabajo

1.  [ ] **Definir el propósito**: Identificar qué problema resuelve el skill.
2.  [ ] **Estructura base**: Crear la carpeta en `.agent/skills/name-en-gerundio/`.
3.  [ ] **YAML Frontmatter**: Configurar `name` y `description` (3ª persona).
4.  [ ] **Contenido de SKILL.md**: Seguir los principios de concisión y divulgación progresiva.
5.  [ ] **Validación**: Asegurar que las rutas usan `/` y los comandos son seguros.

## Instrucciones

### 1. Requisitos estructurales principales
Cada skill debe seguir esta jerarquía:
- `<skill-name>/`
  - `SKILL.md` (Obligatorio)
  - `scripts/` (Opcional)
  - `examples/` (Opcional)
  - `resources/` (Opcional)

### 2. Estándares de frontmatter YAML
- **name**: Gerundio (p. ej. `developing-features`). Máx 64 caracteres.
- **description**: 3ª persona. Incluir disparadores. Máx 1024 caracteres.

### 3. Principios de escritura
- **Concisión**: No explicar conceptos básicos.
- **Divulgación progresiva**: SKILL.md < 500 líneas. Usar archivos secundarios para detalles.
- **Rutas**: Siempre usar `/`.

## Recursos

- [Ver documentación de Antigravity](../../docs/architecture/)
