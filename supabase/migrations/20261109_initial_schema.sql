
-- BriefMeet AI | Phase 2C
-- Initial database schema and RLS policies

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.briefings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null
    check (target_type in ('company', 'person')),
  target_name text not null,
  meeting_date date not null,
  meeting_time time,
  meeting_goal text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.briefing_sources (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null
    references public.briefings(id) on delete cascade,
  title text not null,
  url text not null,
  publisher text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index briefings_user_created_idx
  on public.briefings(user_id, created_at desc);

create index briefing_sources_briefing_idx
  on public.briefing_sources(briefing_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.briefings enable row level security;
alter table public.briefing_sources enable row level security;

-- Profiles: users manage their own profile
create policy "Users read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users create own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

create policy "Users update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Briefings: users manage only their own records
create policy "Users read own briefings"
on public.briefings for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users create own briefings"
on public.briefings for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update own briefings"
on public.briefings for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users delete own briefings"
on public.briefings for delete to authenticated
using ((select auth.uid()) = user_id);

-- Sources: access only through an owned briefing
create policy "Users read own sources"
on public.briefing_sources for select to authenticated
using (
  exists (
    select 1 from public.briefings b
    where b.id = briefing_id
      and b.user_id = (select auth.uid())
  )
);

create policy "Users create own sources"
on public.briefing_sources for insert to authenticated
with check (
  exists (
    select 1 from public.briefings b
    where b.id = briefing_id
      and b.user_id = (select auth.uid())
  )
);

create policy "Users update own sources"
on public.briefing_sources for update to authenticated
using (
  exists (
    select 1 from public.briefings b
    where b.id = briefing_id
      and b.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.briefings b
    where b.id = briefing_id
      and b.user_id = (select auth.uid())
  )
);

create policy "Users delete own sources"
on public.briefing_sources for delete to authenticated
using (
  exists (
    select 1 from public.briefings b
    where b.id = briefing_id
      and b.user_id = (select auth.uid())
  )
);

-- Explicit Data API privileges
revoke all on public.profiles,
  public.briefings,
  public.briefing_sources
from anon;

grant select, insert, update on public.profiles
  to authenticated;

grant select, insert, update, delete on public.briefings
  to authenticated;

grant select, insert, update, delete on public.briefing_sources
  to authenticated;

-- Security correction: remove non-DML privileges granted by default.
revoke truncate, references, trigger
on table
    public.profiles,
    public.briefings,
    public.briefing_sources
from authenticated;
