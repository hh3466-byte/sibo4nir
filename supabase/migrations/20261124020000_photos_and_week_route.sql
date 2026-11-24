-- סבב 2: טבלת תמונות מקומות (cache פעם אחת מ-Google Places ל-Supabase Storage) + עמודות תמונה לטברנות ומלונות.
-- בלי מחיקות: מסלול היומיים הישן מסומן כ-hidden בלבד.

alter table public.places   add column if not exists google_place_id text;

alter table public.tavernas add column if not exists google_place_id text;
alter table public.tavernas add column if not exists storage_path text;
alter table public.tavernas add column if not exists source text;
alter table public.tavernas add column if not exists attribution text;
alter table public.tavernas add column if not exists fetched_at timestamptz;

alter table public.hotels   add column if not exists google_place_id text;
alter table public.hotels   add column if not exists storage_path text;
alter table public.hotels   add column if not exists source text;
alter table public.hotels   add column if not exists attribution text;
alter table public.hotels   add column if not exists fetched_at timestamptz;

create table if not exists public.place_photos (
  place_id        text primary key references public.places(id),
  google_place_id text,
  storage_path    text not null,
  source          text not null,
  attribution     text,
  fetched_at      timestamptz not null default now()
);

alter table public.place_photos enable row level security;

drop policy if exists "public read" on public.place_photos;
create policy "public read" on public.place_photos for select to anon, authenticated using (true);

-- הסתרת מסלול היומיים הישן (ללא מחיקה) כדי שמסלול השבוע יהיה מסלול הדגל הפעיל
update public.routes set hidden = true where id = 'cyclades-heart-2d';
