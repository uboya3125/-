-- 通知表所見メーカー Phase 1 スキーマ
-- Phase 1ではシンプル認証のため teachers.password_hash は未使用（将来Supabase Authへ移行）

create extension if not exists "pgcrypto";

create table teachers (
  id uuid primary key default gen_random_uuid(),
  email text,
  password_hash text,
  name text not null,
  role text not null default 'teacher',
  created_at timestamptz not null default now()
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  school_year int not null,
  grade int not null,
  class_name text not null,
  is_specialist boolean not null default false,
  created_at timestamptz not null default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  seat_number int not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table units (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  teacher_id uuid not null references teachers(id) on delete cascade,
  grade int not null,
  name text not null,
  term text,
  perspectives text[] not null default array['知識・技能','思考・判断・表現','主体的に学習に取り組む態度'],
  source_type text not null default 'manual',
  created_at timestamptz not null default now()
);

create table keywords (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  perspective text not null,
  text text not null,
  favorite_count int not null default 0,
  created_at timestamptz not null default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  teacher_id uuid not null references teachers(id) on delete cascade,
  selected_keywords text[] not null default '{}',
  length_type text not null,
  generated_text text,
  edited_text text,
  status text not null default 'draft' check (status in ('not_started','draft','final')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, unit_id)
);

create table comment_edit_history (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id) on delete cascade,
  edited_by uuid references teachers(id),
  previous_text text,
  new_text text,
  edited_at timestamptz not null default now()
);

create table annual_plan_uploads (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  subject_id uuid references subjects(id),
  file_path text not null,
  parsed_status text not null default 'pending',
  parsed_units jsonb,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references teachers(id),
  action text not null,
  target text,
  timestamp timestamptz not null default now()
);

create index on comments (unit_id, status);
create index on students (class_id);
create index on units (teacher_id, subject_id, grade);
create index on keywords (unit_id, perspective);
create index on comment_edit_history (comment_id);
