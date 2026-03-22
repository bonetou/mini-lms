create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles user_role
    join public.roles role on role.id = user_role.role_id
    where user_role.user_id = check_user_id
      and role.name = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  student_role_id uuid;
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'given_name'),
    coalesce(new.raw_user_meta_data ->> 'last_name', new.raw_user_meta_data ->> 'family_name'),
    coalesce(new.created_at, timezone('utc', now())),
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    email = excluded.email,
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    updated_at = timezone('utc', now());

  select id
  into student_role_id
  from public.roles
  where name = 'student';

  if student_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, student_role_id)
    on conflict (user_id, role_id) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.record_consultation_status_history()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  actor_id uuid;
  history_notes text;
begin
  actor_id := coalesce(auth.uid(), new.student_id, old.student_id);

  if actor_id is null then
    raise exception 'consultation status history requires an acting user';
  end if;

  if tg_op = 'INSERT' then
    history_notes := case
      when new.status = 'CANCELLED' then new.cancellation_reason
      else null
    end;

    insert into public.consultation_status_history (
      consultation_id,
      changed_by_user_id,
      from_status,
      to_status,
      notes
    )
    values (
      new.id,
      actor_id,
      null,
      new.status,
      history_notes
    );

    return new;
  end if;

  if new.status is distinct from old.status then
    history_notes := case
      when new.status = 'CANCELLED' then new.cancellation_reason
      else null
    end;

    insert into public.consultation_status_history (
      consultation_id,
      changed_by_user_id,
      from_status,
      to_status,
      notes
    )
    values (
      new.id,
      actor_id,
      old.status,
      new.status,
      history_notes
    );
  end if;

  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_roles_updated_at on public.roles;
create trigger set_roles_updated_at
before update on public.roles
for each row
execute function public.set_updated_at();

drop trigger if exists set_consultations_updated_at on public.consultations;
create trigger set_consultations_updated_at
before update on public.consultations
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_auth_user_created();

drop trigger if exists consultations_status_history_after_insert on public.consultations;
create trigger consultations_status_history_after_insert
after insert on public.consultations
for each row
execute function public.record_consultation_status_history();

drop trigger if exists consultations_status_history_after_status_update on public.consultations;
create trigger consultations_status_history_after_status_update
after update of status on public.consultations
for each row
when (new.status is distinct from old.status)
execute function public.record_consultation_status_history();

insert into public.profiles (
  id,
  email,
  first_name,
  last_name,
  created_at,
  updated_at
)
select
  auth_user.id,
  auth_user.email,
  coalesce(auth_user.raw_user_meta_data ->> 'first_name', auth_user.raw_user_meta_data ->> 'given_name'),
  coalesce(auth_user.raw_user_meta_data ->> 'last_name', auth_user.raw_user_meta_data ->> 'family_name'),
  coalesce(auth_user.created_at, timezone('utc', now())),
  timezone('utc', now())
from auth.users auth_user
on conflict (id) do update
set
  email = excluded.email,
  first_name = coalesce(public.profiles.first_name, excluded.first_name),
  last_name = coalesce(public.profiles.last_name, excluded.last_name),
  updated_at = timezone('utc', now());

insert into public.user_roles (user_id, role_id)
select auth_user.id, role.id
from auth.users auth_user
join public.roles role on role.name = 'student'
on conflict (user_id, role_id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_id_auth_users_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_id_auth_users_fkey
      foreign key (id)
      references auth.users (id)
      on delete cascade;
  end if;
end
$$;

alter table public.consultations drop constraint if exists consultations_completed_status_check;
alter table public.consultations
  add constraint consultations_completed_status_check
  check (is_completed = (status = 'COMPLETED'::"ConsultationStatus"));

alter table public.consultations drop constraint if exists consultations_cancelled_fields_check;
alter table public.consultations
  add constraint consultations_cancelled_fields_check
  check (
    (
      status = 'CANCELLED'::"ConsultationStatus"
      and cancelled_at is not null
    )
    or (
      status <> 'CANCELLED'::"ConsultationStatus"
      and cancelled_at is null
      and cancellation_reason is null
    )
  );

revoke all on table public.profiles from anon;
revoke all on table public.consultations from anon;
revoke all on table public.consultation_status_history from anon;
revoke all on table public.roles from anon, authenticated;
revoke all on table public.user_roles from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update on table public.consultations to authenticated;
grant select on table public.consultation_status_history to authenticated;

alter table public.profiles enable row level security;
alter table public.consultations enable row level security;
alter table public.consultation_status_history enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "consultations_select_own" on public.consultations;
create policy "consultations_select_own"
on public.consultations
for select
to authenticated
using (auth.uid() = student_id);

drop policy if exists "consultations_insert_own" on public.consultations;
create policy "consultations_insert_own"
on public.consultations
for insert
to authenticated
with check (auth.uid() = student_id);

drop policy if exists "consultations_update_own" on public.consultations;
create policy "consultations_update_own"
on public.consultations
for update
to authenticated
using (auth.uid() = student_id)
with check (auth.uid() = student_id);

drop policy if exists "consultations_admin_read_all" on public.consultations;
create policy "consultations_admin_read_all"
on public.consultations
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "consultation_history_select_own" on public.consultation_status_history;
create policy "consultation_history_select_own"
on public.consultation_status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.consultations consultation
    where consultation.id = consultation_status_history.consultation_id
      and consultation.student_id = auth.uid()
  )
);

drop policy if exists "consultation_history_admin_read_all" on public.consultation_status_history;
create policy "consultation_history_admin_read_all"
on public.consultation_status_history
for select
to authenticated
using (public.is_admin(auth.uid()));
