create table public.exercise_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diet_plan_id uuid not null references public.plans(id) on delete cascade,
  plan_data jsonb not null,
  created_at timestamptz not null default now(),
  unique (diet_plan_id)
);

alter table public.exercise_plans enable row level security;

create policy "own exercise plans" on public.exercise_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
