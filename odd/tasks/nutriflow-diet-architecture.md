# NutriFlow diet architecture (Spain/Canarias products + open-source RAG)
Branch: feat/nextjs-full-stack-migration. Delivery: ask-on-risk. Test runner: vitest.
Status: planning. No implementation authorized yet; each task needs the user's go-ahead.

## Specs
- S1. "quiero un dasboardh unico e intuitivo, te doy libertad de creacion toma las ideas con mejor puntuaje y acorde con la nueva aplicacion que estamos creado" (tracked separately in `nutriflow-redesign.md`, R4).
- S2. "quiero fuentes informacion reales para este rac" ... "esto es la fuente de info". Decision 2026-10-19: use OPEN sources, not commercial books. User: "vamso con es base de fuentes abiertas, bases recomendadas y las officiales a ser posible, datos contrastados".
- S3. "un sitema capaz de la entrada imput o datos que ledejemos al cliente para que rellene seamos capaces de crear una nuticion a medida para el cliente".
- S4. "un LLM nueva generacion y con coste eficiencia recomendado" (provider: OpenRouter over plain HTTP, no Vercel AI SDK; model pending a live schema test, a paid remote call that needs explicit authorization).
- S5. "que los alimentos para hacer esta dieta esten ralacionados con mercados y productos que se vende en espaaa-canarias" (Mercadona, Aldi, Lidl, Hiperdino for Canarias).
- A1 (assumption): the deterministic engine owns kcal and macros; the LLM only selects and arranges foods under a strict JSON schema, with validation and a fallback to the deterministic plan.
- A2 (assumption): no legal source was found for retailer prices (Mercadona, Lidl, Aldi) and nothing at all for Hiperdino. Do not promise prices or per-store availability.

## Tasks
| ID | Specs | Route | Status |
| - | - | - | - |
| D1 | S2 | delegated (researcher) | Verify licence and reuse terms of each candidate open source (ISSN, ACSM, EFSA, AESAN, WHO, BEDCA, FEN, Spanish dietary guidelines) |
| D2 | S5, A2 | delegated (researcher) | Verify Open Food Facts Spain coverage by store brand and Canarias, plus ODbL obligations |
| D3 | S3 | inline | Profile input model: extend onboarding fields (goal, training days, preferences, budget, allergens) |
| D4 | S2 | inline | RAG ingestion into `knowledge_docs` (pgvector) with chunk IDs, licence and source metadata |
| D5 | S5 | inline | Product catalogue from Open Food Facts filtered to Spain |
| D6 | S4, A1 | inline | LLM selector with strict schema, validation, deterministic fallback; blocked on live test authorization |

## Log
- L1 (2026-10-19, user): "ademas ya podesmos ir rediseñado como se va a crear estas dietas, quiero fuentes informacion reales para este rac, quiero que obtenga libros de nustricion y culturismo, bajar de peso tonificacion etc, esto es la fuente de info ... quiero que los alimentos para hacer esta dieta esten ralacionados con mercados y productos que se vende en espaaña-para esto consultar en internet apis de mercados como mercadonas, aldi, lidl, y en caso de canarias tambien hyperdios"
- L2 (2026-10-19, user): "si vamso con es base de fuentes abiertas, bases recomendadas y las officiales a ser posible, datos contrastados"
- L3: research found no official API for any of the four chains; unofficial Mercadona endpoints exist but the legal terms were not verified; Open Food Facts is ODbL (share-alike on derived databases); BEDCA has no open licence; OpenStax forbids AI ingestion; no cheap model has confirmed strict json_schema support.
- L4 (2026-10-19, research D1/D2, partial): AESAN portal terms allow commercial reuse with source citation (no named licence); WHO main publications are CC BY-NC-SA 3.0 IGO (commercial use needs permission); EFSA allows reuse with acknowledgement (commercial not addressed); ACSM is "All Rights Reserved"; BEDCA has no terms; ISSN licence text not read (gap). Open Food Facts: ODbL/DbCL/CC BY-SA, attribution required, 10-15 req/min/IP, bulk dumps available; Spain count, store/brand filters and Canarias tags unverified (server 503). Facts such as "1.6 g/kg protein" are not copyrightable: option to store our own distilled rule cards that cite the source instead of copying their text.
- L5 (2026-10-19, user): "si" to storing our own distilled rule cards (facts in our words, each citing document, page and year) instead of copying source text. D4 becomes: knowledge cards table with source citation, evidence level and review date; ingest only cards.
