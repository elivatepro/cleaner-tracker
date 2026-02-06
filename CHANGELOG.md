# CHANGELOG

## [2026-02-06 10:45 WAT] — OpenCode

### What was built
- Added admin setting to enable/disable geofence enforcement and wired check-in/checkout APIs to honor it.
- Added migration to add `geofence_enabled` column to `app_settings`.
- Improved sticky headers (admin and cleaner) with opaque blurred backgrounds to prevent content scrolling under the header.

### What's left / next steps
- Apply migration 003 to Supabase; set `geofence_enabled` as needed.
- If geofence is disabled, check-ins/outs skip geofence validation server-side.

### Known issues
- Existing lint warnings about unused imports remain unchanged in other files.

### Decisions made
- Keep geofence enforcement controllable via a single app-wide setting.
- Use sticky header backdrop/opacity to avoid overlap artifacts during scroll.

### Files created or modified
- supabase/migrations/003_app_settings_geofence_toggle.sql (new)
- src/app/admin/settings/page.tsx (modified)
- src/components/AdminSettingsClient.tsx (modified)
- src/app/api/admin/settings/route.ts (modified)
- src/app/api/settings/public/route.ts (modified)
- src/app/api/cleaner/checkin/route.ts (modified)
- src/app/api/cleaner/checkout/route.ts (modified)
- src/app/admin/layout.tsx (modified)
- src/app/cleaner/layout.tsx (modified)

### Packages installed
- None.

## [2026-02-06 10:30 WAT] — OpenCode

### What was built
- Added assignment notification email: when an admin assigns a cleaner to a location, the cleaner receives an email with location name/address.

### What's left / next steps
- Ensure Gmail SMTP env vars are set and outbound mail works in your environment.

### Known issues
- Lint still shows existing unused-import warnings in other files (unchanged this task).

### Decisions made
- Reused existing email infrastructure with a new `sendAssignmentEmail` helper.

### Files created or modified
- src/lib/email.ts (modified)
- src/app/api/admin/assignments/route.ts (modified)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 10:20 WAT] — OpenCode

### What was built
- Added multi-add support for default checklist items: textarea input accepts multiple lines, API now handles bulk insert, and success toast reports item count.

### What's left / next steps
- None specific; verify adding multiple items works end-to-end.

### Known issues
- Existing lint warnings about unused imports elsewhere remain unchanged.

### Decisions made
- Kept API backward-compatible by accepting both `label` and `labels`; inserts rows in one call.

### Files created or modified
- src/components/AdminChecklistClient.tsx (modified)
- src/app/api/admin/checklist/route.ts (modified)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 10:05 WAT] — OpenCode

### What was built
- Updated `Badge` success variant to use solid accent background with white text so Active status pills appear clearly green.

### What's left / next steps
- Verify Active badges now show with a green background across the app.

### Known issues
- None observed.

### Decisions made
- Switched success badge styling from soft accent to solid accent for clarity on dark backgrounds.

### Files created or modified
- src/components/ui/Badge.tsx (modified)

### Packages installed
- None.

## [2026-02-06 09:35 WAT] — OpenCode

### What was built
- Improved slider visibility: added custom track/thumb styling via `.app-slider` and applied it to the Geofence Radius control.

### What's left / next steps
- Verify the slider is now visible and easy to drag in the Add Location modal.

### Known issues
- None observed.

### Decisions made
- Used global CSS for consistent range input styling across browsers while keeping accent color.

### Files created or modified
- src/components/ui/Slider.tsx (modified)
- src/app/globals.css (modified)

### Packages installed
- None.

## [2026-02-06 09:25 WAT] — OpenCode

### What was built
- Enabled profile photo upload for cleaners: added avatar picker with upload to Supabase storage, and saving `avatar_url` via profile API.
- Updated cleaner profile page to pass avatar data to the form.

### What's left / next steps
- Consider adding client-side image cropping/resize and storage bucket validation.

### Known issues
- Upload assumes an `avatars` storage bucket with public access is available.

### Decisions made
- Stored avatars under `avatars/{userId}/{timestamp}-filename` and use public URLs for rendering.

### Files created or modified
- src/components/CleanerProfileForm.tsx (modified)
- src/app/cleaner/profile/page.tsx (modified)
- src/app/api/cleaner/profile/route.ts (modified)

