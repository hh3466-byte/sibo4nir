-- הוספת סוג מקום לינה (accommodation kind): מלון / Airbnb / בית אירוח / חדר אירוח.
alter table public.hotels
  add column if not exists kind text not null default 'hotel'
  check (kind in ('hotel', 'airbnb', 'guesthouse', 'room'));

notify pgrst, 'reload schema';
