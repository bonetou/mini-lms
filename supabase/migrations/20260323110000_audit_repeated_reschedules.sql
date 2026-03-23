create or replace function public.record_consultation_status_history()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  actor_id uuid;
  history_notes text;
  should_record_history boolean;
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

  should_record_history :=
    new.status is distinct from old.status
    or (
      new.status = 'RESCHEDULED'::"ConsultationStatus"
      and new.scheduled_at is distinct from old.scheduled_at
    );

  if should_record_history then
    history_notes := case
      when new.status = 'CANCELLED' then new.cancellation_reason
      when new.status = 'RESCHEDULED'::"ConsultationStatus"
        and new.scheduled_at is distinct from old.scheduled_at
      then format(
        'Rescheduled from %s UTC to %s UTC',
        to_char(old.scheduled_at at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS'),
        to_char(new.scheduled_at at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS')
      )
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

drop trigger if exists consultations_status_history_after_status_update on public.consultations;
create trigger consultations_status_history_after_status_update
after update of status, scheduled_at on public.consultations
for each row
when (
  new.status is distinct from old.status
  or (
    new.status = 'RESCHEDULED'::"ConsultationStatus"
    and new.scheduled_at is distinct from old.scheduled_at
  )
)
execute function public.record_consultation_status_history();