### Packages installed
- None.

## [2026-02-06 09:20 WAT] — OpenCode

### What was built
- Set slider accent color to the design accent token so the Geofence Radius control matches brand colors.

### What's left / next steps
- None for this update.

### Known issues
- None observed.

### Decisions made
- Applied `accentColor` via shared theme token to keep range inputs consistent with accent styling.

### Files created or modified
- src/components/ui/Slider.tsx (modified)

### Packages installed
- None.

## [2026-02-06 09:20 WAT] — OpenCode

### What was built
- Updated admin cleaner detail page colors for dark theme readability (headings, labels, link accent, body text).

### What's left / next steps
- None noted for this change.

### Known issues
- None observed.

### Decisions made
- Use accent for back link and white/secondary-muted for text on dark backgrounds to maintain contrast.

### Files created or modified
- src/app/admin/cleaners/[id]/page.tsx (modified)

### Packages installed
- None.

## [2026-02-06 06:15 WAT] — OpenCode

### What was built
- Fixed duplicate avatar rendering on cleaner profile by removing the secondary avatar block from `CleanerProfileForm`.

### What's left / next steps
- Implement a real photo upload flow when available.

### Known issues
- None noted after the UI cleanup.

### Decisions made
- Keep the primary avatar display in `cleaner/profile/page.tsx` and remove the redundant one inside the form.

### Files created or modified
- src/components/CleanerProfileForm.tsx (modified)

### Packages installed
- None.

## [2026-02-06 05:40] — OpenCode

### What was built
- Added `Agent.md` with the full instructions from `AGENT_INSTRUCTIONS.md` for Opencode reference.

### What's left / next steps
- None for this task.

### Known issues
- None.

### Decisions made
- Duplicated agent instructions verbatim to `Agent.md` to keep guidance accessible.

### Files created or modified
- Agent.md (new)

### Packages installed
- None.

## [2026-02-06 05:15] — OpenCode

### What was built
- Resolved auth hydration mismatch by suppressing extension-injected attributes on the Input wrapper.
- Ensured login always performs `signInWithPassword` to refresh cookies and stop the login loop.
- Added Supabase cookie debug logging to trace set-cookie behavior during auth.
- Added visible borders and stronger focus outlines to the Button component for accessibility.
- Simplified invitation signup: form now only collects name and password, auto-uses invite email, and removed phone/email inputs; signup API derives email from the invitation and no longer requires phone.

### What's left / next steps
- Re-test login/logout flows in the browser after clearing cookies/extensions.
- Consider adding a middleware-based auth guard if redirect issues persist.

### Known issues
- None observed after fixes; monitor for further hydration warnings from extensions.

### Decisions made
- Kept unified accent outline for focus-visible states across all button variants to improve keyboard navigation clarity.
- Signup email source is authoritative from the invitation lookup to prevent user entry mismatch.

### Files created or modified
- src/components/ui/Input.tsx (modified)
- src/lib/supabase/server.ts (modified)
- src/app/api/auth/login/route.ts (modified)
- src/components/ui/Button.tsx (modified)
- src/app/api/auth/signup/route.ts (modified)
- src/app/signup/page.tsx (modified)

### Packages installed
- None.

## [2026-02-06 04:30] — Codex

