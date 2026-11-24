-- סכמה גיאוגרפית (חלק 1 – מפה חיה). RLS נאכף אוטומטית ע"י event trigger מהמיגרציה הקודמת,
-- ולכן כל הטבלאות סגורות ל-anon ול-authenticated עד שייכתבו policies מפורשות.
-- בלי מחיקות: עמודת hidden לסימון/הסתרה.

create table if not exists public.islands (
  id       text primary key,
  name     text not null,
  name_en  text not null,
  hidden   boolean not null default false
);

create table if not exists public.places (
  id           text primary key,
  island_id    text not null references public.islands(id),
  name         text not null,
  type         text not null check (type in ('base','swim','snorkel','anchor','lunch','overnight')),
  overnight    boolean not null default false,
  lat          double precision not null,
  lon          double precision not null,
  approx       boolean not null default true,
  dwell_min    integer not null default 0,
  description  text,
  hidden       boolean not null default false
);

create table if not exists public.tavernas (
  id        bigint generated always as identity primary key,
  place_id  text not null references public.places(id),
  name      text not null,
  note      text,
  hidden    boolean not null default false,
  unique (place_id, name)
);

create table if not exists public.hotels (
  id               bigint generated always as identity primary key,
  place_id         text not null references public.places(id),
  name             text not null,
  price_eur_cents  integer not null,
  hidden           boolean not null default false,
  unique (place_id, name)
);

create table if not exists public.routes (
  id            text primary key,
  name          text not null,
  days          integer not null,
  single_boat   boolean not null default true,
  base_place_id text not null references public.places(id),
  stops         text[] not null,
  social_proof  text,
  note          text,
  hidden        boolean not null default false
);

-- הבטחה שה-RLS פעיל (גם אם ה-event trigger לא קיים בסביבה)
alter table public.islands  enable row level security;
alter table public.places   enable row level security;
alter table public.tavernas enable row level security;
alter table public.hotels   enable row level security;
alter table public.routes   enable row level security;
