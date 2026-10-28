-- Stone Weirs, Shared Futures — initial schema (single production project).
-- Run once in Supabase → SQL Editor. Safe to read top to bottom; no data is deleted.
--
-- Multi-tenant model (see ARCHITECTURE.md):
--   tenant  = a local node (public.nodes). Membership via public.node_members (steward | contributor).
--   private = drafts, interview turns, AI keys, Q&A logs → visible to their owner only.
--   review  = items submitted for review → also visible to that node's stewards.
--   public  = approved records of active nodes → visible to everyone (globe, guides, exhibits).
-- The browser never talks to Supabase directly: every query goes through the Next.js BFF,
-- which scopes by session + tenant. RLS below is defence in depth, not the only gate.

create extension if not exists vector;
create extension if not exists postgis;

-- ───────────────────────── Members & contact ─────────────────────────
create type persona as enum ('researcher','museum','community','student','other');
create type platform_role as enum ('member','admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  avatar_url text,
  auth_provider text default 'google',
  persona persona,
  country text,                 -- ISO 3166
  organization text,
  job_title text,
  orcid text,
  interests text[] default '{}',
  locale text default 'zh-Hant',
  timezone text,
  directory_visibility text not null default 'members' check (directory_visibility in ('hidden','members','public')),
  platform_role platform_role not null default 'member',
  signup_source text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  last_active_at timestamptz
);

create table public.consents (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null check (consent_type in ('privacy_policy','contact_followup','newsletter','research_study')),
  granted boolean not null,
  policy_version text not null,
  created_at timestamptz not null default now()
);
-- Latest state per user & type
create view public.current_consents as
  select distinct on (user_id, consent_type) user_id, consent_type, granted, policy_version, created_at
  from public.consents order by user_id, consent_type, created_at desc;

create table public.contact_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  admin_id uuid not null references public.profiles(id),
  channel text not null check (channel in ('email','meeting','event','other')),
  note text,
  created_at timestamptz not null default now()
);

create table public.admin_tags (
  user_id uuid not null references public.profiles(id) on delete cascade,
  tag text not null,
  primary key (user_id, tag)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,          -- e.g. 'contacts.export', 'role.change', 'entity.withdraw'
  detail jsonb,
  created_at timestamptz not null default now()
);

-- Create a profile automatically on first Google login (name + email from Google).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, auth_provider)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  ) on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and platform_role = 'admin');
$$;