### What was built
- **Full UI Redesign:** Implemented a new "Dark Mode" aesthetic across the entire application.
- **Theme Foundation:** Updated color tokens in `tailwind.config.ts`, `globals.css`, and `theme.ts` to support the new dark theme with accent green (#10B981).
- **Component Overhaul:** Rebuilt all UI components (`Button`, `Input`, `Card`, `Modal`, `Badge`, `Skeleton`, `Checkbox`) to match the new design spec.
- **New Components:** Added `Avatar`, `Table`, `EmptyState`, and `Slider` components.
- **Layout Update:** Redesigned Admin and Cleaner layouts with new dark headers, sidebars, and navigation.
- **Page Updates:** Updated all pages (Login, Signup, Admin Dashboard, Cleaners, Locations, Activity, Settings, Cleaner Home, Checkout, History, Profile) to use the new components and styles.

### What's left / next steps
- User acceptance testing.
- Verify mobile responsiveness on real devices.

### Known issues
- None.

### Decisions made
- Switched to a dark-dominant theme for a more professional and modern look.
- Used "accent green" for primary actions to ensure high visibility against dark backgrounds.
- Standardized all tables and lists using the new `Table` and `Card` components.

### Files created or modified
- tailwind.config.ts (modified)
- src/app/globals.css (modified)
- src/lib/theme.ts (modified)
- src/components/ui/Button.tsx (modified)
- src/components/ui/Input.tsx (modified)
- src/components/ui/Card.tsx (modified)
- src/components/ui/Modal.tsx (modified)
- src/components/ui/Badge.tsx (modified)
- src/components/ui/Toast.tsx (modified)
- src/components/ui/Skeleton.tsx (modified)
- src/components/ui/Checkbox.tsx (modified)
- src/components/ui/Spinner.tsx (modified)
- src/components/ui/Avatar.tsx (new)
- src/components/ui/Table.tsx (new)
- src/components/ui/EmptyState.tsx (new)
- src/components/ui/Slider.tsx (new)
- src/components/AdminSidebar.tsx (modified)
- src/components/CleanerBottomNav.tsx (modified)
- src/components/AdminCleanersClient.tsx (modified)
- src/components/AdminLocationsClient.tsx (modified)
- src/components/AdminAssignmentsClient.tsx (modified)
- src/components/AdminChecklistClient.tsx (modified)
- src/components/AdminSettingsClient.tsx (modified)
- src/components/CleanerHomeClient.tsx (modified)
- src/components/CleanerCheckoutClient.tsx (modified)
- src/components/CleanerProfileForm.tsx (modified)
- src/app/admin/layout.tsx (modified)
- src/app/admin/page.tsx (modified)
- src/app/admin/cleaners/page.tsx (modified)
- src/app/admin/locations/[id]/page.tsx (modified)
- src/app/admin/activity/page.tsx (modified)
- src/app/admin/activity/[id]/page.tsx (modified)
- src/app/cleaner/layout.tsx (modified)
- src/app/cleaner/history/page.tsx (modified)
- src/app/login/page.tsx (modified)
- src/app/signup/page.tsx (modified)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 03:45] — Codex

### What was built
- Fixed "Login successfully but page reloads" issue by handling secure cookies properly on localhost.
- Improved login API response to return user role and redirect URL.
- Updated login page to use server-provided redirect URL (redirects admins to `/admin` and cleaners to `/cleaner`).

### What's left / next steps
- Verify the new design and full admin workflow.

### Known issues
- None.

### Decisions made
- Forced `secure: false` for cookies in development environment to ensure they persist on `http://localhost`.
- Returned role-based redirect URL from login API to avoid client-side guessing.

### Files created or modified
- src/lib/supabase/server.ts (modified)
- src/app/api/auth/login/route.ts (modified)
- src/app/login/page.tsx (modified)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 03:25] — Codex

### What was built
- Fixed "Internal Server Error" on login by awaiting `cookies()` in `src/lib/supabase/server.ts` (Next.js 15+ requirement).

### What's left / next steps
- Continue verifying the high-contrast UI updates.

### Known issues
- None.

### Decisions made
- Updated `createServerClient` helper to correctly handle asynchronous cookies API in Next.js 15.

### Files created or modified
- src/lib/supabase/server.ts (modified)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 03:15] — Codex

### What was built
- Updated the UI to a "Refined Industrial" aesthetic (sharper, cleaner).
- Implemented high-contrast "Black & White" active states for the admin sidebar.
- Refined the "concrete" background texture to be subtler and less noisy.
- Sharpened border radiuses on Buttons, Inputs, Badges, Modals, and Skeletons (from `lg/xl` to `md`).
- Increased contrast on Inputs by switching to a white background with borders.
- Replaced soft card shadows with crisp 1px borders.

### What's left / next steps
- Verify the new high-contrast look across all admin pages.

### Known issues
- None.

### Decisions made
- Moved away from "soft" rounded corners to a more "precision tool" look suitable for management software.
- Reduced noise in the background texture to improve text readability while keeping the unique brand feel.

