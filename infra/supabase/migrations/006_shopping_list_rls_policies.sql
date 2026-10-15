-- Restore the row-level security policies for the shopping list.
--
-- shopping_lists and shopping_list_items have RLS enabled but, in the hosted
-- project, no policy at all (drift from 002_rls_policies.sql), so every query
-- made with a user session is denied. Same rules as 002: a user can use the
-- lists and items that belong to their own plans.

CREATE POLICY "Users can manage own shopping lists"
  ON shopping_lists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = shopping_lists.plan_id
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
