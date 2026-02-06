# Cleaning Crew Tracker

Cleaning Crew Tracker is a Next.js (App Router) application for managing cleaning assignments, check-ins, and check-outs with Supabase for auth, data, storage, and email notifications. It includes admin dashboards, cleaner flows, and geofencing support.

## Features
- Auth with Supabase (email/password + invite tokens)
- Admin: manage locations, geofence radius, assignments, checklist items, settings
- Cleaner: view assignments, check in/out with geofence validation, upload checkout photos
- Email notifications: invites, check-in, check-out, assignment created (cleaner notified)
- Theming: dark UI with accent green, custom UI components (Button, Input, Card, Badge, Modal, Toast, Avatar, Slider)

## Tech Stack
- Next.js 16 (App Router) with React 19 and TypeScript
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Tailwind CSS (utility-first) and custom UI primitives in `src/components/ui`
- Nodemailer (Gmail SMTP) for email delivery

## Prerequisites
- Node.js 18+ and npm
- Supabase project with database + storage
- Gmail SMTP credentials (app password)

## Setup
1) Install dependencies
```bash
npm install
```

2) Environment variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GMAIL_USER=
GMAIL_APP_PASSWORD=

NEXT_PUBLIC_COMPANY_NAME=Elivate
NEXT_PUBLIC_PRIMARY_COLOR=#000000
NEXT_PUBLIC_SECONDARY_COLOR=#FFFFFF
NEXT_PUBLIC_APP_URL=
```

3) Supabase storage
- Create a bucket named `avatars` (public read or signed URLs) for profile photos.

4) Database migrations
- Apply migrations in `supabase/migrations/` to enable required policies (e.g., `002_profiles_update_policy.sql` allows users to update their own profile fields, including `avatar_url`).

## Scripts
- `npm run dev` – start Next.js dev server
- `npm run build` – production build
- `npm run start` – start built app
- `npm run lint` – run ESLint

## Key Workflows
### Auth & Profiles
- Login/Signup via Supabase; signup requires an invite token.
- Profile update API: `/api/cleaner/profile` updates `full_name`, `phone`, `avatar_url`.
- Avatar upload: client uploads to `avatars` bucket, stores public URL in profile.

### Assignments
- Admin creates assignments via `/api/admin/assignments`.
- On assignment creation, cleaner receives an email with location name/address (uses `sendAssignmentEmail`).

### Checklist Items
- Admin can bulk-add default checklist items by entering multiple lines in the modal; API accepts `labels` array.

### Geofencing
- Client geofence check before check-in; server re-validates in check-in/checkout routes using Haversine.

## Troubleshooting
- **Avatar upload fails / RLS**: Ensure `supabase/migrations/002_profiles_update_policy.sql` is applied and `avatars` bucket exists with correct policy.
- **Emails not sent**: Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set and less-secure-app restrictions are handled (use app password).
- **Assignment email missing**: Check logs for “Assignment email error”; ensure cleaner has an email and SMTP env vars are set.
- **Geofence slider visibility**: Uses custom CSS under `.app-slider`; ensure global styles are loaded (`src/app/globals.css`).

## Development Notes
- UI components live in `src/components/ui/` and must be used instead of raw HTML for buttons, inputs, etc.
- App Router only; no Pages Router APIs.
- Avoid hardcoded hex values; use Tailwind tokens.
- Lint may show unused-import warnings in some files; clean as needed before release.

## Current State
- Multi-add checklist modal implemented.
- Assignment email notifications implemented.
- Profile photo upload supported; requires bucket + RLS migration.

## Repo Status
This workspace currently is not a git repository (no commits/pushes performed here). If you need VCS integration, initialize git, add a remote, then commit and push.