### Files created or modified
- src/app/globals.css (modified)
- src/components/ui/Button.tsx (modified)
- src/components/ui/Card.tsx (modified)
- src/components/ui/Input.tsx (modified)
- src/components/ui/Badge.tsx (modified)
- src/components/ui/Modal.tsx (modified)
- src/components/ui/Toast.tsx (modified)
- src/components/ui/Skeleton.tsx (modified)
- src/components/AdminSidebar.tsx (modified)
- src/lib/theme.ts (modified)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 02:56] — Codex

### What was built
- Fixed email regex validation to properly handle whitespace in login/signup/invite.
- Cleared field errors on change to avoid stuck validation states.

### What's left / next steps
- Re-test login and invite flows after a hard refresh.

### Known issues
- None.

### Decisions made
- Standardized email validation regex across auth and invite forms.

### Files created or modified
- src/app/login/page.tsx (modified)
- src/app/signup/page.tsx (modified)
- src/components/AdminCleanersClient.tsx (modified)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 02:51] — Codex

### What was built
- Darkened the concrete neutral palette and strengthened the speckle texture.
- Ensured auth pages explicitly use the concrete background.
- Fixed email validation to trim input before regex checks on login/signup.

### What's left / next steps
- If the concrete texture is still too light/dark, we can tune the speckle and wash values.

### Known issues
- None.

### Decisions made
- Applied `bg-concrete` to login/signup to guarantee the texture appears.
- Tightened validation to avoid false email errors when whitespace exists.

### Files created or modified
- src/app/globals.css (modified)
- src/lib/theme.ts (modified)
- src/app/login/page.tsx (modified)
- src/app/signup/page.tsx (modified)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 02:36] — Codex

### What was built
- Adjusted neutral tokens and added a subtle concrete texture background.
- Applied the concrete background to admin and cleaner shells.

### What's left / next steps
- Review concrete texture intensity and adjust if you want it lighter or darker.

### Known issues
- None.

### Decisions made
- Kept primary/secondary as pure black/white and shifted neutral tones to reduce overall brightness.
- Added a concrete background utility via Tailwind layers to avoid inline styles.

### Files created or modified
- src/app/globals.css (modified)
- src/app/cleaner/layout.tsx (modified)
- src/app/admin/layout.tsx (modified)
- src/lib/theme.ts (modified)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 02:24] — Codex

### What was built
- Created `.env.local` with the provided credentials.
- Scrubbed secrets from `SETUP.md` and updated the template formatting.
- Added a Supabase migration file generated from the SQL blocks in `ARD.md`.

### What's left / next steps
- Run the migration SQL in Supabase and create the required storage buckets/policies.

### Known issues
- Tables are not created in Supabase until the migration SQL is run.

### Decisions made
- Extracted the schema and RLS SQL into `supabase/migrations/001_initial_schema.sql` for repeatable setup.
- Quoted color values in the env template to avoid `#` comment parsing.

### Files created or modified
- .env.local (new)
- SETUP.md (modified)
- supabase/migrations/001_initial_schema.sql (new)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 01:52] — Codex

### What was built
- Added a dedicated setup guide with instructions for Supabase, Gmail, Google Geocoding, and env vars.

### What's left / next steps
- Populate `.env.local` with real credentials and run the SQL from `ARD.md`.

### Known issues
- No `supabase/` migration files exist yet; setup references `ARD.md` for the schema SQL.

### Decisions made
- Created `SETUP.md` to centralize onboarding instead of modifying existing docs.

### Files created or modified
- SETUP.md (new)
- CHANGELOG.md (modified)

### Packages installed
- None.

## [2026-02-06 01:47] — Codex

### What was built
- Added admin settings toggles for check-in/check-out email notifications.
- Implemented admin settings update API route.

### What's left / next steps
- Add admin controls for brand settings (company name, colors, logo).
- Persist UI feedback for settings updates beyond toast (optional).

### Known issues
- Only notification toggles are editable; other settings remain read-only.

### Decisions made
- Used a simple toggle action per setting to reduce form complexity.

### Files created or modified
- src/components/AdminSettingsClient.tsx (new)
- src/app/admin/settings/page.tsx (modified)
- src/app/api/admin/settings/route.ts (new)

### Packages installed
- None.

## [2026-02-06 01:45] — Codex

