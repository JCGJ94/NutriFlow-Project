# Contributing to NutriFlow

> 🇪🇸 **[Leer en Español](./CONTRIBUTING.es.md)**

First off, thanks for taking the time to contribute! 🎉

## 🛠️ Development Workflow

This project uses **pnpm** and **Turborepo**.

1.  **Fork and Clone** the repository.
2.  **Install Dependencies**:
    ```bash
    pnpm install
    ```
3.  **Environment Variables**:
    -   Copy `.env.example` to `.env.local` in `apps/web` and `.env` in `apps/api`.
    -   Populate with your Supabase and Google AI credentials.

4.  **Start Development Server**:
    ```bash
    pnpm dev
    ```

## 🧩 Code Style & Standards

We enforce high standards to keep the codebase clean and scalable.

-   **TypeScript**: Strict mode is enabled. No `any` types unless absolutely necessary (and commented).
-   **Design Pattern**:
    -   **Backend**: Follow SOLID principles. Use Dependency Injection.
    -   **Frontend**: Use Atomic Design for components. Logic should be separated from UI via Custom Hooks.
-   **Commits**: We follow [Conventional Commits](https://www.conventionalcommits.org/).
    -   `feat: add new diet generator algorithm`
    -   `fix: resolve hydration error in navbar`
    -   `docs: update architecture diagram`

## 🧪 Testing

Before submitting a PR, ensure all tests pass.

```bash
pnpm test        # Run Unit Tests
pnpm test:e2e    # Run Playwright E2E Tests
```

## 📦 Pull Request Process

1.  Create a feature branch: `git checkout -b feature/amazing-feature`.
2.  Commit your changes.
3.  Push to the branch.
4.  Open a Pull Request targeting the `main` branch.
5.  Ensure CI checks pass.

---

*Happy Coding!* 🚀
