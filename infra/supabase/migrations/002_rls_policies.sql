-- =============================================
-- NutriFlow MVP - Row Level Security Policies
-- =============================================
-- Run this AFTER 001_initial_schema.sql

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES - Users can only access their own profile
-- =============================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- PROFILE_ALLERGENS - Users can manage their own allergens
-- =============================================

CREATE POLICY "Users can view own allergens"
  ON profile_allergens FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own allergens"
  ON profile_allergens FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own allergens"
  ON profile_allergens FOR DELETE
  USING (auth.uid() = profile_id);

-- =============================================
-- ALLERGENS - Public read, admin write
-- =============================================

CREATE POLICY "Anyone can view allergens"
  ON allergens FOR SELECT
  TO authenticated
  USING (true);

-- Admin-only insert/update handled by service key (bypasses RLS)

-- =============================================
-- INGREDIENTS - Public read, admin write
-- =============================================

CREATE POLICY "Anyone can view ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (true);

-- Admin-only insert/update handled by service key (bypasses RLS)

-- =============================================
-- INGREDIENT_ALLERGENS - Public read
-- =============================================

CREATE POLICY "Anyone can view ingredient allergens"
  ON ingredient_allergens FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- PLANS - Users can only access their own plans
-- =============================================

CREATE POLICY "Users can view own plans"
  ON plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON plans FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- PLAN_MEALS - Users can access meals from their plans
-- =============================================

CREATE POLICY "Users can view own plan meals"
  ON plan_meals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = plan_meals.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own plan meals"
  ON plan_meals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = plan_meals.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own plan meals"
  ON plan_meals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = plan_meals.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own plan meals"
  ON plan_meals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = plan_meals.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

-- =============================================
-- PLAN_MEAL_ITEMS - Users can access items from their meals
-- =============================================

CREATE POLICY "Users can view own meal items"
  ON plan_meal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plan_meals 
      JOIN plans ON plans.id = plan_meals.plan_id
      WHERE plan_meals.id = plan_meal_items.meal_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own meal items"
  ON plan_meal_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plan_meals 
      JOIN plans ON plans.id = plan_meals.plan_id
      WHERE plan_meals.id = plan_meal_items.meal_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own meal items"
  ON plan_meal_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM plan_meals 
      JOIN plans ON plans.id = plan_meals.plan_id
      WHERE plan_meals.id = plan_meal_items.meal_id 
      AND plans.user_id = auth.uid()
    )
  );

-- =============================================
-- SHOPPING_LISTS - Users can access their plan's shopping lists
-- =============================================

CREATE POLICY "Users can view own shopping lists"
  ON shopping_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = shopping_lists.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own shopping lists"
  ON shopping_lists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = shopping_lists.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

-- =============================================
-- SHOPPING_LIST_ITEMS
-- =============================================

CREATE POLICY "Users can view own shopping list items"
  ON shopping_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists 
      JOIN plans ON plans.id = shopping_lists.plan_id
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own shopping list items"
  ON shopping_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists 
      JOIN plans ON plans.id = shopping_lists.plan_id
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
      AND plans.user_id = auth.uid()
    )
  );

-- =============================================
-- WEIGHT_LOGS - Users can only access their own logs
-- =============================================

CREATE POLICY "Users can view own weight logs"
  ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- USER_ROLES - Users can view their own role
-- =============================================

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- Success message
-- =============================================
SELECT 'RLS policies created successfully!' as message;
