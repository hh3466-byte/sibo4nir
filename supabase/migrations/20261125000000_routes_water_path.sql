-- סבב 3: עמודת water_path למסלולים (מסלול מים מחושב-מראש, כולל legs סביב חופים).
-- JSONB בצורת { stops: [[lon,lat],...], legs: [[[lon,lat],...],...] }.
-- בלי מחיקות. אידמפוטנטי.

alter table public.routes add column if not exists water_path jsonb;
