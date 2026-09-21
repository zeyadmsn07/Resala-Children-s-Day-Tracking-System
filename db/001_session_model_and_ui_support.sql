-- ========================================================================
-- 001_session_model_and_ui_support.sql
-- Resala Children's Day Tracking System: Session Model & UI Support
-- Run as single transaction in Supabase SQL Editor
-- ========================================================================

begin;

-- 1. Student sequence and code
create sequence if not exists student_code_seq;

alter table public.students
  add column if not exists student_code text unique
    default ('S-' || lpad(nextval('student_code_seq')::text, 4, '0')),
  add column if not exists created_at timestamptz not null default now();

-- Backfill any existing student codes
update public.students
set student_code = 'S-' || lpad(nextval('student_code_seq')::text, 4, '0')
where student_code is null;

-- 2. Profiles extra columns
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists bio text check (length(bio) <= 200),
  add column if not exists created_at timestamptz not null default now();

-- 3. Staff directory constraints
alter table public.staff_directory
  alter column email set not null,
  add column if not exists created_at timestamptz not null default now();

-- Ensure email is stored lowercased
update public.staff_directory set email = lower(email);

-- 4. Session slots table (Section 8.2)
create table if not exists public.session_slots (
  session_number int primary key check (session_number between 1 and 4),
  track text not null check (track in ('English', 'Project')),
  title text
);

insert into public.session_slots (session_number, track, title) values
  (1, 'English', 'English Class'),
  (2, 'Project', 'Skills Class'),
  (3, 'Project', 'Skills Class'),
  (4, 'Project', 'Fun Day')
on conflict (session_number) do update
set track = excluded.track, title = excluded.title;

-- 5. Module calendar days
create table if not exists public.module_days (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  day_number int not null check (day_number between 1 and 4),
  session_date date not null,
  unique (module_id, day_number)
);

-- 6. Student days (one record per child per Saturday for assignment)
create table if not exists public.student_days (
  student_id uuid not null references public.students(id) on delete cascade,
  module_id  uuid not null references public.modules(id)  on delete cascade,
  day_number int  not null check (day_number between 1 and 4),
  daily_assignment_score int check (daily_assignment_score between 0 and 100),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (student_id, module_id, day_number)
);

-- 7. Sessions table adjustments
alter table public.sessions
  alter column attendance_status drop not null,
  alter column attentiveness_percentage drop not null,
  add column if not exists positive_points int not null default 0,
  add column if not exists negative_points int not null default 0,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid default auth.uid(),
  add column if not exists fun_day_followed_instructions boolean,
  add column if not exists fun_day_played_well_with_others boolean,
  add column if not exists fun_day_stayed_engaged boolean;

-- Unique constraint for autosave upserts
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sessions_unique_key'
  ) then
    alter table public.sessions
      add constraint sessions_unique_key
      unique (student_id, module_id, day_number, session_number);
  end if;
end $$;

-- 8. Views
create or replace view public.class_overview with (security_invoker = true) as
select c.id, c.name, c.track,
       (select count(*) from public.students s
         where (c.track = 'English' and s.english_class_id = c.id)
            or (c.track = 'Project' and s.project_class_id = c.id)) as student_count
from public.classes c;

create or replace view public.team_overview with (security_invoker = true) as
select sd.email, sd.role, sd.created_at,
       adder.full_name as added_by_name,
       (p.id is not null) as signed_up
from public.staff_directory sd
left join public.profiles p     on lower(p.email) = lower(sd.email)
left join public.profiles adder on adder.id = sd.added_by;

-- 9. Keepalive function for cron
create or replace function public.keepalive()
returns int language sql security definer as $$
  select 1;
$$;
grant execute on function public.keepalive() to anon, authenticated;

commit;
