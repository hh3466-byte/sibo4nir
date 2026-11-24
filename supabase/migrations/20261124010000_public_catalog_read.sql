-- שכלול חלק 1: נתיב מים שמור למסלולי דגל, activities, וקריאה ציבורית לטבלאות הקטלוג בלבד.

alter table public.routes add column if not exists water_path jsonb; -- { stops: [[lon,lat]], legs: [[[lon,lat]]] }

create table if not exists public.activities (
  type              text primary key,
  label             text not null,
  default_dwell_min integer not null default 0
);
alter table public.activities enable row level security; -- נשארת סגורה, בלי policy

-- SELECT ציבורי (מידע קטלוג לא רגיש) על 5 הטבלאות האלה בלבד. כתיבה נשארת סגורה. פריטים מוסתרים לא נחשפים.
drop policy if exists "public read" on public.islands;
create policy "public read" on public.islands  for select to anon, authenticated using (not hidden);
drop policy if exists "public read" on public.places;
create policy "public read" on public.places   for select to anon, authenticated using (not hidden);
drop policy if exists "public read" on public.tavernas;
create policy "public read" on public.tavernas for select to anon, authenticated using (not hidden);
drop policy if exists "public read" on public.hotels;
create policy "public read" on public.hotels   for select to anon, authenticated using (not hidden);
drop policy if exists "public read" on public.routes;
create policy "public read" on public.routes   for select to anon, authenticated using (not hidden);
