# Product Requirements Document (PRD)
# CleanTrack — Cleaner Check-in & Tracking Web App

**Version:** 1.0  
**Date:** February 5, 2026  
**Author:** Boko Isaac  
**Status:** Draft  
**Brand:** Elivate (white-label, easily rebrandable)

---

## 1. Executive Summary

CleanTrack is a lightweight Progressive Web App (PWA) designed for cleaning companies to track their field workers. The app enables cleaners to check in and check out of job locations with GPS-verified geofencing, ensuring workers are physically present at assigned locations. An admin panel allows business owners to manage cleaners, locations, assignments, and view activity reports.

The app is built as a single-tenant deployment — one Supabase project per client — making it easy to replicate for multiple cleaning businesses by swapping environment variables.

---

## 2. Problem Statement

Cleaning companies need a reliable, simple way to verify that their cleaners are physically at the correct job locations and have completed required tasks. Current methods (phone calls, trust-based systems) are unreliable and don't provide auditable records. Cleaners need a frictionless way to log their work, and admins need visibility into operations without micromanaging.

---

## 3. Goals & Objectives

- Verify cleaner presence at job locations using GPS geofencing
- Provide a dead-simple check-in/check-out flow for cleaners
- Give admins full visibility into cleaner activities
- Enable task verification through checklists at checkout
- Support photo evidence and remarks at checkout
- Keep the interface minimal and fast — cleaners should spend seconds, not minutes
- Make the app easily deployable for multiple clients (env-based config)

---

## 4. Target Users

### 4.1 Cleaner (Field Worker)
- Primarily mobile users (smartphones)
- Varying technical ability — interface must be extremely simple
- Uses the app at each job location (check in, do work, check out)
- Needs quick access — PWA installed on home screen

### 4.2 Admin (Business Owner / Manager)
- Desktop or tablet user primarily
- Manages cleaners, locations, assignments
- Reviews activity logs, exports reports
- Sends invitations to new cleaners

---

## 5. User Roles & Permissions

| Capability | Admin | Cleaner |
|---|---|---|
| View admin dashboard | ✅ | ❌ |
| Add/manage locations | ✅ | ❌ |
| Set geofence radius per location | ✅ | ❌ |
| Invite/manage cleaners | ✅ | ❌ |
| Assign cleaners to locations | ✅ | ❌ |
| Manage default & custom checklists | ✅ | ❌ |
| View all activity logs | ✅ | ❌ |
| Export activity data (CSV) | ✅ | ❌ |
| Check in/out at locations | ❌ | ✅ |
| Complete checkout checklists | ❌ | ✅ |
| Upload photos at checkout | ❌ | ✅ |
| Leave remarks/comments | ❌ | ✅ |
| View own activity history | ❌ | ✅ |
| Update own profile/picture | ❌ | ✅ |

---

## 6. Feature Requirements

### 6.1 Authentication & Onboarding

**FR-AUTH-01: Cleaner Registration**
- Cleaner signs up with: full name, email, phone number, password
- Optional profile picture upload during or after signup
- Email verification required before account activation
- Upon successful signup, cleaner is logged in and session persists (no re-login required unless they explicitly sign out)

**FR-AUTH-02: Admin Invitation Flow**
- Admin enters cleaner's email in the admin panel
- System sends an invitation email via Nodemailer (Gmail SMTP)
- Invitation email contains a signup link with an invite token
- Cleaner clicks link, completes registration form
- Account is automatically linked to the company upon registration
- Invite expires after 72 hours

**FR-AUTH-03: Persistent Session**
- Cleaners stay logged in across browser sessions (Supabase session persistence)
- Session refreshes automatically
- Explicit sign-out option available in profile/settings

**FR-AUTH-04: Admin Login**
- Admin logs in with email and password
- Admin accounts are created manually in Supabase (or seeded) — no self-registration for admin role

---

### 6.2 Geofencing & Location Verification

**FR-GEO-01: Location Capture**
- App requests browser geolocation permission on first use
- Current GPS coordinates are captured when the cleaner opens the check-in screen
- If geolocation is denied or unavailable, display a clear error message and prevent check-in

**FR-GEO-02: Geofence Comparison**
- Each job location has stored coordinates (latitude, longitude) and a geofence radius (in meters)
- System compares cleaner's current coordinates to the job location coordinates
- Distance calculation uses the Haversine formula (straight-line distance)
- No external API needed for distance calculation — this is computed client-side

**FR-GEO-03: Check-in Restriction**
- If the cleaner's distance from the job location exceeds the geofence radius → check-in is BLOCKED
- Display a clear message: "You are [X] meters away from the job location. Please move closer to check in."
- Show both the cleaner's current location and the job location on a simple map (optional, nice-to-have)

