-- GWCL Plumbing Contractor Registry — database schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL -> New query -> paste -> Run)
-- It creates every table, enum, and security policy the app needs.

-- ---------- enums ----------
create type licence_type as enum ('Master Plumber', 'Plumbing Contractor');
create type app_type     as enum ('New', 'Renewal');
create type app_status   as enum (
  'DRAFT', 'PENDING_APPROVAL', 'REJECTED',
  'TOKEN_ISSUED', 'PENDING_FINAL_APPROVAL',
  'REGISTERED', 'EXPIRING_SOON', 'EXPIRED', 'LAPSED'
);
create type grade        as enum ('A', 'B', 'C', 'D');
create type user_role    as enum ('admin', 'super_admin');

-- ---------- staff profile ----------
-- Every row in auth.users gets a matching profile row with a role.
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       user_role not null default 'admin',
  created_at timestamptz not null default now()
);

-- ---------- applications (the core entity) ----------
create table public.applications (
  id                   text primary key,                       -- e.g. APP-2026-0018
  company              text not null,
  md                   text,                                    -- managing director
  email                text,
  phone                text,
  fax                  text,
  postal               text,
  office               text,
  office_manned        text,
  warehouse            text,
  warehouse_desc       text,
  licence_type         licence_type not null,
  app_type             app_type not null,
  status               app_status not null default 'DRAFT',
  fee                  numeric(10,2) not null default 250,
  bank                 text,
  statement_file       text,
  credit_file          text,

  submitted_at         timestamptz,
  submitted_by         uuid references public.profiles(id),

  reviewed_at          timestamptz,
  reviewed_by          uuid references public.profiles(id),
  approval_comments    text,
  rejection_reason     text,

  token                text,
  token_issued_at      timestamptz,
  token_expires_at     timestamptz,

  receipt_number       text,
  receipt_file         text,
  payment_at           timestamptz,
  payment_recorded_by  uuid references public.profiles(id),
  payment_verified_at  timestamptz,
  payment_verified_by  uuid references public.profiles(id),

  -- final registration
  reg_no               text unique,
  registration_date    timestamptz,
  expiry_date          timestamptz,
  registered_by        uuid references public.profiles(id),
  grade                grade,
  checklist_required   int[] not null default '{}',             -- indexes into CHECKLIST_REQUIRED
  checklist_optional   int[] not null default '{}',             -- indexes into CHECKLIST_OPTIONAL

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index applications_status_idx on public.applications(status);
create index applications_expiry_idx on public.applications(expiry_date);

-- ---------- wizard children ----------
create table public.application_staff (
  id             bigserial primary key,
  application_id text references public.applications(id) on delete cascade,
  name           text not null,
  role           text,             -- Civil Engineer, Technician Engineer, Pipe Fitter, Admin
  qualification  text,
  years          int,
  file_path      text              -- Supabase Storage path
);

create table public.application_tools (
  id             bigserial primary key,
  application_id text references public.applications(id) on delete cascade,
  category       text,             -- Pickup, Crane Truck, Low Loader, Pipe Testing, Heavy Construction...
  type           text,
  serial         text,
  dom            date,              -- date of manufacture
  file_path      text
);

create table public.application_projects (
  id             bigserial primary key,
  application_id text references public.applications(id) on delete cascade,
  name           text,
  details        text,
  cost           numeric(12,2),
  year           int,
  file_path      text
);

create table public.application_docs (
  id             bigserial primary key,
  application_id text references public.applications(id) on delete cascade,
  doc_type       text not null,    -- one of MANDATORY_DOCS
  file_path      text,
  uploaded_at    timestamptz not null default now(),
  unique (application_id, doc_type)
);

-- ---------- audit log (immutable) ----------
create table public.audit_log (
  id             bigserial primary key,
  application_id text references public.applications(id) on delete cascade,
  action         text not null,    -- Created, Submitted, Approved, Rejected, Token Issued, Payment Recorded, Payment Verified, Registered
  actor_id       uuid references public.profiles(id),
  actor_name     text,              -- denormalised so history survives user deletes
  notes          text,
  created_at     timestamptz not null default now()
);
create index audit_log_app_idx on public.audit_log(application_id, created_at desc);

-- ---------- helpful updated_at trigger ----------
create or replace function public.tg_touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger applications_touch
  before update on public.applications
  for each row execute function public.tg_touch_updated_at();

-- ---------- Row Level Security ----------
alter table public.profiles             enable row level security;
alter table public.applications         enable row level security;
alter table public.application_staff    enable row level security;
alter table public.application_tools    enable row level security;
alter table public.application_projects enable row level security;
alter table public.application_docs     enable row level security;
alter table public.audit_log            enable row level security;

-- Helper: "am I a super admin?" lives inside Postgres so policies stay simple.
create or replace function public.is_super_admin() returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- Everyone signed in can read their own profile; super admins see all.
create policy profiles_self_read on public.profiles
  for select using (auth.uid() = id or public.is_super_admin());
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id);

-- Applications: any authenticated staff member can read/insert/update.
-- (Admins drive the wizard, Super Admins review — both need the same rows.)
create policy apps_read  on public.applications for select using (auth.role() = 'authenticated');
create policy apps_write on public.applications for all    using (auth.role() = 'authenticated')
                                                           with check (auth.role() = 'authenticated');

-- Child tables inherit the same "authenticated = access" rule.
create policy staff_rw    on public.application_staff    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy tools_rw    on public.application_tools    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy projects_rw on public.application_projects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy docs_rw     on public.application_docs     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Audit log: everyone authenticated can read, only the server (service role) can insert.
create policy audit_read on public.audit_log for select using (auth.role() = 'authenticated');