-- ───────────────────────── Local nodes ─────────────────────────
create table public.nodes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name jsonb not null,             -- {"zh-Hant": "...", "en": "..."}
  type text not null check (type in ('community','museum','research','government')),
  country text not null,
  geom geography(point),           -- precise; NEVER exposed via the public view
  display_lat double precision,    -- privacy-processed, for the globe
  display_lng double precision,
  geo_tier text not null default 'generalized' check (geo_tier in ('public','generalized','restricted')),
  languages text[] default '{}',
  summary jsonb,
  tags text[] default '{}',
  settings jsonb not null default '{"review_required": true, "cross_node_qa": false}',
  status text not null default 'draft' check (status in ('draft','active','invited','suspended')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.node_members (
  node_id uuid references public.nodes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null check (role in ('steward','contributor')),
  joined_at timestamptz not null default now(),
  primary key (node_id, user_id)
);

create table public.node_links (
  from_node uuid references public.nodes(id) on delete cascade,
  to_node uuid references public.nodes(id) on delete cascade,
  link_type text not null,
  label jsonb,
  primary key (from_node, to_node)
);

create or replace function public.is_steward(n uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.node_members where node_id = n and user_id = auth.uid() and role = 'steward');
$$;
create or replace function public.is_member_of(n uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.node_members where node_id = n and user_id = auth.uid());
$$;

-- Public globe view: no precise geometry.
create view public.nodes_public as
  select id, slug, name, type, country, display_lat, display_lng, geo_tier, languages, summary, tags, status
  from public.nodes where status in ('active','invited');

-- ───────────────────────── Stories, entities, relations ─────────────────────────
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.nodes(id) on delete cascade,
  title jsonb,
  source_type text check (source_type in ('text','audio','file','import')),
  source_object_key text,          -- Cloudflare R2 key
  transcript text,
  language text,
  status text not null default 'draft' check (status in ('draft','in_review','approved','withdrawn')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.interview_turns (
  id bigint generated always as identity primary key,
  story_id uuid not null references public.stories(id) on delete cascade,
  turn_index int not null,
  role text not null check (role in ('ai','user')),
  content text not null,
  language text,
  audio_object_key text,
  created_at timestamptz not null default now()
);

create table public.entities (
  id uuid primary key default gen_random_uuid(),
  code text,                       -- human code e.g. PL-03 (unique per node)
  node_id uuid not null references public.nodes(id) on delete cascade,
  story_id uuid references public.stories(id) on delete set null,
  crm_class text not null check (crm_class in ('E39','E53','E5','E22','E18','E73')),
  label jsonb not null,
  description jsonb,
  terms jsonb,                     -- [{term, romanization, language, gloss}]
  keywords text[] default '{}',
  source_turn_ids bigint[] default '{}',
  source_text text,                -- prov:wasDerivedFrom
  -- five governance fields (paper §3.3)
  fpic_status text not null default 'pending' check (fpic_status in ('obtained','assumed','pending','withdrawn')),
  license text,
  geo_tier text not null default 'generalized' check (geo_tier in ('public','generalized','restricted')),
  sensitivity text not null default 'low' check (sensitivity in ('low','medium','high')),
  reviewer_role text,
  status text not null default 'draft' check (status in ('draft','in_review','approved','withdrawn')),
  version int not null default 1,
  created_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (node_id, code)
);

create table public.relations (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.nodes(id) on delete cascade,
  from_entity uuid not null references public.entities(id) on delete cascade,
  to_entity uuid not null references public.entities(id) on delete cascade,
  crm_property text not null,
  label jsonb,
  confirmed boolean not null default false
);

-- Only approved, non-restricted entities may enter the AI index (governance-before-generation).
create table public.entity_embeddings (
  entity_id uuid primary key references public.entities(id) on delete cascade,
  node_id uuid not null references public.nodes(id) on delete cascade,
  language text,
  embedding vector(1024)
);

create table public.qa_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  node_scope text[],
  question text not null,
  answer text,
  cited_entity_codes text[],
  grounded boolean,
  feedback smallint,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Bring-your-own AI keys ─────────────────────────
-- Ciphertext only (AES-256-GCM, key = APP_ENCRYPTION_KEY, held by the BFF). RLS is enabled with
-- NO policies: no client role can read or write this table; only the server (service role) can.
create table public.user_ai_keys (
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('anthropic','openai')),
  ciphertext text not null,
  last4 text not null,
  model text not null,
  is_preferred boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, provider)
);
create unique index one_preferred_key on public.user_ai_keys (user_id) where is_preferred;

-- ───────────────────────── Row Level Security ─────────────────────────
alter table public.profiles enable row level security;
alter table public.consents enable row level security;
alter table public.contact_logs enable row level security;
alter table public.admin_tags enable row level security;
alter table public.audit_logs enable row level security;
alter table public.nodes enable row level security;
alter table public.node_members enable row level security;
alter table public.node_links enable row level security;
alter table public.stories enable row level security;
alter table public.interview_turns enable row level security;
alter table public.entities enable row level security;
alter table public.relations enable row level security;
alter table public.entity_embeddings enable row level security;
alter table public.qa_logs enable row level security;
alter table public.user_ai_keys enable row level security;

-- profiles: you see yourself; admins see everyone. (Directory uses a separate view later.)
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- Members may edit their profile but never their own role.
create or replace function public.guard_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.platform_role is distinct from old.platform_role and not public.is_admin() and auth.uid() is not null then
    raise exception 'only admins can change roles';
  end if;
  return new;