**FR-GEO-04: Check-out Location Verification**
- Upon checkout, the system re-captures the cleaner's GPS coordinates
- Compares against the job location geofence
- If outside the geofence, show a warning but still allow checkout (with a flag/note recorded)
- Record the checkout coordinates regardless

**FR-GEO-05: Google Geocoding API**
- Used to convert job addresses (entered by admin as text) into latitude/longitude coordinates
- Called once when a location is created or address is updated
- Coordinates are stored in the database for geofence comparison

---

### 6.3 Check-in Flow

**FR-CHECKIN-01: View Today's Assignment**
- When a cleaner opens the app, they see their current/upcoming assignment
- Display: location name, address, and check-in button
- If no assignment exists, display "No assignments for today"

**FR-CHECKIN-02: Check-in Action**
- Cleaner taps "Check In"
- System captures GPS coordinates
- System runs geofence comparison (FR-GEO-02)
- If within radius → check-in recorded with timestamp and coordinates
- If outside radius → check-in blocked (FR-GEO-03)

**FR-CHECKIN-03: Check-in Confirmation**
- On successful check-in, display confirmation with:
  - Location name
  - Check-in time
  - A simple "You're checked in" status indicator
- Send email notification to admin (configurable)

**FR-CHECKIN-04: Prevent Double Check-in**
- If a cleaner is already checked in at a location, hide/disable the check-in button
- Show "Currently checked in at [Location]" with checkout option

---

### 6.4 Check-out Flow

**FR-CHECKOUT-01: Checkout Initiation**
- Cleaner taps "Check Out" from their active check-in
- System captures GPS coordinates and runs geofence verification
- If outside geofence, log a warning flag but proceed

**FR-CHECKOUT-02: Task Checklist**
- Display a checklist of tasks the cleaner must confirm
- Default checklist applies to all locations (managed by admin)
- Locations can have additional custom checklist items (managed by admin)
- Combined checklist is shown: default items + location-specific items
- Cleaner checks off completed items
- All items should be checked before checkout can be submitted (or admin can configure if partial completion is allowed)

**FR-CHECKOUT-03: Photo Upload**
- Optional: cleaner can upload one or more photos as evidence of completed work
- Photos are taken from camera or selected from gallery
- Stored in Supabase Storage, linked to the checkout record
- Max 5 photos per checkout, max 5MB per photo

**FR-CHECKOUT-04: Remarks / Comments**
- Optional text field for the cleaner to leave notes
- Examples: "Client requested extra attention in kitchen", "Broken tile noticed in bathroom"
- Max 500 characters

**FR-CHECKOUT-05: Checkout Confirmation**
- On successful checkout, display confirmation with:
  - Location name
  - Check-in time → Check-out time (duration)
  - Checklist completion summary
  - Number of photos uploaded
- Send email notification to admin (configurable)

---

### 6.5 Admin Panel

**FR-ADMIN-01: Dashboard Overview**
- Summary stats: total cleaners, total locations, check-ins today, active check-ins
- Recent activity feed (last 10-20 activities)
- Quick links to manage cleaners, locations, assignments

**FR-ADMIN-02: Cleaner Management**
- List all cleaners with: name, email, phone, profile picture, status (active/inactive)
- View individual cleaner profile with activity history
- Invite new cleaner (triggers FR-AUTH-02)
- Deactivate/reactivate cleaner accounts
- Cannot delete cleaners (soft delete only — preserve activity history)

**FR-ADMIN-03: Location Management**
- Add new location with: name, address, geofence radius (meters)
- Address is geocoded to lat/lng via Google Geocoding API on save
- Edit location details and radius
- Deactivate/reactivate locations
- View location-specific activity history
- Manage custom checklist items per location

**FR-ADMIN-04: Default Checklist Management**
- Admin can add, edit, remove, and reorder default checklist items
- Default items appear on every checkout regardless of location
- Example default items: "Floors mopped", "Surfaces wiped", "Trash emptied", "Bathroom cleaned"

**FR-ADMIN-05: Assignment Management**
- Assign one or more cleaners to a location
- Assignments are ongoing (not date-specific — keeps it simple)
- A cleaner can be assigned to multiple locations
- A location can have multiple cleaners assigned
- Remove assignments as needed

**FR-ADMIN-06: Activity Log**
- Searchable, filterable activity log showing all check-ins and check-outs
- Filters: by cleaner, by location, by date range, by status
- Each log entry shows: cleaner name, location, check-in time, check-out time, duration, checklist completion %, photos count, remarks, geofence status (in/out of range)
- Click into a log entry to see full detail including checklist, photos, remarks, and coordinates

**FR-ADMIN-07: CSV Export**
- Export activity data to CSV with all fields
- Filters apply to export (export what you see)
- CSV includes: cleaner name, location name, date, check-in time, check-out time, duration, checklist items completed, total checklist items, geofence status at check-in, geofence status at checkout, remarks

