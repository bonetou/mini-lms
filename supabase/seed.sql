-- Local demo credentials
-- admin@mini-lms.local / Password123!
-- student@mini-lms.local / Password123!
-- student.two@mini-lms.local / Password123!

-- Stable demo user ids keep seeded relationships deterministic.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  is_super_admin,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'admin@mini-lms.local',
    false,
    crypt('Password123!', gen_salt('bf')),
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Ada","last_name":"Admin"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'student@mini-lms.local',
    false,
    crypt('Password123!', gen_salt('bf')),
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Sam","last_name":"Student"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'student.two@mini-lms.local',
    false,
    crypt('Password123!', gen_salt('bf')),
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Taylor","last_name":"Student"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  )
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  last_sign_in_at = excluded.last_sign_in_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = timezone('utc', now());

insert into auth.identities (
  id,
  provider_id,
  provider,
  user_id,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    'email',
    '00000000-0000-4000-8000-000000000001',
    '{"sub":"00000000-0000-4000-8000-000000000001","email":"admin@mini-lms.local","email_verified":true}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000002',
    'email',
    '00000000-0000-4000-8000-000000000002',
    '{"sub":"00000000-0000-4000-8000-000000000002","email":"student@mini-lms.local","email_verified":true}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000003',
    'email',
    '00000000-0000-4000-8000-000000000003',
    '{"sub":"00000000-0000-4000-8000-000000000003","email":"student.two@mini-lms.local","email_verified":true}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (provider_id, provider) do update
set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at = timezone('utc', now());

-- Keep profile rows aligned even if the seed is re-run without a full reset.
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
where auth_user.id in (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003'
)
on conflict (id) do update
set
  email = excluded.email,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  updated_at = timezone('utc', now());

insert into public.user_roles (user_id, role_id)
select seed_roles.user_id, roles.id
from (
  values
    ('00000000-0000-4000-8000-000000000001'::uuid, 'admin'),
    ('00000000-0000-4000-8000-000000000001'::uuid, 'student'),
    ('00000000-0000-4000-8000-000000000002'::uuid, 'student'),
    ('00000000-0000-4000-8000-000000000003'::uuid, 'student')
) as seed_roles(user_id, role_name)
join public.roles on public.roles.name = seed_roles.role_name
on conflict (user_id, role_id) do nothing;

-- Reset demo consultation data to keep the seed deterministic.
delete from public.consultation_status_history
where consultation_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005'
);

delete from public.consultations
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005'
);

insert into public.consultations (
  id,
  student_id,
  student_first_name,
  student_last_name,
  reason,
  scheduled_at,
  status,
  is_completed,
  cancelled_at,
  cancellation_reason,
  created_at,
  updated_at
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'Sam',
    'Student',
    'Need help preparing for the algebra midterm.',
    timezone('utc', now()) + interval '2 days',
    'SCHEDULED',
    false,
    null,
    null,
    timezone('utc', now()) - interval '7 days',
    timezone('utc', now()) - interval '7 days'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000002',
    'Sam',
    'Student',
    'Reviewing essay feedback before resubmission.',
    timezone('utc', now()) + interval '1 day',
    'SCHEDULED',
    false,
    null,
    null,
    timezone('utc', now()) - interval '6 days',
    timezone('utc', now()) - interval '6 days'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000002',
    'Sam',
    'Student',
    'Missed lab concepts and need a recap session.',
    timezone('utc', now()) + interval '4 days',
    'SCHEDULED',
    false,
    null,
    null,
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '5 days'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    '00000000-0000-4000-8000-000000000002',
    'Sam',
    'Student',
    'Weekly project check-in and blocker review.',
    timezone('utc', now()) - interval '2 days',
    'SCHEDULED',
    false,
    null,
    null,
    timezone('utc', now()) - interval '10 days',
    timezone('utc', now()) - interval '10 days'
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    '00000000-0000-4000-8000-000000000003',
    'Taylor',
    'Student',
    'Initial onboarding consultation for a new student.',
    timezone('utc', now()) + interval '3 days',
    'SCHEDULED',
    false,
    null,
    null,
    timezone('utc', now()) - interval '3 days',
    timezone('utc', now()) - interval '3 days'
  );

-- Produce realistic history for non-trivial consultation states.
update public.consultations
set
  status = 'RESCHEDULED',
  scheduled_at = timezone('utc', now()) + interval '5 days',
  updated_at = timezone('utc', now()) - interval '1 day'
where id = '10000000-0000-4000-8000-000000000002';

update public.consultations
set
  status = 'CANCELLED',
  cancelled_at = timezone('utc', now()) - interval '12 hours',
  cancellation_reason = 'Student is out sick and requested to cancel.',
  updated_at = timezone('utc', now()) - interval '12 hours'
where id = '10000000-0000-4000-8000-000000000003';

update public.consultations
set
  status = 'COMPLETED',
  is_completed = true,
  updated_at = timezone('utc', now()) - interval '1 day'
where id = '10000000-0000-4000-8000-000000000004';
