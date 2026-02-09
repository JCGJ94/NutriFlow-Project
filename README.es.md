# 🍎 NutriFlow: Nutrición Personalizada e Inteligente

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-e0234e?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.0-Flash-4285F4?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)

> 🇬🇧 **[Read in English](./README.md)**

> **NutriFlow** es una aplicación full-stack de nivel de producción que redefine la nutrición personal. Al combinar **algoritmos deterministas** para la precisión calórica con **IA Generativa** para la creatividad culinaria, ofrece planes alimenticios científicamente precisos pero flexibles.

---

## 🎯 ¿Por qué este proyecto?

La mayoría de las apps de nutrición son simples contadores de calorías (aburridas) o totalmente generadas por IA (propensas a alucinaciones). **NutriFlow** cierra esta brecha con un **Motor de Dietas Híbrido**:

1.  **Precisión**: Modelos matemáticos (Mifflin-St Jeor) aseguran objetivos de macros exactos.
2.  **Creatividad**: Google Gemini 2.0 Flash genera recetas diversas y apetitosas que se adhieren estrictamente a esos números.
3.  **Contexto**: El **Model Context Protocol (MCP)** integra ciencia nutricional fundamentada vía NotebookLM, evitando la "deriva de la IA".

---

## 📸 Experiencia

| Vista Dashboard | Vista Plan Móvil |
| :---: | :---: |
| ![Dashboard Placeholder](https://placehold.co/600x400/1e293b/FFF?text=Dashboard+UI) | ![Mobile Placeholder](https://placehold.co/300x600/1e293b/FFF?text=Mobile+UI) |
> *UI premium y responsiva construida con Tailwind CSS y Shadcn.*

---

## 🏗️ Arquitectura y Stack Tecnológico

Este proyecto es un **Monorepo** gestionado por [Turborepo](https://turbo.build/), diseñado para escalabilidad y experiencia de desarrollo.

| Capa | Tecnología | Destacados |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) | App Router, Server Components, TypeScript Strict Mode. |
| **Backend** | [NestJS 11](https://nestjs.com/) | Arquitectura Limpia Modular, Validación DTO, Inyección de Dependencias. |
| **Base de Datos** | [Supabase](https://supabase.com/) | PostgreSQL, Row Level Security (RLS), Suscripciones en tiempo real. |
| **Núcleo IA** | [Gemini 2.0](https://deepmind.google/) | Motor Generativo Híbrido, Salida JSON Estructurada. |
| **Testing** | [Vitest](https://vitest.dev/) + Playwright | Unit Tests para lógica, E2E para flujos de usuario críticos. |

👉 **[Lee la Guía Completa de Arquitectura](./ARCHITECTURE.es.md)** para profundizar en el diseño del sistema, diagramas y flujo de datos.

---

## ✨ Características Clave

-   **🥗 Motor de Dieta Inteligente**: Genera planes de 7 días respetando BMR, TDEE, alergias y preferencias dietéticas (Vegano, Keto, etc.).
-   **🛍️ Lista de Compra Inteligente**: Agrega ingredientes de los planes semanales en una lista consolidada.
-   **🔐 Seguridad Empresarial**: Implementación completa de políticas RLS localizadas—los usuarios *nunca* pueden acceder a datos que no poseen.
-   **⚡ Capacidad de Respuesta en Tiempo Real**: Actualizaciones de UI optimistas y streaming desde el servidor para feedback instantáneo.

---

## 🚀 Empezando

### Prerrequisitos
-   Node.js 20+
-   pnpm 9+
-   Un Proyecto en Supabase
-   Componentes: google-cloud-sdk (para funcionalidades de IA)

### Instalación

1.  **Clonar el Repo**:
    ```bash
    git clone https://github.com/JCGJ94/NutriFlow-Project.git
    cd nutriflow
    pnpm install
    ```

2.  **Configurar Entorno**:
    -   Duplica `.env.example` a `.env.local` (Frontend) y `.env` (Backend).
    -   Añade tu URL de Supabase, Anon Key y API Key de Gemini.

3.  **Ejecutar Servidor de Desarrollo**:
    ```bash
    pnpm dev
    ```
    -   **Frontend**: [http://localhost:3000](http://localhost:3000)
    -   **Backend**: [http://localhost:3001](http://localhost:3001)

---

## 🤝 Contribuyendo

¡Damos la bienvenida a las contribuciones! Por favor revisa nuestras **[Guías de Contribución](./CONTRIBUTING.es.md)** para estilo de código, proceso de PR y requisitos de testing.

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.
