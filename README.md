# 🍎 NutriFlow - Intelligent Nutrition Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-e0234e?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38b2ac?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?style=for-the-badge&logo=turborepo)](https://turbo.build/)

> **NutriFlow** is a cutting-edge, full-stack web application designed to revolutionize personal nutrition. It leverages advanced algorithms and AI to generate personalized weekly diet plans, managing everything from macro-nutrient distribution to automated shopping lists.

## 🏗️ Architecture & Design Philosophy

This project is built with a **Monorepo** architecture using Turborepo, ensuring high performance, scalability, and code sharing between the frontend and backend. 

We strictly follow **Software Engineering Best Practices**:
- **SOLID Principles**: Adhered to in both backend services and frontend components.
- **Atomic Design**: UI components are organized atomically (Atoms, Molecules, Organisms) for maximum reusability.
- **Type Safety**: End-to-end type safety with TypeScript and shared DTOs.
- **Clean Architecture**: Separation of concerns with distinct layers for logic, data, and presentation.

## 🚀 Tech Stack

### Frontend (`apps/web`)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Shadcn/UI (Premium customized)
- **State Management**: React Context + Hooks
- **Testing**: Vitest + Playwright (E2E)

### Backend (`apps/api`)
- **Framework**: NestJS 11
- **Language**: TypeScript
- **AI Integration**: Google Gemini / Vertex AI
- **Validation**: Class-validator + Zod

### Data & Infrastructure
- **Database**: PostgreSQL (managed by Supabase)
- **Auth**: Supabase Auth (JWT + RLS)
- **ORM/Query**: Supabase JS Client (Type-safe)

## 📂 Project Structure

```bash
nutriflow/
├── apps/
│   ├── api/          # 🧠 Backend logic (NestJS)
│   └── web/          # 🎨 Frontend Interface (Next.js)
├── packages/
│   └── shared/       # 📦 Shared Types, DTOs, and Utilities
├── infra/
│   └── supabase/     # 🗄️ SQL Migrations & Seeds
└── docs/             # 📚 Documentation & Architecture Records
```

## ✨ Key Features

- **🥗 AI-Powered Diet Engine**: Generates meal plans based on BMR, activity level, and goals.
- **🛍️ Smart Shopping List**: Automatically aggregates ingredients from your weekly plan.
- **👤 User Profiling**: Detailed inputs for height, weight, allergies, and dietary preferences.
- **🔐 Secure Authentication**: Robust RLS policies ensuring user data privacy.
- **📱 Responsive Design**: Mobile-first approach for nutrition on the go.

## 🏁 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JCGJ94/NutriFlow-Project.git
   cd nutriflow
   pnpm install
   ```

2. **Environment Setup**
   Duplicate `.env.example` to `.env.local` and fill in your Supabase credentials.
   ```bash
   cp .env.example .env.local
   ```

### Running the App

The project uses Turbo to run scripts in parallel.

```bash
# Start both Frontend and Backend in development mode
pnpm dev

# Run only Frontend
pnpm --filter @nutriflow/web dev

# Run only Backend
pnpm --filter @nutriflow/api dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:3001](http://localhost:3001)

## 🤝 Contributing

Contributions are welcome! Please stick to the established code style and commit message conventions.

## 📄 License

This project is licensed under the **MIT License**.