### What was built
- Added cleaner history detail page with checklist results and photo previews.
- Linked history list entries to the new detail route.

### What's left / next steps
- Add cleaner activity detail to show duration and geofence status if needed.
- Consider signed URL caching or refresh strategy for longer sessions.

### Known issues
- Signed photo URLs expire after 1 hour and require reloading to regenerate.

### Decisions made
- Used signed URLs for storage photos to keep checkout-photos bucket private.

### Files created or modified
- src/app/cleaner/history/page.tsx (modified)
- src/app/cleaner/history/[id]/page.tsx (new)

### Packages installed
- None.

## [2026-02-06 01:41] — Codex

### What was built
- Added signed URL handling for checkout photos in admin activity detail.
- Rendered checklist results and photo previews in activity detail view.

### What's left / next steps
- Add photo previews for cleaner history detail if needed.
- Consider caching or shorter signed URL lifetimes if required.

### Known issues
- Signed photo URLs expire after 1 hour and require reloading to regenerate.

### Decisions made
- Used signed URLs on the server and `unoptimized` images to avoid Next remote config changes.

### Files created or modified
- src/app/admin/activity/[id]/page.tsx (modified)

### Packages installed
- None.

## [2026-02-06 01:34] — Codex

### What was built
- Implemented cleaner check-in flow with geolocation, client-side geofence checks, and API wiring.
- Built checkout flow with checklist, remarks, photo upload to Supabase Storage, and API wiring.
- Added geolocation helper and checkout client component.
- Added Checkbox UI primitive and updated Input to support refs.

### What's left / next steps
- Build the check-in/out confirmation screens and polish UI states.
- Add settings toggles to control email notifications.
- Add signed URL handling for viewing checkout photos later.

### Known issues
- Checkout photo URLs stored as storage paths; viewing requires signed URLs later.
- Error states on home check-in are minimal (no map).

### Decisions made
- Used Supabase Storage client on checkout to upload photos before submitting checkout.

### Files created or modified
- src/lib/geolocation.ts (new)
- src/components/CleanerHomeClient.tsx (new)
- src/components/CleanerCheckoutClient.tsx (new)
- src/components/ui/Input.tsx (modified)
- src/components/ui/Checkbox.tsx (new)
- src/app/cleaner/page.tsx (modified)
- src/app/cleaner/checkout/page.tsx (modified)

### Packages installed
- None.

## [2026-02-06 01:26] — Codex

### What was built
- Added geofence helper and cleaner check-in/check-out API routes.
- Added check-in and check-out email notifications for cleaners and admins.

### What's left / next steps
- Wire client-side check-in/out flows to the new APIs.
- Add email notification toggles in admin settings UI.

### Known issues
- Checkout inserts tasks/photos only if provided; no validation against checklist items yet.
- Check-in/out APIs do not yet send push UI updates (client integration pending).

### Decisions made
- Admin notifications are sent to all active admin profiles when enabled in app settings.

### Files created or modified
- src/lib/geofence.ts (new)
- src/lib/email.ts (modified)
- src/app/api/cleaner/checkin/route.ts (new)
- src/app/api/cleaner/checkout/route.ts (new)

### Packages installed
- None.

## [2026-02-06 01:22] — Codex

### What was built
- Added Nodemailer email helper and invitation email template.
- Wired invite API to send invitation emails asynchronously.

### What's left / next steps
- Add email notifications for check-in and check-out events.
- Add admin settings UI to toggle email notifications.

### Known issues
- Invite API will succeed even if email send fails (logged to server console).

### Decisions made
- Kept invite email sending non-blocking to avoid delaying the API response.

### Files created or modified
- src/lib/email.ts (new)
- src/app/api/admin/invite/route.ts (modified)
- package-lock.json (modified by npm install)

### Packages installed
- nodemailer (email delivery via Gmail SMTP)

## [2026-02-06 01:16] — Codex

### What was built
- Added admin CRUD modals for invites, locations, assignments, and checklist items.
- Implemented admin API routes for invite creation, locations, assignments, and checklist items.
- Added Google geocoding helper for location creation.
- Converted admin list pages to client-driven UI with modals and live filtering.

