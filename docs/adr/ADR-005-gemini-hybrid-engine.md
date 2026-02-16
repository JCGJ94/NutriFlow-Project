# ADR-005: Gemini AI / Hybrid Diet Engine with MCP

## Status
Accepted

## Context
The core value proposition of NutriFlow is generating personalized nutrition plans that are both scientifically accurate and creatively engaging. Purely deterministic systems lack "soul", while pure AI systems (LLMs) suffer from hallucinations and safety risks regarding medical constraints.

## Decision
We are implementing a **Hybrid Diet Engine** architecture:
1.  **Deterministic Layer (NestJS):** Calculates strict targets (Kcal, Macros, Micronutrients) using Mifflin-St Jeor and WHO standards.
2.  **Creative Layer (Gemini 2.0 Flash):** Processes these strict targets as constraints to generate recipes and meal descriptions.
3.  **Knowledge Base (NotebookLM / MCP):** Acts as a RAG (Retrieval-Augmented Generation) source or "Grounding" layer to ensure recipes align with specific nutritional philosophies or local ingredient availability provided in the project's documentation.

## Consequences
- **Positive:** High reliability (logic is deterministic) combined with high variety (AI-driven recipes).
- **Positive:** Reduced token usage by isolating the AI to content generation rather than calculation.
- **Negative:** Increased complexity in the backend pipeline (requires syncing between calculation services and AI bridges).
