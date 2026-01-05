# FC26 Transfer Tracker (local, no-build web app)

## Supabase version (this build)

This version stores career saves + players in **Supabase Postgres**, using **anonymous sign-ins** (no email/password needed).
Each browser gets its own anonymous user session; your data is private to that user via Row Level Security.

### 1) Supabase project settings

1. In Supabase Dashboard → **Authentication → Providers**
   - Enable **Anonymous sign-ins**.

2. In Supabase Dashboard → **SQL Editor** → run the SQL below.

### 2) Create tables + policies (SQL)

```sql
-- Enable UUID generation helpers
create extension if not exists pgcrypto;

-- Career saves
create table if not exists public.saves (
  id uuid primary key,
  user_id uuid not null default auth.uid(),
  name text not null default 'Untitled',
  created_at timestamptz not null default now()
);

-- Players within a save
create table if not exists public.players (
  id uuid primary key,
  user_id uuid not null default auth.uid(),
  save_id uuid not null references public.saves(id) on delete cascade,
  forename text not null default '',
  surname text not null default '',
  seniority text not null default 'Senior',
  position text not null default 'CM',
  ovr int not null default 50,
  pot_min int not null default 50,
  pot_max int not null default 50,
  active text not null default 'Y', -- 'Y' or 'N'
  cost_gbp int not null default 0,
  sale_gbp int not null default 0,
  created_at_ms bigint not null default (extract(epoch from now())*1000)::bigint,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.saves enable row level security;
alter table public.players enable row level security;

-- Saves: only the owner can read/write
create policy "saves_select_own" on public.saves
  for select to authenticated
  using (user_id = auth.uid());

create policy "saves_insert_own" on public.saves
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "saves_update_own" on public.saves
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "saves_delete_own" on public.saves
  for delete to authenticated
  using (user_id = auth.uid());

-- Players: only the owner can read/write
create policy "players_select_own" on public.players
  for select to authenticated
  using (user_id = auth.uid());

create policy "players_insert_own" on public.players
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "players_update_own" on public.players
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "players_delete_own" on public.players
  for delete to authenticated
  using (user_id = auth.uid());
```

### 3) Add your Supabase credentials

Open `supabaseClient.js` and replace:

- `REPLACE_WITH_YOUR_SUPABASE_URL`
- `REPLACE_WITH_YOUR_SUPABASE_ANON_KEY`

### 4) Run locally

Use any static server:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`

### Hosting

Supabase is primarily a backend platform (DB/Auth/Storage/Functions). Host these static files on GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.