### What's left / next steps
- Send invitation emails (currently only generates invite links).
- Add edit/deactivate flows for cleaners, locations, assignments, and checklist items.
- Implement admin CSV export and full filter behavior.

### Known issues
- Invite flow does not send email yet; it only creates and shows the invite link.
- CRUD actions currently refresh the page after success.

### Decisions made
- Used modal forms on list pages instead of separate create pages.
- Deferred nodemailer integration to avoid new package installs without explicit need.

### Files created or modified
- src/lib/geocode.ts (new)
- src/app/api/admin/invite/route.ts (new)
- src/app/api/admin/locations/route.ts (new)
- src/app/api/admin/assignments/route.ts (new)
- src/app/api/admin/checklist/route.ts (new)
- src/components/AdminCleanersClient.tsx (new)
- src/components/AdminLocationsClient.tsx (new)
- src/components/AdminAssignmentsClient.tsx (new)
- src/components/AdminChecklistClient.tsx (new)
- src/app/admin/cleaners/page.tsx (modified)
- src/app/admin/locations/page.tsx (modified)
- src/app/admin/assignments/page.tsx (modified)
- src/app/admin/checklist/page.tsx (modified)

### Packages installed
- None.

## [2026-02-06 01:09] — Codex

### What was built
- Added mobile hamburger menu and overlay sidebar for the admin layout.

### What's left / next steps
- Hook up admin CRUD actions and modal flows.
- Implement check-in/check-out flows for cleaners.

### Known issues
- None.

### Decisions made
- Kept mobile menu as a client-only overlay to avoid adding layout-wide client boundaries.

### Files created or modified
- src/components/AdminMobileMenu.tsx (new)
- src/app/admin/layout.tsx (modified)

### Packages installed
- None.

## [2026-02-06 01:07] — Codex

### What was built
- Added remaining cleaner/admin pages with basic layouts and Supabase data fetches.
- Implemented cleaner history view with grouping and duration badges.
- Added cleaner profile form and profile update API route.
- Added minimal placeholder check-in/checkout pages.

### What's left / next steps
- Implement full check-in/check-out flows and checkout checklist UI.
- Build admin modals and full CRUD actions (invite, add location, assignments).
- Add mobile admin hamburger sidebar.

### Known issues
- Several actions are disabled placeholders (invite cleaner, add location, export CSV).
- Some list layouts are basic and don’t yet match full responsive table specs.

### Decisions made
- Implemented profile updates via `/api/cleaner/profile` to support the profile form.

### Files created or modified
- src/components/ui/Button.tsx (modified)
- src/components/CleanerProfileForm.tsx (new)
- src/app/cleaner/checkin/page.tsx (new)
- src/app/cleaner/checkout/page.tsx (new)
- src/app/cleaner/history/page.tsx (new)
- src/app/cleaner/profile/page.tsx (new)
- src/app/admin/cleaners/page.tsx (new)
- src/app/admin/cleaners/[id]/page.tsx (new)
- src/app/admin/locations/page.tsx (new)
- src/app/admin/locations/[id]/page.tsx (new)
- src/app/admin/assignments/page.tsx (new)
- src/app/admin/checklist/page.tsx (new)
- src/app/admin/activity/page.tsx (new)
- src/app/admin/activity/[id]/page.tsx (new)
- src/app/admin/settings/page.tsx (new)
- src/app/api/cleaner/profile/route.ts (new)

### Packages installed
- None.

## [2026-02-06 00:59] — Codex

### What was built
- Added cleaner and admin dashboard pages to prevent redirect 404s.
- Implemented basic data loading for dashboards with Supabase queries.
- Added loading skeleton components and add-to-home-screen tip.

### What's left / next steps
- Build the remaining cleaner/admin pages and hook up check-in/out flows.
- Add admin mobile hamburger menu for the sidebar.

### Known issues
- Cleaner check-in/check-out buttons are placeholders without actions yet.
- Login/signup success redirects assume cleaner role (admin redirect logic not wired).

### Decisions made
- Kept dashboards server-rendered and used minimal client components for localStorage tip.

### Files created or modified
- src/components/ui/Skeleton.tsx (new)
- src/components/AddToHomeTip.tsx (new)
- src/app/cleaner/page.tsx (new)
- src/app/cleaner/loading.tsx (new)
- src/app/admin/page.tsx (new)
- src/app/admin/loading.tsx (new)
- src/app/login/page.tsx (modified)
- src/app/signup/page.tsx (modified)