**FR-ADMIN-08: Settings**
- Company name (displayed in app header, emails)
- Company logo upload (used in branded loader, emails)
- Default geofence radius (used as pre-fill when creating new locations)
- Email notification preferences (which events trigger admin emails)

---

### 6.6 Cleaner Activity View

**FR-ACTIVITY-01: Own History**
- Cleaner can view their own check-in/check-out history
- List view with: location name, date, check-in time, check-out time, duration
- Click into an entry to see checklist and remarks

---

### 6.7 Notifications (Email)

**FR-NOTIFY-01: Invitation Email**
- Sent when admin invites a new cleaner
- Contains: company name, signup link with invite token, expiry notice
- Sent via Nodemailer with Gmail SMTP

**FR-NOTIFY-02: Check-in Confirmation**
- Sent to cleaner upon successful check-in
- Contains: location name, check-in time
- Sent to admin as a notification (configurable)

**FR-NOTIFY-03: Check-out Confirmation**
- Sent to cleaner upon successful checkout
- Contains: location name, check-in/out times, duration, checklist summary
- Sent to admin as a notification (configurable)

**FR-NOTIFY-04: Missed Check-in Alert (v1.1)**
- If a cleaner doesn't check in by a configurable time, alert the admin
- This is a future enhancement — not required for MVP

---

### 6.8 PWA Requirements

**FR-PWA-01: Installable**
- Web app manifest with app name, icons, theme color
- "Add to Home Screen" prompt on supported browsers
- Launches in standalone mode (no browser chrome)

**FR-PWA-02: Branded Splash Loader**
- On app load, display the company logo centered on screen
- Animated circular spinner rotating around the logo
- Displayed until the app is fully loaded / authenticated
- Uses the company's brand colors (black/white default, configurable)

**FR-PWA-03: Offline Awareness**
- If the device is offline, display a clear "You're offline" message
- Check-in/check-out requires an active connection (GPS + API calls)
- No offline-first functionality required for MVP

---

## 7. Non-Functional Requirements

**NFR-01: Performance**
- App should load in under 3 seconds on 4G connections
- Check-in/check-out actions should complete in under 2 seconds
- Branded loader covers initial load time

**NFR-02: Security**
- All data transmitted over HTTPS
- Supabase Row Level Security (RLS) policies enforce role-based access
- API keys and credentials stored in environment variables only
- No sensitive data stored in client-side storage (localStorage for session token only)

**NFR-03: Scalability**
- Single-tenant architecture: one Supabase project per client
- Each deployment supports up to ~100 cleaners and ~200 locations comfortably
- For larger operations, Supabase plan can be upgraded independently

**NFR-04: Maintainability / Replicability**
- All client-specific configuration via environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GOOGLE_GEOCODING_API_KEY`
  - `GMAIL_USER`
  - `GMAIL_APP_PASSWORD`
  - `NEXT_PUBLIC_COMPANY_NAME`
  - `NEXT_PUBLIC_PRIMARY_COLOR`
  - `NEXT_PUBLIC_SECONDARY_COLOR`
- New client deployment: fork repo → update `.env` → deploy to Vercel

**NFR-05: Accessibility**
- Minimum font size 16px for mobile
- High contrast (black/white default theme)
- Touch targets minimum 44x44px
- Clear, descriptive button labels

**NFR-06: Browser Support**
- Chrome (Android) — primary
- Safari (iOS) — primary
- Chrome (Desktop) — admin panel
- Firefox, Edge — secondary

---

## 8. Out of Scope (MVP)

- Scheduling / calendar system
- In-app messaging / chat
- Payroll or time-based billing
- Multiple admin roles (supervisor/manager)
- Real-time GPS tracking (continuous)
- Offline check-in with sync
- Missed check-in alerts (v1.1)
- Multi-tenant architecture
- Push notifications (email only for MVP)

---

## 9. Success Metrics

- 95%+ of check-ins completed within geofence radius
- Average check-in/check-out time under 30 seconds
- Admin can onboard a new cleaner in under 2 minutes
- Zero manual location verification needed (system handles it)
- CSV exports used at least weekly by admin

---

## 10. Glossary

| Term | Definition |
|---|---|
| Check-in | The action of a cleaner confirming arrival at a job location |
| Check-out | The action of a cleaner confirming completion of work at a location |
| Geofence | A virtual boundary around a job location defined by a center point and radius |
| Haversine Formula | Mathematical formula to calculate straight-line distance between two GPS coordinates on Earth's surface |
| Assignment | A link between a cleaner and a location indicating the cleaner is responsible for that location |
| Default Checklist | A set of task items that appear on every checkout, regardless of location |
| Custom Checklist | Additional task items specific to a particular location |
| Invite Token | A unique, time-limited token embedded in invitation links for new cleaner registration |
| Branded Loader | The animated splash screen showing the company logo with a spinning animation during app loading |