end $$;
create trigger guard_role_change before update on public.profiles
  for each row execute function public.guard_role_change();
create policy "admin profile update" on public.profiles for update using (public.is_admin());

create policy "own consents" on public.consents for select using (user_id = auth.uid() or public.is_admin());
create policy "insert own consents" on public.consents for insert with check (user_id = auth.uid());

create policy "admin only" on public.contact_logs for all using (public.is_admin()) with check (public.is_admin());
create policy "admin only" on public.admin_tags for all using (public.is_admin()) with check (public.is_admin());
create policy "admin read" on public.audit_logs for select using (public.is_admin());
create policy "admin insert" on public.audit_logs for insert with check (public.is_admin());

-- nodes
create policy "public nodes" on public.nodes for select using (status in ('active','invited') or created_by = auth.uid() or public.is_admin() or public.is_member_of(id));
create policy "create node" on public.nodes for insert with check (created_by = auth.uid() and status = 'draft');
create policy "steward edits node" on public.nodes for update using (public.is_steward(id) or public.is_admin());
create policy "own memberships and stewards" on public.node_members for select using (user_id = auth.uid() or public.is_steward(node_id) or public.is_admin());
create policy "steward manages members" on public.node_members for all using (public.is_steward(node_id) or public.is_admin()) with check (public.is_steward(node_id) or public.is_admin());
create policy "links public" on public.node_links for select using (true);

-- stories & turns: node members
create policy "stories: owner, reviewing steward, or approved" on public.stories for select using (
  status = 'approved'
  or created_by = auth.uid()
  or (status in ('in_review','withdrawn') and public.is_steward(node_id))
  or public.is_admin());
create policy "members write stories" on public.stories for insert with check (public.is_member_of(node_id) and created_by = auth.uid());
create policy "author or steward update story" on public.stories for update using (created_by = auth.uid() or public.is_steward(node_id));
create policy "turns with story" on public.interview_turns for all
  using (exists (select 1 from public.stories s where s.id = story_id and (s.created_by = auth.uid() or public.is_steward(s.node_id))))
  with check (exists (select 1 from public.stories s where s.id = story_id and s.created_by = auth.uid()));

-- entities: approved ones are public; drafts visible to node members; only stewards approve.
create policy "entities: owner, reviewing steward, or approved" on public.entities for select using (
  status = 'approved'
  or created_by = auth.uid()
  or (status in ('in_review','withdrawn') and public.is_steward(node_id))
  or public.is_admin());
create policy "members draft entities" on public.entities for insert with check (public.is_member_of(node_id) and created_by = auth.uid() and status in ('draft','in_review'));
create policy "owner edits own draft" on public.entities for update using (created_by = auth.uid() and status = 'draft') with check (created_by = auth.uid() and status in ('draft','in_review'));
create policy "steward governs entities" on public.entities for update using (public.is_steward(node_id)) with check (public.is_steward(node_id));
-- A relation is visible only if both ends are visible to the caller (RLS on entities applies inside the subquery).
create policy "relations follow entities" on public.relations for select using (
  exists (select 1 from public.entities e where e.id = from_entity)
  and exists (select 1 from public.entities e where e.id = to_entity));
create policy "members write relations" on public.relations for insert with check (
  public.is_member_of(node_id) and exists (select 1 from public.entities e where e.id = from_entity and e.created_by = auth.uid()));
create policy "steward manages relations" on public.relations for update using (public.is_steward(node_id)) with check (public.is_steward(node_id));

-- embeddings & logs: server only (service role bypasses RLS); nothing for anon.
create policy "own qa logs" on public.qa_logs for select using (user_id = auth.uid() or public.is_admin());

-- Note: entities.geo_tier = 'restricted' rows never carry coordinates; precise geometry lives only in nodes.geom,
-- which is excluded from nodes_public. API routes must read nodes via nodes_public.
