-- Tag the seeded ingredients with the EU allergens they contain.
--
-- ingredient_allergens was empty, so the allergen filter of the diet engine had
-- nothing to filter on and every plan could contain any ingredient.
--
-- Rules followed:
--   * Only the allergen the plain ingredient contains (EU Regulation 1169/2011,
--     Annex II). Generic names such as "Pan blanco" or "Pasta cocida" are
--     tagged for what their standard recipe contains.
--   * Oats are tagged as gluten (cereal listed in Annex II).
--   * Cross-contamination ("may contain") and processed variants are NOT
--     modelled: the catalog stores generic foods, not branded products.
--   * Nothing is tagged for sesame, lupin, mustard, celery, peanuts or sulfites:
--     no seeded ingredient is such an allergen by itself. Revisit when the
--     Spanish product catalog is loaded.
--
-- Matches by name, so it does not depend on generated ids. Idempotent.

WITH tags (ingredient, allergen) AS (
  VALUES
    -- gluten
    ('Avena cocida', 'gluten'),
    ('Cuscús cocido', 'gluten'),
    ('Pan blanco', 'gluten'),
    ('Pan integral', 'gluten'),
    ('Pasta cocida', 'gluten'),
    ('Pasta integral cocida', 'gluten'),
    ('Seitán', 'gluten'),
    -- milk
    ('Leche desnatada', 'milk'),
    ('Leche semidesnatada', 'milk'),
    ('Mozzarella light', 'milk'),
    ('Queso cottage', 'milk'),
    ('Queso feta', 'milk'),
    ('Queso fresco batido 0%', 'milk'),
    ('Requesón', 'milk'),
    ('Yogur griego 0%', 'milk'),
    ('Yogur natural desnatado', 'milk'),
    -- eggs
    ('Clara de huevo', 'eggs'),
    ('Huevo entero', 'eggs'),
    -- fish
    ('Atún fresco', 'fish'),
    ('Bacalao', 'fish'),
    ('Dorada', 'fish'),
    ('Lubina', 'fish'),
    ('Merluza', 'fish'),
    ('Salmón', 'fish'),
    ('Sardinas', 'fish'),
    ('Trucha', 'fish'),
    -- crustaceans
    ('Gambas', 'crustaceans'),
    -- molluscs
    ('Calamares', 'molluscs'),
    ('Mejillones', 'molluscs'),
    -- soybeans
    ('Edamame', 'soybeans'),
    ('Tempeh', 'soybeans'),
    ('Tofu firme', 'soybeans'),
    -- tree nuts
    ('Almendras naturales', 'nuts'),
    ('Nueces', 'nuts')
)
INSERT INTO ingredient_allergens (ingredient_id, allergen_id)
SELECT i.id, a.id
FROM tags t
JOIN ingredients i ON i.name = t.ingredient
JOIN allergens a ON a.name = t.allergen
ON CONFLICT (ingredient_id, allergen_id) DO NOTHING;
