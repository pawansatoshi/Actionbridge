-- Optional production persistence schema.
-- The hackathon build does not require this database; browser history is used until
-- SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY and authenticated user sessions are configured.
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  goal text not null,
  region text not null,
  locale text not null,
  status text not null default 'draft',
  authorization_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists call_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  calle_call_id text not null unique,
  recipient_phone text not null,
  status text not null default 'created',
  completion_confidence jsonb,
  structured_result jsonb,
  evidence jsonb,
  transcript jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  call_run_id uuid references call_runs(id) on delete cascade,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists tasks_user_created_idx on tasks(user_id, created_at desc);
create index if not exists call_runs_task_idx on call_runs(task_id, created_at desc);
create index if not exists audit_events_task_idx on audit_events(task_id, created_at desc);

-- Enable RLS before exposing these tables through a browser client.
alter table tasks enable row level security;
alter table call_runs enable row level security;
alter table audit_events enable row level security;
