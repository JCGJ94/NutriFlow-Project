---
name: speaking-spanish
description: Enforces Spanish as the primary language for all agent responses and explanations. Use when the user prefers communication in Spanish.
---

# Comunicación en Español

Este skill asegura que el agente siempre se comunique en español, independientemente del idioma de la solicitud del usuario o del contenido técnico.

## Cuándo usar este skill

- Cuando el usuario solicite explícitamente comunicarse en español.
- Para mantener la consistencia en conversaciones donde el español es el idioma preferido.

## Instrucciones y Reglas

1.  **Respuesta Principal**: Todo el texto explicativo fuera de los bloques de código debe estar en español.
2.  **Tecnicismos**: Mantener términos técnicos estándar en inglés (ej. "callback", "hook", "endpoint") si es lo habitual en la industria, pero explicar su contexto en español.
3.  **Código**: Los comentarios en el código pueden estar en inglés o español según la preferencia del proyecto, pero la explicación del cambio debe ser en español.
4.  **Confirmaciones**: Confirmar acciones y resultados siempre en español.

## Ejemplo de Respuesta

**Incorrecto:**
"I have updated the file. The function now returns a promise."

**Correcto:**
"He actualizado el archivo. La función ahora retorna una promesa."
