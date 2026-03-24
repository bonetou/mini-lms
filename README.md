# Mini LMS

Contour SWE technical assessment implementation using Next.js, TypeScript, and Supabase.

## Stack

- Next.js App Router
- TypeScript
- Supabase
  - PostgreSQL
  - `@supabase/supabase-js`
  - `@supabase/ssr`
- TanStack Query
- Tailwind CSS
- shadcn/ui primitives

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- Docker

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create `.env.local` from `.env.example`.

For local Supabase, use values from `npm run supabase:status`.

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` should point to the local API when running Supabase locally.
- `SUPABASE_SERVICE_ROLE_KEY` is required for admin/service-role reads.
- keep service-role credentials server-only.

## Running Supabase Locally

This repo includes a local Supabase project under `supabase/`.

### Start the local stack

```bash
npm run supabase:start
```

### Show local URLs and keys

```bash
npm run supabase:status
```

Default local ports from `supabase/config.toml`:

- API: `http://localhost:54321`
- DB: `54322`
- Studio: `http://127.0.0.1:54323`
- Inbucket: `http://localhost:54324`

### Apply migrations locally

Clean rebuild:

```bash
npm run supabase:db:reset
```

Apply only pending local migrations:

```bash
npm run supabase:migration:up
```

Important distinction:

- `npm run supabase:db:push` targets a linked remote project.
- `npm run supabase:db:push:local` explicitly targets the local database.

### Generate local database types

```bash
npm run supabase:types
```

This writes generated types to `lib/types/database.ts`.

## Running the App

After local Supabase is running and `.env.local` is configured:

```bash
npm run dev
```

App URL:

- `http://localhost:3000`

Suggested local workflow:

```bash
npm install
npm run supabase:start
npm run supabase:db:reset
npm run supabase:status
npm run dev
```

## Running tests
```bash
npm run test
```

## Lint
```bash
npm run lint
```

## Assumptions and Justifications

- This is a consultation-focused "mini LMS", not a full coursework/productivity LMS.
- The admin surface is read-only by design. That is enough to demonstrate RBAC without introducing unnecessary mutation paths.
- First name and last name are collected at account creation, not on every consultation booking.
  - Each consultation stores a snapshot of `student_first_name` and `student_last_name` at creation time.
  - This keeps booking simpler while still preserving the student identity on the consultation record.
- Supabase Auth plus database triggers were used to bootstrap `profiles` and default student roles automatically.
- Audit history is database-driven via triggers so history is not dependent on a specific frontend flow or backend logic implementation.
- Time zones are not handled in this implementation. Ideally we could have a profile setting for preferred time zone for each user.
- Cancellation and rescheduling policies are simplified, there are no cutoff windows, penalties, or approval workflows.
- We are assuming that there is no maximum capacity for consultations, on real life there may be limits like: 
   - max number of students per consultation
   - max number of consultations per time slot
   - max number of consultations per teacher
   - max number of consultations per student in a given time period or based on his plan subscription
   - max number of students on the classroom (physical constraint)
- 




## If I Had More Time

- add database-level protections against double booking, such as stronger transactional booking guarantees and conflict constraints around time-slot reservation
- introduce a background job queue for asynchronous work like reminder emails, cancellation notifications, and calendar synchronization retries
- precompute or cache availability windows so slot search does not become expensive as the number of users, consultations, and schedule rules grows
- add idempotency protection for booking and rescheduling requests so retries or duplicate submissions cannot create inconsistent state
- add rate limiting and abuse protection for auth, booking, and rescheduling endpoints
- observability: add structured logging, metrics, integration with monitoring tools such as Sentry or Datadog, and database query performance tracking
