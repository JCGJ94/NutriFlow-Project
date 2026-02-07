-- =============================================
-- NutriFlow MVP - Initial Schema Migration
-- =============================================
-- Run this in your Supabase SQL Editor
-- Project Settings > SQL Editor > New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES (Perfil nutricional)
-- =============================================
-- References auth.users(id) for user identity

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg <= 500),
  height_cm INTEGER NOT NULL CHECK (height_cm > 0 AND height_cm <= 300),
  activity_level TEXT NOT NULL CHECK (activity_level IN (
    'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'
  )),
  meals_per_day INTEGER NOT NULL DEFAULT 3 CHECK (meals_per_day >= 2 AND meals_per_day <= 6),
  diet_pattern TEXT NOT NULL DEFAULT 'omnivore' CHECK (diet_pattern IN (
    'omnivore', 'vegetarian', 'vegan', 'pescatarian'
  )),
  weight_goal_kg DECIMAL(5,2) CHECK (weight_goal_kg IS NULL OR (weight_goal_kg > 0 AND weight_goal_kg <= 500)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. ALLERGENS (Catálogo de alérgenos)
-- =============================================

CREATE TABLE IF NOT EXISTS allergens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 3. PROFILE_ALLERGENS (Restricciones por usuario)
-- =============================================

CREATE TABLE IF NOT EXISTS profile_allergens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  allergen_id UUID NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, allergen_id)
);

-- =============================================
-- 4. INGREDIENTS (Ingredientes base con macros)
-- =============================================

CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'protein', 'carbohydrate', 'vegetable', 'fruit', 'dairy', 
    'fat', 'legume', 'grain', 'nut_seed', 'condiment'
  )),
  kcal_per_100g DECIMAL(6,2) NOT NULL CHECK (kcal_per_100g >= 0),
  protein_per_100g DECIMAL(5,2) NOT NULL CHECK (protein_per_100g >= 0),
  carbs_per_100g DECIMAL(5,2) NOT NULL CHECK (carbs_per_100g >= 0),
  fat_per_100g DECIMAL(5,2) NOT NULL CHECK (fat_per_100g >= 0),
  fiber_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (fiber_per_100g >= 0),
  is_vegan BOOLEAN NOT NULL DEFAULT false,
  is_vegetarian BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for filtering
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_vegan ON ingredients(is_vegan) WHERE is_vegan = true;
CREATE INDEX idx_ingredients_vegetarian ON ingredients(is_vegetarian) WHERE is_vegetarian = true;

-- =============================================
-- 5. INGREDIENT_ALLERGENS (Relación ingrediente-alérgeno)
-- =============================================

CREATE TABLE IF NOT EXISTS ingredient_allergens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  allergen_id UUID NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  UNIQUE(ingredient_id, allergen_id)
);

-- =============================================
-- 6. PLANS (Plan semanal)
-- =============================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  target_kcal INTEGER NOT NULL CHECK (target_kcal > 0),
  target_protein DECIMAL(5,2) NOT NULL,
  target_carbs DECIMAL(5,2) NOT NULL,
  target_fat DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user queries
CREATE INDEX idx_plans_user ON plans(user_id);
CREATE INDEX idx_plans_status ON plans(user_id, status);

-- =============================================
-- 7. PLAN_MEALS (Comidas por día)
-- =============================================

CREATE TABLE IF NOT EXISTS plan_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Monday
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  is_locked BOOLEAN NOT NULL DEFAULT false,
  total_kcal INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for plan queries
CREATE INDEX idx_plan_meals_plan ON plan_meals(plan_id);

-- =============================================
-- 8. PLAN_MEAL_ITEMS (Ingredientes por comida)
-- =============================================

CREATE TABLE IF NOT EXISTS plan_meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID NOT NULL REFERENCES plan_meals(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  grams DECIMAL(6,2) NOT NULL CHECK (grams > 0),
  kcal DECIMAL(6,2) NOT NULL,
  protein DECIMAL(5,2) NOT NULL,
  carbs DECIMAL(5,2) NOT NULL,
  fat DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for meal queries
CREATE INDEX idx_plan_meal_items_meal ON plan_meal_items(meal_id);

-- =============================================
-- 9. SHOPPING_LISTS (Lista de compra - opcional, puede ser calculada)
-- =============================================

CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE UNIQUE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  total_grams DECIMAL(8,2) NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT false
);

-- =============================================
-- 10. WEIGHT_LOGS (Registro de peso - opcional MVP)
-- =============================================

CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg > 0),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weight_logs_user ON weight_logs(user_id, logged_at DESC);

-- =============================================
-- 11. USER_ROLES (Roles de usuario)
-- =============================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile shell on user signup (optional)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- Success message
-- =============================================
SELECT 'Schema created successfully!' as message;
