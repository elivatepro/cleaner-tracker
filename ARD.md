# Architecture Requirements Document (ARD)
# CleanTrack — Technical Architecture

**Version:** 1.0  
**Date:** February 5, 2026  
**Author:** Boko Isaac  
**Status:** Draft

---

## 1. System Architecture Overview

CleanTrack is a Next.js Progressive Web App deployed on Vercel, backed by Supabase (PostgreSQL database, auth, and file storage), with Gmail SMTP for transactional emails and Google Geocoding API for address-to-coordinate conversion.

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser/PWA)                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Cleaner App   │  │ Admin Panel  │  │ Browser Geoloc.   │  │
│  │ (Next.js)     │  │ (Next.js)    │  │ API               │  │
│  └──────┬────────┘  └──────┬───────┘  └──────┬────────────┘  │
│         │                  │                  │               │
│         │     Haversine distance calc         │               │
│         │     (client-side)                   │               │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  │
┌─────────────────────────────────────────┐     │
│            VERCEL (Hosting)              │     │
│                                          │     │
│  ┌────────────────────────────────────┐  │     │
│  │     Next.js App Router             │  │     │
│  │     (Server Components + API       │  │     │
│  │      Routes)                       │  │     │
│  └──────────────┬─────────────────────┘  │     │
│                 │                         │     │
│  ┌──────────────┼─────────────────────┐  │     │
│  │ API Routes   │                     │  │     │
│  │ /api/auth/*  │ /api/locations/*    │  │     │
│  │ /api/invite  │ /api/assignments/*  │  │     │
│  │ /api/checkin │ /api/checkout       │  │     │
│  │ /api/admin/* │ /api/export         │  │     │
│  └──────┬───────┴─────────┬───────────┘  │     │
└─────────┼─────────────────┼──────────────┘     │
          │                 │                     │
          ▼                 ▼                     │
┌──────────────────┐ ┌──────────────┐             │
│   SUPABASE       │ │  EXTERNAL    │             │
│                  │ │  SERVICES    │             │
│ ┌──────────────┐ │ │              │             │
│ │ PostgreSQL   │ │ │ ┌──────────┐ │             │
│ │ Database     │ │ │ │ Google   │ │             │
│ └──────────────┘ │ │ │ Geocode  │ │             │
│ ┌──────────────┐ │ │ │ API      │ │             │
│ │ Auth         │ │ │ └──────────┘ │             │
│ └──────────────┘ │ │ ┌──────────┐ │             │
│ ┌──────────────┐ │ │ │ Gmail    │ │             │
│ │ Storage      │ │ │ │ SMTP     │ │             │
│ │ (Photos/     │ │ │ │(Nodemail)│ │             │
│ │  Avatars)    │ │ │ └──────────┘ │             │
│ └──────────────┘ │ └──────────────┘             │
└──────────────────┘                              │
```

### 1.2 Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14+ (App Router) | SSR, routing, PWA shell |
| Styling | Tailwind CSS | Utility-first CSS |
| Database | Supabase (PostgreSQL) | Data storage, RLS |
| Auth | Supabase Auth | Session management, JWT |
| File Storage | Supabase Storage | Photos, profile pictures, logo |
| Hosting | Vercel | Deployment, serverless functions |
| Email | Nodemailer + Gmail SMTP | Transactional emails |
| Geocoding | Google Geocoding API | Address → coordinates |
| Geofencing | Browser Geolocation API + Haversine | GPS capture + distance calc |

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   profiles    │     │   assignments    │     │   locations      │
│──────────────│     │──────────────────│     │──────────────────│
│ id (PK/FK)   │◄────│ cleaner_id (FK)  │     │ id (PK)          │
│ full_name    │     │ location_id (FK) │────►│ name             │
│ email        │     │ created_at       │     │ address          │
│ phone        │     │ is_active        │     │ latitude         │
│ role         │     └──────────────────┘     │ longitude        │
│ avatar_url   │                              │ geofence_radius  │
│ is_active    │     ┌──────────────────┐     │ is_active        │
│ invited_by   │     │   checkins       │     └──────┬───────────┘
│ created_at   │     │──────────────────│            │
└──────┬───────┘     │ id (PK)          │            │
       │             │ cleaner_id (FK)  │◄───────────┘
       │             │ location_id (FK) │
       │             │ checkin_time     │     ┌──────────────────┐
       └────────────►│ checkin_lat      │     │ checklist_items  │
                     │ checkin_lng      │     │──────────────────│
                     │ checkout_time    │     │ id (PK)          │
                     │ checkout_lat     │     │ label            │
                     │ checkout_lng     │     │ is_default       │
                     │ checkin_within   │     │ location_id (FK) │
                     │ checkout_within  │     │ sort_order       │
                     │ remarks         │     │ is_active        │
                     │ status          │     └──────────────────┘
                     │ created_at      │
                     └──────┬──────────┘     ┌──────────────────┐
                            │                │ checkout_photos   │
                            │                │──────────────────│
                     ┌──────┴──────────┐     │ id (PK)          │
                     │ checkout_tasks  │     │ checkin_id (FK)  │
                     │────────────────│     │ photo_url        │
                     │ id (PK)        │     │ created_at       │
                     │ checkin_id (FK) │     └──────────────────┘
                     │ item_id (FK)   │
                     │ is_completed   │     ┌──────────────────┐
                     └────────────────┘     │ invitations      │
                                            │──────────────────│
                                            │ id (PK)          │
                                            │ email            │
                                            │ token            │
                                            │ invited_by (FK)  │
                                            │ expires_at       │
                                            │ accepted_at      │
                                            │ created_at       │
                                            └──────────────────┘

                     ┌──────────────────┐
                     │ app_settings     │
                     │──────────────────│
                     │ id (PK)          │
                     │ company_name     │
                     │ logo_url         │
                     │ primary_color    │
                     │ secondary_color  │
                     │ default_radius   │
                     │ notify_checkin   │
                     │ notify_checkout  │
                     │ updated_at       │
                     └──────────────────┘
```

### 2.2 Table Definitions

#### `profiles`
Extends Supabase Auth `auth.users`. Created via trigger on user signup.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cleaner' CHECK (role IN ('admin', 'cleaner')),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cleaner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### `locations`

```sql
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geofence_radius INTEGER NOT NULL DEFAULT 200, -- meters
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `assignments`

```sql
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cleaner_id, location_id)
);
```

#### `checkins`

```sql
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id UUID NOT NULL REFERENCES public.profiles(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  checkin_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  checkin_lat DOUBLE PRECISION NOT NULL,
  checkin_lng DOUBLE PRECISION NOT NULL,
  checkin_within_geofence BOOLEAN NOT NULL DEFAULT true,
  checkout_time TIMESTAMPTZ,
  checkout_lat DOUBLE PRECISION,
  checkout_lng DOUBLE PRECISION,
  checkout_within_geofence BOOLEAN,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'checked_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX idx_checkins_cleaner ON public.checkins(cleaner_id, checkin_time DESC);
CREATE INDEX idx_checkins_location ON public.checkins(location_id, checkin_time DESC);
CREATE INDEX idx_checkins_status ON public.checkins(status) WHERE status = 'checked_in';
```

#### `checklist_items`

```sql
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Default items have no location_id, custom items have one
  CONSTRAINT chk_default_or_location CHECK (
    (is_default = true AND location_id IS NULL) OR
    (is_default = false AND location_id IS NOT NULL)
  )
);
```

#### `checkout_tasks`

```sql
CREATE TABLE public.checkout_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL REFERENCES public.checkins(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.checklist_items(id),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(checkin_id, checklist_item_id)
);
```

#### `checkout_photos`

```sql
CREATE TABLE public.checkout_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL REFERENCES public.checkins(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `invitations`

```sql
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '72 hours'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_token ON public.invitations(token) WHERE accepted_at IS NULL;
```

#### `app_settings`

```sql
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Elivate',
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#000000',
  secondary_color TEXT NOT NULL DEFAULT '#FFFFFF',
  default_geofence_radius INTEGER NOT NULL DEFAULT 200,
  notify_on_checkin BOOLEAN NOT NULL DEFAULT true,
  notify_on_checkout BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial settings (single row, always id = 1 pattern)
INSERT INTO public.app_settings (company_name) VALUES ('Elivate');
```

### 2.3 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- LOCATIONS
CREATE POLICY "Anyone can view active locations" ON public.locations
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage locations" ON public.locations
  FOR ALL USING (public.get_user_role() = 'admin');

-- ASSIGNMENTS
CREATE POLICY "Cleaners see own assignments" ON public.assignments
  FOR SELECT USING (cleaner_id = auth.uid() OR public.get_user_role() = 'admin');
CREATE POLICY "Admins manage assignments" ON public.assignments
  FOR ALL USING (public.get_user_role() = 'admin');

-- CHECKINS
CREATE POLICY "Cleaners see own checkins" ON public.checkins
  FOR SELECT USING (cleaner_id = auth.uid() OR public.get_user_role() = 'admin');
CREATE POLICY "Cleaners can create own checkins" ON public.checkins
  FOR INSERT WITH CHECK (cleaner_id = auth.uid());
CREATE POLICY "Cleaners can update own checkins" ON public.checkins
  FOR UPDATE USING (cleaner_id = auth.uid());
CREATE POLICY "Admins can view all checkins" ON public.checkins
  FOR SELECT USING (public.get_user_role() = 'admin');

-- CHECKLIST_ITEMS
CREATE POLICY "Anyone can view checklist items" ON public.checklist_items
  FOR SELECT USING (true);
CREATE POLICY "Admins manage checklist items" ON public.checklist_items
  FOR ALL USING (public.get_user_role() = 'admin');

-- CHECKOUT_TASKS
CREATE POLICY "Cleaners manage own checkout tasks" ON public.checkout_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.checkins WHERE id = checkin_id AND cleaner_id = auth.uid())
    OR public.get_user_role() = 'admin'
  );

-- CHECKOUT_PHOTOS
CREATE POLICY "Cleaners manage own photos" ON public.checkout_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.checkins WHERE id = checkin_id AND cleaner_id = auth.uid())
    OR public.get_user_role() = 'admin'
  );

-- INVITATIONS
CREATE POLICY "Admins manage invitations" ON public.invitations
  FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Anyone can read invite by token" ON public.invitations
  FOR SELECT USING (true); -- Token lookup needed during signup

-- APP_SETTINGS
CREATE POLICY "Anyone can view settings" ON public.app_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.app_settings
  FOR UPDATE USING (public.get_user_role() = 'admin');
```

### 2.4 Supabase Storage Buckets

```
Bucket: avatars
  - Public: true
  - Max file size: 2MB
  - Allowed types: image/jpeg, image/png, image/webp
  - Path pattern: {user_id}/avatar.{ext}

Bucket: checkout-photos
  - Public: false (signed URLs for access)
  - Max file size: 5MB
  - Allowed types: image/jpeg, image/png, image/webp
  - Path pattern: {checkin_id}/{photo_id}.{ext}

Bucket: company-assets
  - Public: true
  - Max file size: 2MB
  - Allowed types: image/jpeg, image/png, image/svg+xml, image/webp
  - Path pattern: logo.{ext}
```

---

## 3. API Design

All API routes are Next.js API routes (App Router) at `/app/api/`.

### 3.1 Authentication Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register new cleaner | Public (with invite token) |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/logout` | Logout | Authenticated |

### 3.2 Admin Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Dashboard stats | Admin |
| GET | `/api/admin/cleaners` | List all cleaners | Admin |
| PATCH | `/api/admin/cleaners/[id]` | Update cleaner (activate/deactivate) | Admin |
| POST | `/api/admin/invite` | Send invitation email | Admin |
| GET | `/api/admin/locations` | List all locations | Admin |
| POST | `/api/admin/locations` | Create location (triggers geocoding) | Admin |
| PATCH | `/api/admin/locations/[id]` | Update location | Admin |
| GET | `/api/admin/assignments` | List all assignments | Admin |
| POST | `/api/admin/assignments` | Create assignment | Admin |
| DELETE | `/api/admin/assignments/[id]` | Remove assignment | Admin |
| GET | `/api/admin/checklist` | List all checklist items | Admin |
| POST | `/api/admin/checklist` | Add checklist item | Admin |
| PATCH | `/api/admin/checklist/[id]` | Update checklist item | Admin |
| DELETE | `/api/admin/checklist/[id]` | Deactivate checklist item | Admin |
| GET | `/api/admin/activity` | Activity log (with filters) | Admin |
| GET | `/api/admin/activity/[id]` | Activity detail | Admin |
| GET | `/api/admin/export` | Export CSV | Admin |
| GET | `/api/admin/settings` | Get app settings | Admin |
| PATCH | `/api/admin/settings` | Update app settings | Admin |

### 3.3 Cleaner Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/cleaner/assignments` | Get my assignments | Cleaner |
| POST | `/api/cleaner/checkin` | Check in at location | Cleaner |
| POST | `/api/cleaner/checkout` | Check out (with checklist, photos, remarks) | Cleaner |
| GET | `/api/cleaner/active` | Get current active check-in | Cleaner |
| GET | `/api/cleaner/history` | Get own activity history | Cleaner |
| PATCH | `/api/cleaner/profile` | Update own profile | Cleaner |

### 3.4 Public Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/invite/[token]` | Validate invite token | Public |
| GET | `/api/settings/public` | Get company name, logo, colors | Public |

### 3.5 Key API Flows

#### Check-in Flow
```
Client                          Server                         Supabase
  │                               │                              │
  │  POST /api/cleaner/checkin    │                              │
  │  { location_id,               │                              │
  │    lat, lng }                 │                              │
  │──────────────────────────────►│                              │
  │                               │  Verify user is assigned     │
  │                               │  to this location            │
  │                               │─────────────────────────────►│
  │                               │◄─────────────────────────────│
  │                               │                              │
  │                               │  Get location coords &       │
  │                               │  geofence radius             │
  │                               │─────────────────────────────►│
  │                               │◄─────────────────────────────│
  │                               │                              │
  │                               │  Calculate Haversine distance│
  │                               │  (server-side validation)    │
  │                               │                              │
  │                               │  if distance > radius:       │
  │  { error: "outside_geofence", │  return 403                  │
  │    distance, radius }         │                              │
  │◄──────────────────────────────│                              │
  │                               │                              │
  │                               │  if within radius:           │
  │                               │  INSERT checkin record       │
  │                               │─────────────────────────────►│
  │                               │◄─────────────────────────────│
  │                               │                              │
  │                               │  Send confirmation email     │
  │                               │  (async, non-blocking)       │
  │                               │                              │
  │  { success, checkin_id,       │                              │
  │    checkin_time }             │                              │
  │◄──────────────────────────────│                              │
```

#### Check-out Flow
```
Client                          Server                         Supabase
  │                               │                              │
  │  POST /api/cleaner/checkout   │                              │
  │  { checkin_id, lat, lng,      │                              │
  │    tasks: [{item_id,          │                              │
  │      completed}],             │                              │
  │    remarks,                   │                              │
  │    photo_urls[] }             │                              │
  │──────────────────────────────►│                              │
  │                               │  Verify checkin belongs      │
  │                               │  to this user                │
  │                               │─────────────────────────────►│
  │                               │◄─────────────────────────────│
  │                               │                              │
  │                               │  Calculate geofence distance │
  │                               │  (log warning if outside)    │
  │                               │                              │
  │                               │  UPDATE checkin record       │
  │                               │  (checkout_time, coords,     │
  │                               │   geofence status, remarks)  │
  │                               │─────────────────────────────►│
  │                               │◄─────────────────────────────│
  │                               │                              │
  │                               │  INSERT checkout_tasks       │
  │                               │  INSERT checkout_photos      │
  │                               │─────────────────────────────►│
  │                               │◄─────────────────────────────│
  │                               │                              │
  │                               │  Send confirmation email     │
  │                               │                              │
  │  { success, duration,         │                              │
  │    tasks_completed }          │                              │
  │◄──────────────────────────────│                              │
```

---

## 4. Geofencing Implementation

### 4.1 Haversine Formula

The distance between two GPS coordinates is calculated using the Haversine formula. This runs both client-side (for immediate UI feedback) and server-side (for validation).

```typescript
// lib/geofence.ts

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function isWithinGeofence(
  userLat: number, userLng: number,
  locationLat: number, locationLng: number,
  radiusMeters: number
): { within: boolean; distance: number } {
  const distance = haversineDistance(userLat, userLng, locationLat, locationLng);
  return {
    within: distance <= radiusMeters,
    distance: Math.round(distance)
  };
}
```

### 4.2 GPS Capture (Client-side)

```typescript
// lib/geolocation.ts

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000, // Accept cached position up to 30s old
    });
  });
}
```

### 4.3 Dual Validation Strategy

- **Client-side**: Immediate feedback — show distance, enable/disable check-in button
- **Server-side**: Authoritative validation — recalculate distance on the API route before recording the check-in. This prevents spoofed GPS coordinates from bypassing the geofence.

---

## 5. Email System

### 5.1 Nodemailer Configuration

```typescript
// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password, NOT account password
  },
});
```

### 5.2 Email Templates

| Email | Trigger | Recipients | Content |
|---|---|---|---|
| Invitation | Admin invites cleaner | New cleaner | Company name, signup link, 72hr expiry |
| Check-in Confirmation | Successful check-in | Cleaner, Admin (if enabled) | Location, time |
| Check-out Confirmation | Successful checkout | Cleaner, Admin (if enabled) | Location, duration, task summary |

### 5.3 Email Sending Strategy

- Emails are sent asynchronously (fire-and-forget) from API routes
- Email failures do not block the check-in/checkout response
- Failed emails are logged to console (no retry queue for MVP)

---

## 6. Google Geocoding Integration

### 6.1 Usage

Called only when:
1. Admin creates a new location (address → lat/lng)
2. Admin updates a location's address

### 6.2 Implementation

```typescript
// lib/geocode.ts

export async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  formatted_address: string;
} | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_GEOCODING_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status === 'OK' && data.results.length > 0) {
    const result = data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formatted_address: result.formatted_address,
    };
  }
  return null;
}
```

### 6.3 Cost Consideration

Google Geocoding API: ~$5 per 1,000 requests. Typical usage is minimal (only when locations are created/updated). Expected cost: <$1/month per client.

---

## 7. Project Structure

```
cleantrack/
├── .env.local                    # Environment variables
├── next.config.js
├── tailwind.config.ts
├── manifest.json                 # PWA manifest
├── public/
│   ├── icons/                    # PWA icons (192x192, 512x512)
│   ├── sw.js                     # Service worker (basic caching)
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout (branded loader, PWA meta)
│   │   ├── page.tsx              # Landing / redirect
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx          # Handles invite token
│   │   ├── cleaner/
│   │   │   ├── layout.tsx        # Cleaner shell (nav, session check)
│   │   │   ├── page.tsx          # Dashboard (today's assignment, check-in)
│   │   │   ├── checkin/
│   │   │   │   └── page.tsx      # Check-in flow
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx      # Checkout flow (checklist, photos, remarks)
│   │   │   ├── history/
│   │   │   │   └── page.tsx      # Activity history
│   │   │   └── profile/
│   │   │       └── page.tsx      # Edit profile, avatar
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Admin shell (sidebar nav, session check)
│   │   │   ├── page.tsx          # Dashboard overview
│   │   │   ├── cleaners/
│   │   │   │   ├── page.tsx      # Cleaner list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Cleaner detail + history
│   │   │   ├── locations/
│   │   │   │   ├── page.tsx      # Location list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Location detail + checklist
│   │   │   ├── assignments/
│   │   │   │   └── page.tsx      # Manage assignments
│   │   │   ├── checklist/
│   │   │   │   └── page.tsx      # Default checklist management
│   │   │   ├── activity/
│   │   │   │   ├── page.tsx      # Activity log with filters
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Activity detail
│   │   │   └── settings/
│   │   │       └── page.tsx      # App settings
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── signup/route.ts
│   │       │   ├── login/route.ts
│   │       │   └── logout/route.ts
│   │       ├── admin/
│   │       │   ├── dashboard/route.ts
│   │       │   ├── cleaners/route.ts
│   │       │   ├── cleaners/[id]/route.ts
│   │       │   ├── invite/route.ts
│   │       │   ├── locations/route.ts
│   │       │   ├── locations/[id]/route.ts
│   │       │   ├── assignments/route.ts
│   │       │   ├── assignments/[id]/route.ts
│   │       │   ├── checklist/route.ts
│   │       │   ├── checklist/[id]/route.ts
│   │       │   ├── activity/route.ts
│   │       │   ├── activity/[id]/route.ts
│   │       │   ├── export/route.ts
│   │       │   └── settings/route.ts
│   │       ├── cleaner/
│   │       │   ├── assignments/route.ts
│   │       │   ├── checkin/route.ts
│   │       │   ├── checkout/route.ts
│   │       │   ├── active/route.ts
│   │       │   ├── history/route.ts
│   │       │   └── profile/route.ts
│   │       ├── invite/
│   │       │   └── [token]/route.ts
│   │       └── settings/
│   │           └── public/route.ts
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Toast.tsx
│   │   ├── BrandedLoader.tsx     # Splash screen with logo spinner
│   │   ├── GeofenceStatus.tsx    # Distance indicator
│   │   ├── ChecklistForm.tsx     # Checkout checklist component
│   │   ├── PhotoUploader.tsx     # Photo capture/upload
│   │   ├── ActivityTable.tsx     # Shared activity table
│   │   └── CSVExport.tsx         # CSV export button
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client
│   │   │   └── admin.ts          # Service role client
│   │   ├── geofence.ts           # Haversine formula
│   │   ├── geolocation.ts        # Browser GPS capture
│   │   ├── geocode.ts            # Google Geocoding API
│   │   ├── email.ts              # Nodemailer setup + templates
│   │   └── utils.ts              # Shared utilities
│   ├── hooks/
│   │   ├── useGeolocation.ts     # GPS hook with error handling
│   │   ├── useAuth.ts            # Auth state hook
│   │   └── useSettings.ts        # App settings hook
│   └── types/
│       └── index.ts              # TypeScript interfaces
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── seed.sql                  # Default admin + sample data
```

---

## 8. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google
GOOGLE_GEOCODING_API_KEY=AIza...

# Gmail (Nodemailer)
GMAIL_USER=company@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# App Branding (overrides DB settings for initial load)
NEXT_PUBLIC_COMPANY_NAME=Elivate
NEXT_PUBLIC_PRIMARY_COLOR=#000000
NEXT_PUBLIC_SECONDARY_COLOR=#FFFFFF

# App URL (for invitation links)
NEXT_PUBLIC_APP_URL=https://cleantrack.vercel.app
```

---

## 9. Security Considerations

### 9.1 Authentication
- Supabase Auth with JWT tokens
- Session stored in httpOnly cookies (Supabase SSR helpers)
- API routes validate session before processing

### 9.2 Authorization
- RLS policies enforce role-based access at the database level
- API routes perform secondary role checks before mutations
- Admin routes reject non-admin users with 403

### 9.3 GPS Spoofing Mitigation
- Server-side geofence validation (dual validation)
- Log all coordinates regardless of geofence result
- Admin can review geofence violation flags in activity log
- Note: Determined users can still spoof GPS. This is a deterrent, not a guarantee.

### 9.4 Invite Token Security
- 32-byte cryptographically random tokens
- 72-hour expiry
- Single-use (marked as accepted after signup)
- Token validation on both client and server

### 9.5 File Upload Security
- File type validation (images only)
- File size limits enforced (2MB avatars, 5MB photos)
- Supabase Storage policies restrict access by role

---

## 10. Deployment

### 10.1 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "GOOGLE_GEOCODING_API_KEY": "@google-geocoding-key",
    "GMAIL_USER": "@gmail-user",
    "GMAIL_APP_PASSWORD": "@gmail-app-password"
  }
}
```

### 10.2 New Client Deployment Steps

1. Create new Supabase project
2. Run migration SQL (`001_initial_schema.sql`)
3. Run seed SQL (creates admin account)
4. Configure Supabase Storage buckets
5. Fork/clone repo
6. Update `.env.local` with new credentials
7. Deploy to Vercel
8. Set environment variables in Vercel dashboard
9. Configure custom domain (optional)

---

## 11. Performance Considerations

- Server Components by default (reduce client JS bundle)
- Client Components only for interactive parts (check-in button, forms, map)
- Image optimization via Next.js `<Image>` component
- Lazy load non-critical components (photo uploader, activity table)
- Database indexes on common query patterns (cleaner_id, location_id, status, time)
- Pagination for activity logs (20 items per page)