### Packages installed
- None.

## [2026-02-06 00:52] — Codex

### What was built
- Installed Lucide React and replaced placeholder nav icons.
- Updated cleaner bottom nav and admin sidebar to use Lucide icons.

### What's left / next steps
- Build cleaner/admin pages so routes exist.
- Add admin mobile hamburger menu for sidebar.

### Known issues
- None.

### Decisions made
- Mapped admin nav icons to Lucide equivalents (Users, Navigation, MapPin, CheckSquare, Clock, Settings).

### Files created or modified
- src/components/CleanerBottomNav.tsx (modified)
- src/components/AdminSidebar.tsx (modified)
- package-lock.json (modified by npm install)

### Packages installed
- lucide-react (icon library)

## [2026-02-06 00:50] — Codex

### What was built
- Added cleaner and admin layouts with server-side auth/role guards.
- Added cleaner bottom navigation and admin sidebar navigation components.
- Added layout-level headers for cleaner and admin shells.

### What's left / next steps
- Implement mobile admin hamburger menu and real icons (Lucide React).
- Build cleaner/admin pages to fill the shells.

### Known issues
- Admin sidebar is hidden on mobile without a hamburger toggle yet.
- Nav icons are placeholder text until Lucide React is installed.
- Cleaner/admin pages are not built yet, so `/cleaner` and `/admin` routes will 404.

### Decisions made
- Kept layouts as Server Components and pushed active nav styling into small Client components.

### Files created or modified
- src/components/CleanerBottomNav.tsx (new)
- src/components/AdminSidebar.tsx (new)
- src/app/cleaner/layout.tsx (new)
- src/app/admin/layout.tsx (new)

### Packages installed
- None.

## [2026-02-06 00:45] — Codex

### What was built
- Added Supabase client helpers (browser/server/admin).
- Implemented auth API routes (login, logout, signup).
- Added public routes for invite validation and public app settings.
- Wired login/signup pages to redirect on successful auth.

### What's left / next steps
- Build cleaner/admin layouts with auth guards.
- Implement remaining admin/cleaner API routes.

### Known issues
- None.

### Decisions made
- Treated invite link signup as verified email (set `email_confirm: true`) to allow immediate login.

### Files created or modified
- src/lib/supabase/admin.ts (new)
- src/lib/supabase/client.ts (new)
- src/lib/supabase/server.ts (new)
- src/app/api/auth/login/route.ts (new)
- src/app/api/auth/logout/route.ts (new)
- src/app/api/auth/signup/route.ts (new)
- src/app/api/invite/[token]/route.ts (new)
- src/app/api/settings/public/route.ts (new)
- src/app/login/page.tsx (modified)
- src/app/signup/page.tsx (modified)
- package-lock.json (modified by npm install)

### Packages installed
- @supabase/supabase-js (Supabase client)
- @supabase/ssr (Supabase SSR helpers)

## [2026-02-06 00:31] — Codex

### What was built
- Built cleaner-facing login and signup pages per design spec.
- Added client-side validation, loading states, and toasts for auth forms.
- Added invite-token guard messaging on signup.

### What's left / next steps
- Implement auth API routes and wire redirects after successful auth.
- Build cleaner/admin layouts and dashboards.

### Known issues
- Login/signup currently reset form on success; no redirect until auth APIs exist.

### Decisions made
- Kept auth pages client-side to enable validation and toast feedback.

### Files created or modified
- src/app/login/page.tsx (new)
- src/app/signup/page.tsx (new)

### Packages installed
- None.

## [2026-02-06 00:22] — Codex

### What was built
- Added Tailwind config with design tokens and utilities.
- Reworked global styles to set design token CSS variables and base body styles.
- Updated root layout to use Inter and Toast provider; set CleanTrack metadata.
- Redirected landing page to `/login`.
- Added core UI components (Button, Input, Card, Badge, Modal, Spinner, Toast).
- Added shared helpers and foundational types/themes.

### What's left / next steps
- Build auth pages and app shells (cleaner/admin layouts).
- Add Supabase helpers when you’re ready to install packages.
- Implement remaining UI components and feature pages.

