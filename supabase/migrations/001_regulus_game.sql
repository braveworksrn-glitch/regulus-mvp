-- Regulus v1 game schema (from docs/warroom/04-mvp-spec.md).
-- The demo app currently serves this data from src/lib/game.ts; this migration
-- is the production-shaped schema to move onto when Supabase is wired up.

create table if not exists lots (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text,
  county text,
  state text,
  parcel_id text,
  acreage numeric,
  lat numeric,
  lng numeric,
  grid_x int,
  grid_y int,
  tile_state text check (tile_state in ('overgrown','cleared','surveyed','access_unlocked','build_ready')),
  status text check (status in ('coming_soon','listed','owned','sandbox')),
  county_price_cents int,
  title_cure_cents int,
  entity_cents int,
  insurance_cents int,
  curation_fee_cents int,
  county_record_url text,
  is_simulated boolean default true,
  owner_id uuid references auth.users,
  created_at timestamptz default now()
);

create table if not exists improvement_actions (
  id text primary key, -- 'survey','perc','clearing','driveway','title_milestone'
  title text,
  board_effect text,
  description text,
  vendor_cost_cents int,
  platform_fee_bps int default 2200,
  eta_weeks_min int,
  eta_weeks_max int,
  resulting_tile_state text
);

create table if not exists service_orders (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid references lots,
  action_id text references improvement_actions,
  user_id uuid references auth.users,
  status text check (status in ('proposed','approved','scheduled','in_progress','verified','refunded')),
  total_cents int,
  is_simulated boolean default true,
  created_at timestamptz default now()
);

create table if not exists timeline_events (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid references lots,
  order_id uuid references service_orders,
  kind text, -- 'photo','county_doc','crew_dispatch','weekly_tick','purchase'
  title text,
  body text,
  image_url text,
  occurred_at timestamptz default now(),
  is_simulated boolean default true
);

create table if not exists profiles (
  id uuid primary key references auth.users,
  display_name text,
  xp int default 0,
  rank text default 'thimble', -- thimble|boot|wheelbarrow|top_hat
  created_at timestamptz default now()
);

create table if not exists quests (
  id text primary key,
  title text,
  description text,
  xp int,
  order_index int
);

create table if not exists quest_progress (
  user_id uuid references auth.users,
  quest_id text references quests,
  completed_at timestamptz,
  primary key (user_id, quest_id)
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid references lots,
  contact_note text,
  is_simulated boolean default true,
  created_at timestamptz default now()
);

alter table waitlist add column if not exists segment text;      -- 'land_dream','builder','curious'
alter table waitlist add column if not exists budget_band text;  -- '<2500','2500_5000','5000_plus'
alter table waitlist add column if not exists founding_member boolean default false;

-- RLS: public read on catalog tables, user-scoped on personal tables.
alter table lots enable row level security;
alter table improvement_actions enable row level security;
alter table timeline_events enable row level security;
alter table quests enable row level security;
alter table listings enable row level security;
alter table service_orders enable row level security;
alter table profiles enable row level security;
alter table quest_progress enable row level security;

create policy "public read lots" on lots for select using (true);
create policy "public read actions" on improvement_actions for select using (true);
create policy "public read timeline" on timeline_events for select using (true);
create policy "public read quests" on quests for select using (true);
create policy "public read listings" on listings for select using (true);
create policy "own orders" on service_orders for all using (auth.uid() = user_id);
create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own quest progress" on quest_progress for all using (auth.uid() = user_id);
