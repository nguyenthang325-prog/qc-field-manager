-- Doc Tracker schema (thêm vào Supabase project hiện tại của qlda-xd)
-- Chạy trong: Supabase Dashboard → SQL Editor → New query

create table if not exists dt_projects (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  name text not null,
  settings jsonb default '{}',
  created_at timestamptz default now()
);

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
