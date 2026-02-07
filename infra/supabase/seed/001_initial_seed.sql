-- =============================================
-- NutriFlow MVP - Seed Data
-- =============================================
-- Run this AFTER schema and RLS migrations

-- =============================================
-- ALLERGENS (14 principales según EU)
-- =============================================

INSERT INTO allergens (name, description) VALUES
  ('gluten', 'Cereales con gluten (trigo, centeno, cebada, avena)'),
  ('crustaceans', 'Crustáceos y productos derivados'),
  ('eggs', 'Huevos y productos derivados'),
  ('fish', 'Pescado y productos derivados'),
  ('peanuts', 'Cacahuetes y productos derivados'),
  ('soybeans', 'Soja y productos derivados'),
  ('milk', 'Leche y derivados (incluida lactosa)'),
  ('nuts', 'Frutos de cáscara (almendras, avellanas, nueces, etc.)'),
  ('celery', 'Apio y productos derivados'),
  ('mustard', 'Mostaza y productos derivados'),
  ('sesame', 'Granos de sésamo y productos derivados'),
  ('sulfites', 'Dióxido de azufre y sulfitos'),
  ('lupin', 'Altramuces y productos derivados'),
  ('molluscs', 'Moluscos y productos derivados')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- INGREDIENTS - Proteínas
-- =============================================

