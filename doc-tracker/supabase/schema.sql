-- Doc Tracker schema (thêm vào Supabase project hiện tại của qlda-xd)
-- Chạy trong: Supabase Dashboard → SQL Editor → New query

create table if not exists dt_projects (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  name text not null,
  settings jsonb default '{}',
  pin_hash text,                       -- SHA-256 hex của mã PIN (null = không yêu cầu PIN)
  created_at timestamptz default now()
);
-- Cho DB đã tồn tại trước khi có cột pin_hash:
alter table dt_projects add column if not exists pin_hash text;

create table if not exists dt_docs (
  id text primary key,
  project_code text references dt_projects(code) on delete cascade,
  so_hieu_doc text,
  ten_doc text not null,
  loai_doc text,
  du_an text,
  don_vi_gui text,
  don_vi_nhan text,
  trang_thai text default 'cho_nop',
  ngay_nop_du_kien date,
  ngay_het_han date,
  ngay_hoan_thanh date,
  sla_ngay int,
  so_lan_tra_lai int default 0,
  nguoi_phu_trach text,
  tags jsonb default '[]',
  link_drive text,
  ghi_chu text,
  history jsonb default '[]',
  created_at timestamptz default now()
);

-- Enable RLS
alter table dt_projects enable row level security;
alter table dt_docs enable row level security;

-- Allow anon read/write (project code = auth)
create policy "allow all dt_projects" on dt_projects for all using (true) with check (true);
create policy "allow all dt_docs" on dt_docs for all using (true) with check (true);

-- ── CỔNG PIN (rào ở tầng app) ────────────────────────────────────────────────
-- LƯU Ý BẢO MẬT: anon key nằm trong bundle client + RLS đang mở (using true), nên
-- đây CHỈ là rào đăng nhập ở tầng app, KHÔNG chặn được người có anon key + SQL.
-- Muốn bảo mật tầng DB thật sự cần Supabase Auth + RLS theo auth.uid().
create extension if not exists pgcrypto;

-- Xác thực PIN phía server, tránh lộ pin_hash ra client.
-- search_path gồm cả 'extensions' vì Supabase cài pgcrypto (digest) ở schema extensions.
create or replace function dt_verify_pin(p_code text, p_pin text)
returns boolean language sql security definer
set search_path = public, extensions as $$
  select exists(
    select 1 from dt_projects
    where code = p_code
      and (pin_hash is null or pin_hash = encode(digest(p_pin, 'sha256'), 'hex'))
  );
$$;

-- Không cho client đọc trực tiếp cột hash.
revoke select (pin_hash) on dt_projects from anon;
