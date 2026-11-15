-- RLS סגור כברירת מחדל.
-- כל טבלה חדשה בסכמה public תקבל RLS פעיל אוטומטית, בלי אף policy – כלומר סגורה ל-anon ול-authenticated
-- עד שמישהו יכתוב policy מפורשת. אין כאן אף טבלה.

create or replace function public.enforce_rls_on_new_tables()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  obj record;
begin
  for obj in
    select * from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type = 'table'
      and schema_name = 'public'
  loop
    execute format('alter table %s enable row level security', obj.object_identity);
  end loop;
end;
$$;

revoke all on function public.enforce_rls_on_new_tables() from public, anon, authenticated;

drop event trigger if exists enforce_rls_on_new_tables;
create event trigger enforce_rls_on_new_tables
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.enforce_rls_on_new_tables();
