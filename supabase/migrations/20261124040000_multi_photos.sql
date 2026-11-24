-- ריבוי תמונות לכל מקום, טברנה ומלון (עד 5-6 תמונות מ-Google Places ב-cache ב-Supabase Storage).
alter table public.place_photos add column if not exists photo_paths text[] not null default '{}';
alter table public.tavernas     add column if not exists photo_paths text[] not null default '{}';
alter table public.hotels       add column if not exists photo_paths text[] not null default '{}';
