-- Stop auto-creating a profile row at signup.
--
-- handle_new_user() inserted (id, username, email) into public.profiles, but
-- age, sex, weight_kg, height_cm and activity_level are NOT NULL without a
-- default, so every new signup failed with a database error.
--
-- The app already expects a user with no profile: login and the dashboard send
-- them to /onboarding, and PUT /api/profile creates the row (insert branch).
-- get_email_by_username reads the email from auth.users, not from profiles.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
