-- Enable uuid extension
create extension if not exists "uuid-ossp";
create extension if not exists moddatetime schema extensions;

-- Profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  name text,
  photo_path text,
  language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trips table
create table trips (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) not null,
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  budget_amount numeric(10,2) check (budget_amount >= 0),
  currency text default 'USD',
  cover_path text,
  visibility text default 'private' check (visibility in ('private', 'shared', 'public')),
  public_slug text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (end_date >= start_date)
);

-- Cities table
create table cities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  country text not null,
  region text,
  cost_index numeric(5,2),
  popularity integer,
  image_path text,
  unique (name, country, region)
);

-- Trip stops table
create table trip_stops (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  city_id uuid references cities(id) not null,
  arrival_date date not null,
  departure_date date not null,
  position integer not null,
  unique (trip_id, position),
  check (departure_date >= arrival_date)
);

-- Activities table
create table activities (
  id uuid default uuid_generate_v4() primary key,
  city_id uuid references cities(id) not null,
  name text not null,
  type text,
  description text,
  duration integer, -- in minutes
  estimated_cost numeric(10,2) check (estimated_cost >= 0),
  image_path text
);

-- Stop activities table
create table stop_activities (
  id uuid default uuid_generate_v4() primary key,
  stop_id uuid references trip_stops(id) on delete cascade not null,
  activity_id uuid references activities(id) not null,
  scheduled_date date not null,
  start_time time,
  estimated_cost numeric(10,2) check (estimated_cost >= 0),
  position integer not null,
  notes text,
  unique (stop_id, scheduled_date, position)
);

-- Expense items table
create table expense_items (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  stop_id uuid references trip_stops(id) on delete cascade,
  expense_date date not null,
  category text not null check (category in ('transport', 'stay', 'activity', 'meal')),
  label text not null,
  estimated_amount numeric(10,2) not null check (estimated_amount >= 0)
);

-- Trip shares table
create table trip_shares (
  trip_id uuid references trips(id) on delete cascade not null,
  shared_with_user_id uuid references auth.users not null,
  primary key (trip_id, shared_with_user_id)
);

-- Saved destinations table
create table saved_destinations (
  user_id uuid references auth.users not null,
  city_id uuid references cities(id) on delete cascade not null,
  primary key (user_id, city_id)
);

-- Cost/Budget View (as specified in 4.4)
create view trip_costs_view as
select 
  trip_id,
  'expense' as source_type,
  id as source_id,
  category,
  estimated_amount as amount,
  expense_date as cost_date
from expense_items
union all
select 
  s.trip_id,
  'activity' as source_type,
  sa.id as source_id,
  'activity' as category,
  sa.estimated_cost as amount,
  sa.scheduled_date as cost_date
from stop_activities sa
join trip_stops s on sa.stop_id = s.id
where sa.estimated_cost is not null;

-- RLS POLICIES

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table trips enable row level security;
alter table cities enable row level security;
alter table trip_stops enable row level security;
alter table activities enable row level security;
alter table stop_activities enable row level security;
alter table expense_items enable row level security;
alter table trip_shares enable row level security;
alter table saved_destinations enable row level security;

-- Profiles: readable/writable only by the owning user
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can delete their own profile" on profiles
  for delete using (auth.uid() = id);

-- Public page exception: minimal fields exposed for trip owners
create policy "Public trips owners are readable" on profiles
  for select using (
    id in (select owner_id from trips where visibility = 'public')
  );

-- Trips: owners can CRUD; selectable if public or shared
create policy "Users can CRUD their own trips" on trips
  for all using (auth.uid() = owner_id);

create policy "Trips are selectable if public" on trips
  for select using (visibility = 'public');

create policy "Trips are selectable if shared" on trips
  for select using (
    visibility = 'shared' and 
    exists (select 1 from trip_shares ts where ts.trip_id = id and ts.shared_with_user_id = auth.uid())
  );

-- Cities and Activities (catalog tables): readable by any authenticated app user, not writable
create policy "Cities are readable by authenticated users" on cities
  for select using (auth.role() = 'authenticated' or auth.role() = 'anon');

create policy "Activities are readable by authenticated users" on activities
  for select using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- Trip Stops: selectable if parent trip is selectable, mutable if parent trip is owned
create policy "Trip stops are selectable if trip is selectable" on trip_stops
  for select using (
    trip_id in (
      select id from trips where 
        owner_id = auth.uid() or 
        visibility = 'public' or 
        (visibility = 'shared' and exists (select 1 from trip_shares ts where ts.trip_id = trips.id and ts.shared_with_user_id = auth.uid()))
    )
  );

create policy "Trip stops are mutable if trip is owned" on trip_stops
  for insert with check (trip_id in (select id from trips where owner_id = auth.uid()));
create policy "Trip stops are updatable if trip is owned" on trip_stops
  for update using (trip_id in (select id from trips where owner_id = auth.uid()));
create policy "Trip stops are deletable if trip is owned" on trip_stops
  for delete using (trip_id in (select id from trips where owner_id = auth.uid()));

-- Stop Activities: selectable if trip stop's parent trip is selectable, mutable if parent trip is owned
create policy "Stop activities are selectable if trip is selectable" on stop_activities
  for select using (
    stop_id in (select id from trip_stops where trip_id in (
      select id from trips where 
        owner_id = auth.uid() or 
        visibility = 'public' or 
        (visibility = 'shared' and exists (select 1 from trip_shares ts where ts.trip_id = trips.id and ts.shared_with_user_id = auth.uid()))
    ))
  );

create policy "Stop activities are mutable if trip is owned" on stop_activities
  for insert with check (stop_id in (select id from trip_stops where trip_id in (select id from trips where owner_id = auth.uid())));
create policy "Stop activities are updatable if trip is owned" on stop_activities
  for update using (stop_id in (select id from trip_stops where trip_id in (select id from trips where owner_id = auth.uid())));
create policy "Stop activities are deletable if trip is owned" on stop_activities
  for delete using (stop_id in (select id from trip_stops where trip_id in (select id from trips where owner_id = auth.uid())));

-- Expense Items: selectable if parent trip is selectable, mutable if parent trip is owned
create policy "Expense items are selectable if trip is selectable" on expense_items
  for select using (
    trip_id in (
      select id from trips where 
        owner_id = auth.uid() or 
        visibility = 'public' or 
        (visibility = 'shared' and exists (select 1 from trip_shares ts where ts.trip_id = trips.id and ts.shared_with_user_id = auth.uid()))
    )
  );

create policy "Expense items are mutable if trip is owned" on expense_items
  for insert with check (trip_id in (select id from trips where owner_id = auth.uid()));
create policy "Expense items are updatable if trip is owned" on expense_items
  for update using (trip_id in (select id from trips where owner_id = auth.uid()));
create policy "Expense items are deletable if trip is owned" on expense_items
  for delete using (trip_id in (select id from trips where owner_id = auth.uid()));

-- Trip Shares: owners can CRUD
create policy "Users can CRUD trip shares for their trips" on trip_shares
  for all using (trip_id in (select id from trips where owner_id = auth.uid()));

-- Saved Destinations: users can CRUD their own
create policy "Users can CRUD their saved destinations" on saved_destinations
  for all using (auth.uid() = user_id);

-- Triggers for updated_at
create trigger handle_updated_at before update on profiles
  for each row execute procedure moddatetime (updated_at);
create trigger handle_updated_at before update on trips
  for each row execute procedure moddatetime (updated_at);
