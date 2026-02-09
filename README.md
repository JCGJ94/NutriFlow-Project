# 🍎 NutriFlow: Intelligent Personalized Nutrition

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-e0234e?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.0-Flash-4285F4?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)

> **NutriFlow** is a production-grade, full-stack application that redefines personal nutrition. By combining **deterministic algorithms** for caloric precision with **Generative AI** for culinary creativity, it delivers scientifically accurate yet flexible meal plans.

---

## 🎯 Why This Project?

Most nutrition apps are either simple calorie counters (boring) or fully AI-generated (prone to hallucination). **NutriFlow** bridges this gap with a **Hybrid Diet Engine**:

1.  **Precision**: Mathematical models (Mifflin-St Jeor) ensure exact macro targets.
2.  **Creativity**: Google Gemini 2.0 Flash generates diverse, appetizing recipes that strictly adhere to those numbers.
3.  **Context**: The **Model Context Protocol (MCP)** integrates grounded nutritional science via NotebookLM, preventing "AI drift."

---

## 📸 Experience

| Dashboard View | Mobile Plan View |
| :---: | :---: |
| ![Dashboard Placeholder](https://placehold.co/600x400/1e293b/FFF?text=Dashboard+UI) | ![Mobile Placeholder](https://placehold.co/300x600/1e293b/FFF?text=Mobile+UI) |
> *Premium, responsive UI built with Tailwind CSS and Shadcn.*

---

## 🏗️ Architecture & Tech Stack

This project is a **Monorepo** managed by [Turborepo](https://turbo.build/), designed for scale and developer experience.

| Layer | Technology | Highlights |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) | App Router, Server Components, TypeScript Strict Mode. |
| **Backend** | [NestJS 11](https://nestjs.com/) | Modular Clean Architecture, DTO Validation, Dependency Injection. |
| **Database** | [Supabase](https://supabase.com/) | PostgreSQL, Row Level Security (RLS), Real-time subscriptions. |
| **AI Core** | [Gemini 2.0](https://deepmind.google/) | Hybrid Generative Engine, Structured JSON Output. |
| **Testing** | [Vitest](https://vitest.dev/) + Playwright | Unit Tests for logic, E2E for critical user flows. |

👉 **[Read the Full Architecture Guide](./ARCHITECTURE.md)** for a deep dive into the system design, diagrams, and data flow.

---

## ✨ Key Features

-   **🥗 Intelligent Diet Engine**: Generates 7-day plans respecting BMR, TDEE, allergies, and dietary preferences (Vegan, Keto, etc.).
-   **🛍️ Smart Shopping List**: Aggregates ingredients from weekly plans into a consolidated checklist.
-   **🔐 Enterprise-Grade Security**: Full implementation of localized RLS policies—users can *never* access data they don't own.
-   **⚡ Real-Time Responsiveness**: Optimistic UI updates and server-side streaming for instant feedback.

---

## 🚀 Getting Started

### Prerequisites
-   Node.js 20+
-   pnpm 9+
-   A Supabase Project
-   Components: google-cloud-sdk (for AI features)

### Installation

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/JCGJ94/NutriFlow-Project.git
    cd nutriflow
    pnpm install
    ```

2.  **Configure Environment**:
    -   Duplicate `.env.example` to `.env.local` (Frontend) and `.env` (Backend).
    -   Add your Supabase URL, Anon Key, and Gemini API Key.

3.  **Run Development Server**:
    ```bash
    pnpm dev
    ```
    -   **Frontend**: [http://localhost:3000](http://localhost:3000)
    -   **Backend**: [http://localhost:3001](http://localhost:3001)

---

## 🤝 Contributing

We welcome contributions! Please check out our **[Contributing Guidelines](./CONTRIBUTING.md)** for code style, PR process, and testing requirements.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
