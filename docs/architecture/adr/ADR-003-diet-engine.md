# ADR-003: Diet Engine Algorithm Design

**Status:** Accepted  
**Date:** 2026-01-20  
**Decision by:** Development Team

## Context

NutriFlow's core functionality is generating personalized weekly diet plans. We needed an algorithm that:
- Calculates caloric needs based on user profile
- Distributes macronutrients appropriately
- Respects user dietary restrictions (allergens, diet patterns)
- Generates variety across the week

## Decision

Implement a **rule-based ingredient selection algorithm** with the following components:

### Architecture

```
DietEngine
├── Calculators/
│   ├── bmr.calculator.ts      # Mifflin-St Jeor formula
│   └── macros.calculator.ts   # Macro distribution
├── Selectors/
│   └── ingredient.selector.ts # Random weighted selection
└── Rules/
    ├── allergen.rule.ts       # Filter by allergens
    └── diet-pattern.rule.ts   # Filter by diet (vegan, etc.)
```

### Algorithms

1. **BMR (Basal Metabolic Rate)**
   - Male: `10 × weight + 6.25 × height − 5 × age + 5`
   - Female: `10 × weight + 6.25 × height − 5 × age − 161`

2. **TDEE (Total Daily Energy Expenditure)**
   - TDEE = BMR × Activity Multiplier

3. **Target Calories**
   - Weight loss: TDEE - 500 (safe deficit)

4. **Macro Distribution**
   - Protein: 30% (higher for muscle preservation)
   - Carbs: 40%
   - Fat: 30%

## Implementation

```typescript
// DietEngine generates a week plan
generateWeekPlan(profile: UserProfile): WeekPlan {
  const bmr = this.bmrCalculator.calculate(profile);
  const targets = this.macrosCalculator.calculate(bmr);
  
  const safeIngredients = this.rules.filter(
    allIngredients,
    profile.allergens,
    profile.dietPattern
  );
  
  return this.buildWeek(targets, safeIngredients);
}
```

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| AI/ML recommendations | Personalized | Requires training data |
| Recipe-based planning | Better meals | More complex ingredient management |
| External API | Less code | Dependency, cost |

## Consequences

### Positive
- Simple, testable algorithm
- No external dependencies
- Easy to extend with new rules

### Negative
- Meal combinations may not always "taste" well together
- No recipe-level guidance
- Requires manual ingredient database maintenance

## Future Enhancements

- Add food pairing rules for better combinations
- Implement user preference learning
- Add recipe suggestions from ingredient combinations
