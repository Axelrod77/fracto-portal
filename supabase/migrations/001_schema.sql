-- =============================================
-- FraCTO Database Schema
-- =============================================

-- Organizations (tenants)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Users linked to orgs
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references organizations(id),
  full_name text,
  role text default 'member', -- 'admin' | 'member'
  created_at timestamptz default now()
);

-- Assessments (one per engagement/run)
create table assessments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  created_by uuid references auth.users(id),
  title text default 'Untitled Assessment',
  status text default 'in_progress', -- 'in_progress' | 'completed'
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Raw answers per assessment
create table answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  question_id text not null,
  value jsonb not null,
  created_at timestamptz default now(),
  unique(assessment_id, question_id)
);

-- Computed scores (cached after completion)
create table scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade unique,
  overall numeric(3,1) not null,
  dimensions jsonb not null,
  computed_at timestamptz default now()
);

-- Shared report links (public access)
create table shared_reports (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Enterprise data uploads
create table enterprise_uploads (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  upload_type text not null, -- 'architecture' | 'cmdb' | 'process_logs'
  file_path text not null,
  original_filename text not null,
  file_size_bytes bigint,
  parsed_data jsonb,
  enrichment_applied boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- Row-Level Security
-- =============================================

-- Helper: get the org_id for the current user
create or replace function user_org_id()
returns uuid as $$
  select org_id from user_profiles where id = auth.uid()
$$ language sql security definer stable;

-- Organizations
alter table organizations enable row level security;
create policy "org_access" on organizations
  for all using (id = user_org_id());

-- User profiles
alter table user_profiles enable row level security;
create policy "profile_access" on user_profiles
  for all using (org_id = user_org_id());

-- Assessments
alter table assessments enable row level security;
create policy "assessment_access" on assessments
  for all using (org_id = user_org_id());

-- Answers
alter table answers enable row level security;
create policy "answer_access" on answers
  for all using (
    assessment_id in (select id from assessments where org_id = user_org_id())
  );

-- Scores
alter table scores enable row level security;
create policy "score_access" on scores
  for all using (
    assessment_id in (select id from assessments where org_id = user_org_id())
  );

-- Shared reports
alter table shared_reports enable row level security;
create policy "shared_report_manage" on shared_reports
  for all using (
    assessment_id in (select id from assessments where org_id = user_org_id())
  );

-- Enterprise uploads
alter table enterprise_uploads enable row level security;
create policy "upload_access" on enterprise_uploads
  for all using (
    assessment_id in (select id from assessments where org_id = user_org_id())
  );

-- =============================================
-- Triggers
-- =============================================

-- Auto-create org + profile when a user signs up
create or replace function handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  insert into organizations (name) values (new.email)
  returning id into new_org_id;

  insert into user_profiles (id, org_id, full_name, role)
  values (new.id, new_org_id, new.raw_user_meta_data->>'full_name', 'admin');

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================
-- RPC: Public shared report access
-- =============================================

create or replace function get_shared_report(share_token text)
returns jsonb as $$
declare
  report_record record;
  score_data jsonb;
  answer_data jsonb;
begin
  select sr.*, a.title, a.org_id
  into report_record
  from shared_reports sr
  join assessments a on a.id = sr.assessment_id
  where sr.token = share_token
    and (sr.expires_at is null or sr.expires_at > now());

  if not found then return null; end if;

  select row_to_json(s.*) into score_data
  from scores s where s.assessment_id = report_record.assessment_id;

  select jsonb_agg(row_to_json(ans.*)) into answer_data
  from answers ans where ans.assessment_id = report_record.assessment_id;

  return jsonb_build_object(
    'title', report_record.title,
    'scores', score_data,
    'answers', answer_data
  );
end;
$$ language plpgsql security definer;
