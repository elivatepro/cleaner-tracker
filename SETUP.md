# CleanTrack Setup

This doc shows where to add Supabase, Gmail, and Google Geocoding details so the app runs locally and in production.

## 1) Prerequisites
- Node.js 20+ with npm.
- A Supabase project.
- A Google Cloud project with Geocoding API enabled and billing.
- A Gmail account with 2-step verification and an App Password.

## 2) Create your local environment file
Create a `.env.local` file in the project root (never commit this file).

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google
GOOGLE_GEOCODING_API_KEY=

# Gmail (Nodemailer)
GMAIL_USER=
GMAIL_APP_PASSWORD=

# Branding (optional)
NEXT_PUBLIC_COMPANY_NAME=Elivate
NEXT_PUBLIC_PRIMARY_COLOR="#000000"
NEXT_PUBLIC_SECONDARY_COLOR="#FFFFFF"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Where to find each value:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Supabase dashboard -> Project Settings -> API.
  - Keep the service role key server-only.
- `GOOGLE_GEOCODING_API_KEY`
  - Google Cloud Console -> APIs and Services -> Credentials.
  - Enable Geocoding API and restrict the key to that API.
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`
  - Use a Gmail account with 2-step verification.
  - Create an App Password and paste it here (remove any spaces Gmail shows).
- `NEXT_PUBLIC_APP_URL`
  - Local dev: `http://localhost:3000`
  - Production: your deployed URL (used in invite links).

## 3) Supabase database and storage setup

### 3.1 Run the schema + RLS SQL
In the Supabase SQL editor, run the SQL from `supabase/migrations/001_initial_schema.sql`.

This creates the tables and the `app_settings` row used by the app.

### 3.2 Create the first admin user
Sign up in the app, then promote your user to admin:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'you@example.com';
```

### 3.3 Create storage buckets
Create these buckets in Supabase Storage:
- `checkout-photos` (private, used by checkout uploads).
- `avatars` (public, optional for profile photos).
- `company-assets` (public, optional for logos).

Recommended limits (from ARD.md):
- `checkout-photos`: 5MB, jpeg/png/webp.
- `avatars`: 2MB, jpeg/png/webp.
- `company-assets`: 2MB, jpeg/png/svg+xml/webp.

## 4) Gmail (Nodemailer)
CleanTrack sends invite and activity emails using Gmail SMTP.

Steps:
1. Enable 2-step verification on the Gmail account.
2. Create an App Password.
3. Set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `.env.local`.

## 5) Google Geocoding
The admin location form uses Google Geocoding.

Steps:
1. Enable Geocoding API in your Google Cloud project.
2. Create an API key and restrict it to Geocoding API.
3. Set `GOOGLE_GEOCODING_API_KEY` in `.env.local`.

## 6) Run locally
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 7) Production (Vercel)
Set the same environment variables in Vercel:
- Make sure `NEXT_PUBLIC_APP_URL` matches your production domain.
