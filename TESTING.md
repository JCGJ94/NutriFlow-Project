# NutriFlow Testing Guide

Este proyecto utiliza una estrategia de testing combinada:
- **Unit Testing**: Vitest (Backend)
- **E2E Testing**: Playwright (Frontend + Backend Integration)

## 1. Backend Unit Tests (Vitest)

Pruebas unitarias para la lógica de negocio, especialmente el `DietEngine`.

### Ejecutar tests
```bash
pnpm --filter @nutriflow/api test
```

### Ubicación
- `apps/api/src/**/*.spec.ts`

### Ejemplo (BmrCalculator)
```typescript
it('should calculate BMR correctly', () => {
  const result = calculator.calculateBmr(profile);
  expect(result.bmr).toBe(1780);
});
```

## 2. E2E Tests (Playwright)

Pruebas de extremo a extremo que simulan la interacción del usuario real en el navegador.

### Instalar navegadores (primera vez)
```bash
pnpm exec playwright install
```

### Ejecutar tests (Headless)
IMPORTANT: Asegúrate de que tu app NO esté corriendo en el puerto 3000, Playwright la levantará (o usa `webServer` config).
O si ya la tienes corriendo:
```bash
pnpm exec playwright test
```

### Ejecutar con UI (Recomendado para desarrollo)
```bash
pnpm exec playwright test --ui
```

### Flujos cubiertos
1. **Auth Flow**: Registro e inicio de sesión (`e2e/auth.spec.ts`)
2. **Plan Flow**: Generación de plan semanal (`e2e/plan-generation.spec.ts`)

## 3. Subagente de Testing (Instrucciones)

Para continuar ampliando el testing, sigue este patrón:

1. **Identificar lógica crítica**: Priorizar lógica de negocio compleja (ej. algoritmos) para Unit Tests.
2. **Identificar flujos críticos**: Priorizar flujos de usuario (ej. checkout, settings) para E2E.
3. **Crear archivo**:
   - Unit: `servicename.spec.ts` junto al archivo fuente.
   - E2E: `e2e/feature-name.spec.ts`.

### Próximos Tests Recomendados
- [ ] Unit: `MacrosCalculator` (verificar distribución 30/40/30)
- [ ] Unit: `AllergenRule` (verificar filtrado correcto)
- [ ] E2E: `ShoppingList` (verificar items y checked state)
