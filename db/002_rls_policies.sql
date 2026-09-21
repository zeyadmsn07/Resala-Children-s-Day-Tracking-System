-- ========================================================================
-- 002_rls_policies.sql
-- Resala Children's Day Tracking System: Row Level Security Policies
-- Run as single transaction in Supabase SQL Editor
-- ========================================================================

begin;

-- Helper function to read caller role
create or replace function public.current_staff_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_staff_role() from public, anon;
grant execute on function public.current_staff_role() to authenticated;

-- Enable RLS on all tables
alter table public.staff_directory enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.student_modules enable row level security;
alter table public.student_days enable row level security;
alter table public.module_days enable row level security;
alter table public.session_slots enable row level security;
alter table public.modules enable row level security;

-- 1. staff_directory
drop policy if exists staff_directory_select on public.staff_directory;
create policy staff_directory_select on public.staff_directory
for select to authenticated
using (public.current_staff_role() in ('director', 'head'));

drop policy if exists staff_directory_insert on public.staff_directory;
create policy staff_directory_insert on public.staff_directory
for insert to authenticated
with check (
  (public.current_staff_role() = 'director' and role in ('head', 'member'))
  or (public.current_staff_role() = 'head' and role = 'member')
);

-- 2. profiles: users can update only their own full_name and bio
revoke update on public.profiles from authenticated;
grant update (full_name, bio) on public.profiles to authenticated;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

-- 3. students: all staff can read and modify
drop policy if exists students_all_staff on public.students;
create policy students_all_staff on public.students
for all to authenticated
using (public.current_staff_role() is not null)
with check (public.current_staff_role() is not null);

-- 4. sessions: all staff can read and modify
drop policy if exists sessions_all_staff on public.sessions;
create policy sessions_all_staff on public.sessions
for all to authenticated
using (public.current_staff_role() is not null)
with check (public.current_staff_role() is not null);

-- 5. classes: read by staff, modified by director
drop policy if exists classes_select on public.classes;
create policy classes_select on public.classes
for select to authenticated
using (public.current_staff_role() is not null);

drop policy if exists classes_director on public.classes;
create policy classes_director on public.classes
for all to authenticated
using (public.current_staff_role() = 'director')
with check (public.current_staff_role() = 'director');

-- 6. student_days & student_modules
drop policy if exists student_days_staff on public.student_days;
create policy student_days_staff on public.student_days
for all to authenticated
using (public.current_staff_role() is not null)
with check (public.current_staff_role() is not null);

drop policy if exists student_modules_staff on public.student_modules;
create policy student_modules_staff on public.student_modules
for all to authenticated
using (public.current_staff_role() is not null)
with check (public.current_staff_role() is not null);

-- 7. session_slots, modules, module_days (read by all staff)
drop policy if exists session_slots_select on public.session_slots;
create policy session_slots_select on public.session_slots
for select to authenticated
using (public.current_staff_role() is not null);

drop policy if exists modules_select on public.modules;
create policy modules_select on public.modules
for select to authenticated
using (public.current_staff_role() is not null);

drop policy if exists module_days_select on public.module_days;
create policy module_days_select on public.module_days
for select to authenticated
using (public.current_staff_role() is not null);

commit;