### Known issues
- None.

### Decisions made
- Kept a single global CSS file (`src/app/globals.css`) to initialize Tailwind and define CSS variables.

### Files created or modified
- tailwind.config.ts (new)
- src/app/globals.css (modified)
- src/app/layout.tsx (modified)
- src/app/page.tsx (modified)
- src/components/ui/Badge.tsx (new)
- src/components/ui/Button.tsx (new)
- src/components/ui/Card.tsx (new)
- src/components/ui/Input.tsx (new)
- src/components/ui/Modal.tsx (new)
- src/components/ui/Spinner.tsx (new)
- src/components/ui/Toast.tsx (new)
- src/lib/theme.ts (new)
- src/lib/utils.ts (new)
- src/types/index.ts (new)

### Packages installed
- None.

## [2026-02-06 00:14] — Codex

### What was built
- Removed duplicate scaffold folder (`cleantrack/`) created during initial Next.js bootstrap.

### What's left / next steps
- Continue with project setup and required file structure.

### Known issues
- None.

### Decisions made
- Kept the root scaffold as the single source of truth; deleted the duplicate subfolder.

### Files created or modified
- cleantrack/ (deleted)

### Packages installed
- None.

## [2026-02-06 00:13] — Codex

### What was built
- Installed npm dependencies for the project.

### What's left / next steps
- Decide whether to remove the duplicate `cleantrack/` scaffold folder.

### Known issues
- None.

### Decisions made
- None.

### Files created or modified
- package-lock.json (modified/created by npm install)

### Packages installed
- next, react, react-dom, typescript, tailwindcss, postcss, autoprefixer, eslint, eslint-config-next, @types/react, @types/react-dom, @types/node, @tailwindcss/postcss

## [2026-02-05 23:52] — Codex

### What was built
- Created a project task list in TASKS.md.

### What's left / next steps
- Confirm the scope and priorities for the initial build-out.

### Known issues
- None.

### Decisions made
- Captured initial task backlog based on the PRD/ARD/design docs.

### Files created or modified
- TASKS.md (new)

### Packages installed
- None.

## [2026-02-05 00:00] — Codex

### What was built
- Created initial CHANGELOG.md to track future work.

### What's left / next steps
- Initialize the project structure per AGENT_INSTRUCTIONS.md.

### Known issues
- Project files and folders defined in AGENT_INSTRUCTIONS.md are not yet created.

### Decisions made
- None.

### Files created or modified
- CHANGELOG.md (new)

### Packages installed
- None.
## [2026-02-06 09:42 WAT] — OpenCode

### What was built
- Improved avatar upload error handling: show detailed messages and guidance when the `avatars` storage bucket is missing; pass file content type to Supabase upload.

### What's left / next steps
- Create a public `avatars` bucket in Supabase Storage if not already present; retest upload.

### Known issues
- Upload still depends on Supabase Storage bucket policies; ensure the bucket exists and allows uploads.

### Decisions made
- Surface bucket-missing errors explicitly instead of generic failure toast.

### Files created or modified
- src/components/CleanerProfileForm.tsx (modified)

### Packages installed
- None.

## [2026-02-06 09:50 WAT] — OpenCode

### What was built
- Made the geofence slider track white and slightly thicker for better visibility; enlarged thumb for easier dragging.

### What's left / next steps
- Verify the slider is now clearly visible in the Add Location modal.

### Known issues
- None observed.

### Decisions made
- Chose white track to maximize contrast on the dark modal background.

### Files created or modified
- src/app/globals.css (modified)

### Packages installed
- None.

## [2026-02-06 09:55 WAT] — OpenCode

### What was built
- Added a Supabase migration to allow users to update their own profile (fixes RLS violation when saving avatar/full name/phone).

### What's left / next steps
- Run the new migration against Supabase (`supabase db push` or apply SQL) and retry avatar upload.

### Known issues
- Upload still requires the `avatars` storage bucket with correct policies; create/verify if missing.

### Decisions made
- Use a targeted RLS policy (`update_own_profile`) to permit authenticated users to update only their row.

### Files created or modified
- supabase/migrations/002_profiles_update_policy.sql (new)

### Packages installed
- None.