INSERT INTO ingredients (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_vegan, is_vegetarian) VALUES
  -- Carnes
  ('Pechuga de pollo', 'protein', 165, 31, 0, 3.6, 0, false, false),
  ('Pechuga de pavo', 'protein', 135, 30, 0, 1, 0, false, false),
  ('Lomo de cerdo', 'protein', 143, 27, 0, 3.5, 0, false, false),
  ('Ternera magra', 'protein', 150, 26, 0, 5, 0, false, false),
  ('Conejo', 'protein', 136, 21, 0, 5.5, 0, false, false),
  
  -- Pescados
  ('Salmón', 'protein', 208, 20, 0, 13, 0, false, false),
  ('Atún fresco', 'protein', 144, 23, 0, 5, 0, false, false),
  ('Merluza', 'protein', 86, 17, 0, 1.8, 0, false, false),
  ('Bacalao', 'protein', 82, 18, 0, 0.7, 0, false, false),
  ('Lubina', 'protein', 97, 18, 0, 2.5, 0, false, false),
  ('Dorada', 'protein', 100, 20, 0, 2, 0, false, false),
  ('Trucha', 'protein', 119, 20, 0, 3.5, 0, false, false),
  ('Sardinas', 'protein', 208, 25, 0, 11, 0, false, false),
  
  -- Mariscos
  ('Gambas', 'protein', 99, 21, 0, 1.1, 0, false, false),
  ('Mejillones', 'protein', 86, 12, 4, 2, 0, false, false),
  ('Calamares', 'protein', 92, 16, 3, 1.4, 0, false, false),
  
  -- Huevos
  ('Huevo entero', 'protein', 155, 13, 1.1, 11, 0, false, true),
  ('Clara de huevo', 'protein', 52, 11, 0.7, 0.2, 0, false, true),
  
  -- Proteínas vegetales
  ('Tofu firme', 'protein', 144, 15, 3, 8, 1, true, true),
  ('Tempeh', 'protein', 193, 19, 9, 11, 0, true, true),
  ('Seitán', 'protein', 370, 75, 14, 2, 0, true, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- INGREDIENTS - Carbohidratos
-- =============================================

INSERT INTO ingredients (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_vegan, is_vegetarian) VALUES
  ('Arroz blanco cocido', 'carbohydrate', 130, 2.7, 28, 0.3, 0.4, true, true),
  ('Arroz integral cocido', 'carbohydrate', 111, 2.6, 23, 0.9, 1.8, true, true),
  ('Quinoa cocida', 'carbohydrate', 120, 4.4, 21, 1.9, 2.8, true, true),
  ('Pasta cocida', 'carbohydrate', 131, 5, 25, 1.1, 1.8, true, true),
  ('Pasta integral cocida', 'carbohydrate', 124, 5.3, 25, 0.5, 4.5, true, true),
  ('Patata cocida', 'carbohydrate', 87, 2, 20, 0.1, 1.8, true, true),
  ('Boniato cocido', 'carbohydrate', 90, 2, 21, 0.1, 3, true, true),
  ('Pan integral', 'carbohydrate', 247, 13, 41, 3.4, 7, true, true),
  ('Pan blanco', 'carbohydrate', 265, 9, 49, 3.2, 2.7, true, true),
  ('Cuscús cocido', 'carbohydrate', 112, 3.8, 23, 0.2, 1.4, true, true),
  ('Avena cocida', 'carbohydrate', 71, 2.5, 12, 1.5, 1.7, true, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- INGREDIENTS - Verduras
-- =============================================

INSERT INTO ingredients (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_vegan, is_vegetarian) VALUES
  ('Brócoli', 'vegetable', 34, 2.8, 7, 0.4, 2.6, true, true),
  ('Espinacas', 'vegetable', 23, 2.9, 3.6, 0.4, 2.2, true, true),
  ('Calabacín', 'vegetable', 17, 1.2, 3.1, 0.3, 1, true, true),
  ('Zanahoria', 'vegetable', 41, 0.9, 10, 0.2, 2.8, true, true),
  ('Tomate', 'vegetable', 18, 0.9, 3.9, 0.2, 1.2, true, true),
  ('Pimiento rojo', 'vegetable', 31, 1, 6, 0.3, 2.1, true, true),
  ('Pimiento verde', 'vegetable', 20, 0.9, 4.6, 0.2, 1.7, true, true),
  ('Cebolla', 'vegetable', 40, 1.1, 9, 0.1, 1.7, true, true),
  ('Ajo', 'vegetable', 149, 6.4, 33, 0.5, 2.1, true, true),
  ('Champiñones', 'vegetable', 22, 3.1, 3.3, 0.3, 1, true, true),
  ('Berenjena', 'vegetable', 25, 1, 6, 0.2, 3, true, true),
  ('Coliflor', 'vegetable', 25, 1.9, 5, 0.3, 2, true, true),
  ('Judías verdes', 'vegetable', 31, 1.8, 7, 0.2, 2.7, true, true),
  ('Lechuga', 'vegetable', 15, 1.4, 2.9, 0.2, 1.3, true, true),
  ('Pepino', 'vegetable', 16, 0.7, 3.6, 0.1, 0.5, true, true),
  ('Acelgas', 'vegetable', 19, 1.8, 3.7, 0.2, 1.6, true, true),
  ('Col rizada (kale)', 'vegetable', 49, 4.3, 9, 0.9, 3.6, true, true),
  ('Espárragos', 'vegetable', 20, 2.2, 3.9, 0.1, 2.1, true, true),
  ('Alcachofas', 'vegetable', 47, 3.3, 11, 0.2, 5.4, true, true),
  ('Remolacha', 'vegetable', 43, 1.6, 10, 0.2, 2.8, true, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- INGREDIENTS - Frutas
-- =============================================

INSERT INTO ingredients (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_vegan, is_vegetarian) VALUES
  ('Manzana', 'fruit', 52, 0.3, 14, 0.2, 2.4, true, true),
  ('Plátano', 'fruit', 89, 1.1, 23, 0.3, 2.6, true, true),
  ('Naranja', 'fruit', 47, 0.9, 12, 0.1, 2.4, true, true),
  ('Fresas', 'fruit', 32, 0.7, 8, 0.3, 2, true, true),
  ('Arándanos', 'fruit', 57, 0.7, 14, 0.3, 2.4, true, true),
  ('Kiwi', 'fruit', 61, 1.1, 15, 0.5, 3, true, true),
  ('Piña', 'fruit', 50, 0.5, 13, 0.1, 1.4, true, true),
  ('Mango', 'fruit', 60, 0.8, 15, 0.4, 1.6, true, true),
  ('Pera', 'fruit', 57, 0.4, 15, 0.1, 3.1, true, true),
  ('Uvas', 'fruit', 69, 0.7, 18, 0.2, 0.9, true, true),
  ('Sandía', 'fruit', 30, 0.6, 8, 0.2, 0.4, true, true),
  ('Melón', 'fruit', 34, 0.8, 8, 0.2, 0.9, true, true),
  ('Melocotón', 'fruit', 39, 0.9, 10, 0.3, 1.5, true, true),
  ('Cerezas', 'fruit', 63, 1, 16, 0.2, 2.1, true, true),
  ('Papaya', 'fruit', 43, 0.5, 11, 0.3, 1.7, true, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- INGREDIENTS - Lácteos
-- =============================================

INSERT INTO ingredients (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_vegan, is_vegetarian) VALUES
  ('Leche desnatada', 'dairy', 35, 3.4, 5, 0.1, 0, false, true),
  ('Leche semidesnatada', 'dairy', 46, 3.2, 4.8, 1.6, 0, false, true),
  ('Yogur natural', 'dairy', 61, 3.5, 4.7, 3.3, 0, false, true),
  ('Yogur griego 0%', 'dairy', 59, 10, 3.6, 0.7, 0, false, true),
  ('Queso fresco', 'dairy', 172, 12, 3.3, 12, 0, false, true),
  ('Queso cottage', 'dairy', 98, 11, 3.4, 4.3, 0, false, true),
  ('Queso mozzarella', 'dairy', 280, 28, 3.1, 17, 0, false, true),
  ('Requesón', 'dairy', 84, 11, 3, 3, 0, false, true),
  ('Kéfir', 'dairy', 41, 3.3, 4.5, 1, 0, false, true),
  -- Alternativas veganas
  ('Leche de almendras', 'dairy', 24, 0.5, 3, 1.1, 0.5, true, true),
  ('Leche de avena', 'dairy', 47, 1, 8, 1.5, 0.8, true, true),
  ('Leche de soja', 'dairy', 33, 2.8, 1.2, 1.8, 0.4, true, true),
  ('Yogur de soja', 'dairy', 50, 4.5, 2, 2.5, 0.4, true, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- INGREDIENTS - Grasas saludables
-- =============================================

INSERT INTO ingredients (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_vegan, is_vegetarian) VALUES
  ('Aceite de oliva virgen', 'fat', 884, 0, 0, 100, 0, true, true),
  ('Aguacate', 'fat', 160, 2, 9, 15, 7, true, true),
  ('Mantequilla', 'fat', 717, 0.9, 0.1, 81, 0, false, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- INGREDIENTS - Legumbres
-- =============================================

INSERT INTO ingredients (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_vegan, is_vegetarian) VALUES
  ('Garbanzos cocidos', 'legume', 164, 9, 27, 2.6, 8, true, true),
  ('Lentejas cocidas', 'legume', 116, 9, 20, 0.4, 8, true, true),
  ('Judías blancas cocidas', 'legume', 139, 9, 25, 0.5, 7, true, true),
  ('Judías pintas cocidas', 'legume', 143, 9, 27, 0.5, 9, true, true),
  ('Edamame', 'legume', 121, 12, 9, 5, 5, true, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- INGREDIENTS - Granos
-- =============================================

INSERT INTO ingredients (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_vegan, is_vegetarian) VALUES
  ('Copos de avena', 'grain', 379, 13, 68, 7, 10, true, true),
  ('Trigo sarraceno', 'grain', 343, 13, 72, 3.4, 10, true, true),
  ('Mijo', 'grain', 378, 11, 73, 4.2, 8.5, true, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- INGREDIENTS - Frutos secos y semillas
-- =============================================

INSERT INTO ingredients (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_vegan, is_vegetarian) VALUES
  ('Almendras', 'nut_seed', 579, 21, 22, 50, 12, true, true),
  ('Nueces', 'nut_seed', 654, 15, 14, 65, 7, true, true),
  ('Semillas de chía', 'nut_seed', 486, 17, 42, 31, 34, true, true),
  ('Semillas de lino', 'nut_seed', 534, 18, 29, 42, 27, true, true),
  ('Semillas de calabaza', 'nut_seed', 559, 30, 11, 49, 6, true, true),
  ('Semillas de girasol', 'nut_seed', 584, 21, 20, 51, 9, true, true),
  ('Pistachos', 'nut_seed', 560, 20, 28, 45, 10, true, true),
  ('Anacardos', 'nut_seed', 553, 18, 30, 44, 3, true, true),
  ('Avellanas', 'nut_seed', 628, 15, 17, 61, 10, true, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- INGREDIENT_ALLERGENS relationships
-- =============================================

-- Gluten containing ingredients
INSERT INTO ingredient_allergens (ingredient_id, allergen_id)
SELECT i.id, a.id FROM ingredients i, allergens a
WHERE i.name IN ('Pasta cocida', 'Pasta integral cocida', 'Pan integral', 'Pan blanco', 'Cuscús cocido', 'Seitán', 'Copos de avena')
AND a.name = 'gluten'
ON CONFLICT DO NOTHING;

-- Egg containing
INSERT INTO ingredient_allergens (ingredient_id, allergen_id)
SELECT i.id, a.id FROM ingredients i, allergens a
WHERE i.name IN ('Huevo entero', 'Clara de huevo')
AND a.name = 'eggs'
ON CONFLICT DO NOTHING;

-- Fish
INSERT INTO ingredient_allergens (ingredient_id, allergen_id)
SELECT i.id, a.id FROM ingredients i, allergens a
WHERE i.name IN ('Salmón', 'Atún fresco', 'Merluza', 'Bacalao', 'Lubina', 'Dorada', 'Trucha', 'Sardinas')
AND a.name = 'fish'
ON CONFLICT DO NOTHING;

-- Crustaceans
INSERT INTO ingredient_allergens (ingredient_id, allergen_id)
SELECT i.id, a.id FROM ingredients i, allergens a
WHERE i.name IN ('Gambas')
AND a.name = 'crustaceans'
ON CONFLICT DO NOTHING;

-- Molluscs
INSERT INTO ingredient_allergens (ingredient_id, allergen_id)
SELECT i.id, a.id FROM ingredients i, allergens a
WHERE i.name IN ('Mejillones', 'Calamares')
AND a.name = 'molluscs'
ON CONFLICT DO NOTHING;

-- Milk
INSERT INTO ingredient_allergens (ingredient_id, allergen_id)
SELECT i.id, a.id FROM ingredients i, allergens a
WHERE i.name IN ('Leche desnatada', 'Leche semidesnatada', 'Yogur natural', 'Yogur griego 0%', 'Queso fresco', 'Queso cottage', 'Queso mozzarella', 'Requesón', 'Kéfir', 'Mantequilla')
AND a.name = 'milk'
ON CONFLICT DO NOTHING;

-- Soy
INSERT INTO ingredient_allergens (ingredient_id, allergen_id)
SELECT i.id, a.id FROM ingredients i, allergens a
WHERE i.name IN ('Tofu firme', 'Tempeh', 'Leche de soja', 'Yogur de soja', 'Edamame')
AND a.name = 'soybeans'
ON CONFLICT DO NOTHING;

-- Nuts
INSERT INTO ingredient_allergens (ingredient_id, allergen_id)
SELECT i.id, a.id FROM ingredients i, allergens a
WHERE i.name IN ('Almendras', 'Nueces', 'Pistachos', 'Anacardos', 'Avellanas', 'Leche de almendras')
AND a.name = 'nuts'
ON CONFLICT DO NOTHING;

-- Sesame
INSERT INTO ingredient_allergens (ingredient_id, allergen_id)
SELECT i.id, a.id FROM ingredients i, allergens a
WHERE i.name IN ('Semillas de sésamo')
AND a.name = 'sesame'
ON CONFLICT DO NOTHING;

-- =============================================
-- Success message
-- =============================================
SELECT 
  (SELECT COUNT(*) FROM allergens) as allergens_count,
  (SELECT COUNT(*) FROM ingredients) as ingredients_count,
  (SELECT COUNT(*) FROM ingredient_allergens) as allergen_relationships,
  'Seed data loaded successfully!' as message;
