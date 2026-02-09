# Contribuyendo a NutriFlow

> 🇬🇧 **[Read in English](./CONTRIBUTING.md)**

¡Primero que nada, gracias por tomarte el tiempo de contribuir! 🎉

## 🛠️ Flujo de Trabajo de Desarrollo

Este proyecto usa **pnpm** y **Turborepo**.

1.  **Fork y Clonar** el repositorio.
2.  **Instalar Dependencias**:
    ```bash
    pnpm install
    ```
3.  **Variables de Entorno**:
    -   Copia `.env.example` a `.env.local` en `apps/web` y `.env` en `apps/api`.
    -   Rellena con tus credenciales de Supabase y Google AI.

4.  **Iniciar Servidor de Desarrollo**:
    ```bash
    pnpm dev
    ```

## 🧩 Estilo de Código y Estándares

Imponemos altos estándares para mantener la base de código limpia y escalable.

-   **TypeScript**: Modo estricto habilitado. Sin tipos `any` a menos que sea absolutamente necesario (y comentado).
-   **Patrón de Diseño**:
    -   **Backend**: Sigue principios SOLID. Usa Inyección de Dependencias.
    -   **Frontend**: Usa Diseño Atómico para componentes. La lógica debe estar separada de la UI vía Custom Hooks.
-   **Commits**: Seguimos [Conventional Commits](https://www.conventionalcommits.org/).
    -   `feat: add new diet generator algorithm`
    -   `fix: resolve hydration error in navbar`
    -   `docs: update architecture diagram`

## 🧪 Testing

Antes de enviar un PR, asegúrate de que todos los tests pasen.

```bash
pnpm test        # Ejecutar Unit Tests
pnpm test:e2e    # Ejecutar Playwright E2E Tests
```

## 📦 Proceso de Pull Request

1.  Crea una rama de feature: `git checkout -b feature/amazing-feature`.
2.  Haz commit de tus cambios.
3.  Push a la rama.
4.  Abre un Pull Request apuntando a la rama `main`.
5.  Asegúrate de que los checks de CI pasen.

---

*¡Feliz Codificación!* 🚀
