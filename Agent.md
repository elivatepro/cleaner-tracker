# AGENT INSTRUCTIONS — CleanTrack
# Read this ENTIRE file before writing any code. No exceptions.

---

## PRIORITY ORDER

When there is a conflict, follow this priority:

1. **This file** (agent instructions) — overrides everything
2. **DESIGN_PRD.md** — all visual/UI decisions
3. **ARD.md** — all technical/architecture decisions
4. **PRD.md** — all feature/product decisions
5. **DESIGN_ARD.md** — supplementary visual reference

You MUST read the relevant sections of these documents before building any feature. Do not guess. Do not improvise. If something isn't covered, ask — do not make assumptions.

---

## TECH STACK — LOCKED

Do not substitute, suggest alternatives, or install replacements for any of these:

```
Framework:        Next.js 14+ (App Router ONLY — no Pages Router)
Language:         TypeScript (strict mode)
Styling:          Tailwind CSS (utility classes only — no CSS modules, no styled-components, no inline styles)
UI Components:    Custom (built in src/components/ui/) — no shadcn, no MUI, no Chakra
Icons:            Lucide React — no other icon library
Font:             Inter (Google Fonts) — no other fonts
Database:         Supabase (PostgreSQL + Auth + Storage)
Email:            Nodemailer with Gmail SMTP
Geocoding:        Google Geocoding API
Geofencing:       Browser Geolocation API + Haversine formula (NO Google Distance Matrix)
Hosting:          Vercel
Package Manager:  npm (not yarn, not pnpm, not bun)
```

**Before installing ANY new package**, state what it is, why it's needed, and confirm there isn't already a built-in or existing solution. Do not install packages for things Tailwind, Next.js, or Supabase already handle.

---

## FILE STRUCTURE — FOLLOW EXACTLY

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing/redirect
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── cleaner/            # All cleaner pages
│   │   ├── layout.tsx      # Cleaner shell (auth guard, bottom nav)
│   │   ├── page.tsx        # Cleaner home/dashboard
│   │   ├── checkout/page.tsx
│   │   ├── history/page.tsx
│   │   └── profile/page.tsx
│   ├── admin/              # All admin pages
│   │   ├── layout.tsx      # Admin shell (auth guard, sidebar)
│   │   ├── page.tsx        # Admin dashboard
│   │   ├── cleaners/page.tsx
│   │   ├── cleaners/[id]/page.tsx
│   │   ├── locations/page.tsx
│   │   ├── locations/[id]/page.tsx
│   │   ├── assignments/page.tsx
│   │   ├── checklist/page.tsx
│   │   ├── activity/page.tsx
│   │   ├── activity/[id]/page.tsx
│   │   └── settings/page.tsx
│   └── api/                # API routes (see ARD for full list)
│       ├── auth/
│       ├── admin/
│       ├── cleaner/
│       ├── invite/
│       └── settings/
├── components/
│   ├── ui/                 # Reusable primitives (Button, Input, Card, Modal, etc.)
│   └── [FeatureComponent].tsx  # Feature-specific components (ChecklistForm, PhotoUploader, etc.)
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, configs, API helpers
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server-side Supabase client
│   │   └── admin.ts        # Service role client (server only)
│   ├── geofence.ts         # Haversine formula
│   ├── geolocation.ts      # Browser GPS
│   ├── geocode.ts          # Google Geocoding API
│   ├── email.ts            # Nodemailer config + templates
│   ├── theme.ts            # Design tokens (colors, spacing — synced with Tailwind config)
│   └── utils.ts            # Shared helpers
└── types/
    └── index.ts            # All TypeScript interfaces and types
```

**Rules:**
- New pages go in `src/app/` following the existing pattern
- New reusable UI components go in `src/components/ui/`
- New feature components go in `src/components/`
- New hooks go in `src/hooks/`
- New utility functions go in `src/lib/`
- ALL types go in `src/types/index.ts` (single file, export everything)
- Never create a `styles/` folder, a `.css` file, or a `constants.ts` — use Tailwind and `lib/theme.ts`

---

## NAMING CONVENTIONS

```
FILES & FOLDERS:
  Pages:            kebab-case folders     → admin/cleaners/page.tsx
  Components:       PascalCase             → Button.tsx, ChecklistForm.tsx
  Hooks:            camelCase with "use"   → useGeolocation.ts, useAuth.ts
  Lib/utils:        camelCase              → geofence.ts, email.ts
  API routes:       kebab-case folders     → api/admin/cleaners/route.ts
  Types:            PascalCase interfaces  → Profile, Location, Checkin

VARIABLES & FUNCTIONS:
  Functions:        camelCase              → handleCheckin, calculateDistance
  Components:       PascalCase             → function CheckinButton() {}
  Constants:        UPPER_SNAKE_CASE       → MAX_PHOTOS, GEOFENCE_MIN_RADIUS
  Boolean vars:     is/has/should prefix   → isLoading, hasError, shouldRefresh
  Event handlers:   handle prefix          → handleSubmit, handleCheckin
  API responses:    snake_case (matches DB) → checkin_time, full_name

EXPORTS:
  Components:       Named export           → export function Button() {}
  Pages:            Default export          → export default function DashboardPage() {}
  Types:            Named export           → export interface Profile {}
  Hooks:            Named export           → export function useAuth() {}
```

---

## COMPONENT RULES

### Never Create Raw HTML Elements for These:

| Instead of...       | Always use...              |
|---------------------|----------------------------|
| `<button>`          | `<Button>` from `components/ui/Button` |
| `<input>`           | `<Input>` from `components/ui/Input` |
| `<a>` for nav       | `<Link>` from `next/link` |
| `<img>`             | `<Image>` from `next/image` (or Avatar component for profile pics) |
| Raw `<div>` card    | `<Card>` from `components/ui/Card` |
| Raw alert/popup     | `<Modal>` from `components/ui/Modal` |
| Raw notification    | `<Toast>` from `components/ui/Toast` |

### Component Structure Template:

Every component must follow this structure:

```tsx
// 1. Imports (React, Next, external libs, internal components, hooks, types, utils)
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import type { Profile } from '@/types';

// 2. Props interface (if component accepts props)
interface CleanerCardProps {
  cleaner: Profile;
  onSelect: (id: string) => void;
}

// 3. Component (named export for components, default export for pages)
export function CleanerCard({ cleaner, onSelect }: CleanerCardProps) {
  // 3a. Hooks first
  const [isLoading, setIsLoading] = useState(false);

  // 3b. Handlers
  const handleClick = () => {
    onSelect(cleaner.id);
  };

  // 3c. Render
  return (
    <Card onClick={handleClick}>
      {/* content */}
    </Card>
  );
}
```

### Server vs Client Components:

```
DEFAULT:          Server Component (no "use client" directive)
USE CLIENT WHEN:  Component uses useState, useEffect, event handlers,
                  browser APIs (geolocation), or interactive elements

RULE: Keep "use client" boundary as LOW as possible.
      A page can be a Server Component that renders Client Components.
      Never put "use client" on a layout unless absolutely necessary.
```

---

## DESIGN TOKENS — USE THESE EXACTLY

These are inlined here so you never need to guess. They match DESIGN_PRD.md.

### Colors (Tailwind Config + CSS Variables)

```
primary:       #000000     → bg-primary, text-primary
secondary:     #FFFFFF     → bg-secondary, text-secondary
accent:        #10B981     → bg-accent, text-accent        (success, confirmed)
warning:       #F59E0B     → bg-warning, text-warning      (geofence warnings)
danger:        #EF4444     → bg-danger, text-danger         (errors, destructive)
neutral-50:    #FAFAFA     → bg-neutral-50                  (page bg)
neutral-100:   #F5F5F5     → bg-neutral-100                 (card bg, input bg)
neutral-200:   #E5E5E5     → bg-neutral-200                 (borders)
neutral-300:   #D4D4D4     → bg-neutral-300                 (disabled)
neutral-400:   #A3A3A3     → text-neutral-400               (placeholders, secondary text)
neutral-600:   #525252     → text-neutral-600               (body text)
neutral-900:   #171717     → text-neutral-900               (headings)
```

**NEVER hardcode a hex value in a component. ALWAYS use the Tailwind class.**

### Typography

```
Headings:       text-neutral-900, font Inter
Body:           text-neutral-600, font Inter
Page title:     text-2xl (24px) font-bold
Section title:  text-xl (20px) font-semibold
Card title:     text-base (16px) font-semibold
Body:           text-base (16px) font-normal         ← MINIMUM for body text
Secondary:      text-sm (14px) font-normal
Caption:        text-xs (12px) font-normal            ← MINIMUM anywhere
```

### Spacing

```
Between form fields:     gap-4 (16px)
Between sections:        gap-8 (32px)
Card padding:            p-5 (20px)
Page padding mobile:     px-4 py-6 (16px / 24px)
Page padding desktop:    px-12 py-8 (48px / 32px)
Between cards in grid:   gap-4 (16px)
```

### Sizes

```
Button height (default): h-11 (44px)
Button height (large):   h-13 (52px)
Input height:            h-12 (48px)
Touch target min:        min-h-[48px] min-w-[48px]
Bottom nav:              h-16 (64px)
Admin top bar:           h-16 (64px)
Admin sidebar:           w-60 (240px)
Avatar small:            w-8 h-8 (32px)
Avatar default:          w-10 h-10 (40px)
Avatar large:            w-16 h-16 (64px)
Avatar xlarge:           w-24 h-24 (96px)
Border radius cards:     rounded-xl (12px)
Border radius buttons:   rounded-lg (8px)
Border radius avatars:   rounded-full
```

---

## API ROUTE PATTERN

Every API route must follow this exact structure:

```typescript
// src/app/api/admin/cleaners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Create Supabase client
    const supabase = await createServerClient();

    // 2. Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Verify role (for admin routes)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Perform the actual operation
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'cleaner')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 5. Return response
    return NextResponse.json({ data });

  } catch (error) {
    // 6. Handle errors
    console.error('GET /api/admin/cleaners error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Rules:**
- Always wrap in try/catch
- Always verify auth first
- Always verify role for admin routes
- Always return proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Always log errors with the route path
- Never expose internal error messages to the client (use generic messages)
- Use `NextResponse.json()` for all responses

---

## SUPABASE CLIENT USAGE

```
LOCATION           CLIENT             USE CASE
──────────────────────────────────────────────────────────
Client component   lib/supabase/client.ts    Real-time subscriptions, client-side auth
Server component   lib/supabase/server.ts    Data fetching in RSC, API routes
Admin operations   lib/supabase/admin.ts     Bypass RLS (invites, admin mutations)
```

**Rules:**
- NEVER use the admin client in client components
- NEVER expose the service role key to the client
- ALWAYS use the server client in API routes
- Use the admin client ONLY when RLS needs to be bypassed (creating invitations, initial user setup)

---

## ERROR HANDLING — MANDATORY

Every feature must handle these states. No exceptions.

### For Every Data Fetch:

```tsx
// Every page/component that loads data must have:
if (isLoading) return <Skeleton />;     // Loading state
if (error) return <ErrorState />;        // Error state
if (!data?.length) return <EmptyState />; // Empty state
return <DataDisplay data={data} />;      // Success state
```

### For Every Form Submission:

```tsx
// Every form must handle:
1. Client-side validation (required fields, format checks)
2. Loading state on submit button (spinner, disabled)
3. Disable all inputs during submission
4. Success → Toast success + redirect or reset form
5. Error → Toast error with message
6. Network failure → Toast "Something went wrong. Please try again."
```

### For Every Destructive Action:

```tsx
// Deactivate, delete, remove → ALWAYS show confirmation modal first
1. User clicks destructive button
2. Show Modal: "Are you sure?" with specific description
3. Two buttons: Cancel (Ghost) + Confirm (Danger)
4. On confirm → loading state → execute → Toast result
```

---

## GEOFENCING — IMPLEMENTATION

Use this exact function. Do not modify, do not use an external library:

```typescript
// lib/geofence.ts

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinGeofence(
  userLat: number, userLng: number,
  locationLat: number, locationLng: number,
  radiusMeters: number
): { within: boolean; distance: number } {
  const distance = haversineDistance(userLat, userLng, locationLat, locationLng);
  return { within: distance <= radiusMeters, distance: Math.round(distance) };
}
```

**Dual validation:** Calculate on the client (for instant UI feedback) AND on the server (in the API route, before recording the check-in). The server result is authoritative.

---

## DEFAULTS & GUARDRAILS

These are the project defaults. Follow them unless there's a good reason to deviate. If you need to deviate, log the reason in CHANGELOG.md (see Changelog section below).

### Strong defaults (follow these unless explicitly told otherwise):

```
• Use native fetch — not axios
• Use Intl.DateTimeFormat or date-fns for dates — not moment.js
• Use Tailwind utility classes — not CSS modules, CSS files, or inline styles
• Use App Router patterns — not Pages Router (getServerSideProps, _app.tsx, etc.)
• Use Lucide React for icons — it's already installed
• Use the project's UI components (Button, Input, Card, etc.) — not raw HTML elements
• Use design tokens from Tailwind config — not hardcoded hex/px values
• Use Haversine formula for geofencing — not Google Distance Matrix API
• Keep types in src/types/index.ts — not scattered across component files
• Keep components in src/components/ — not in page folders
• Named exports for components, default exports for pages
• Server-only secrets stay server-only (SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GEOCODING_API_KEY)
```

### Quality defaults (skip these only if you're prototyping and will come back to it):

```
• Every data view needs 4 states: loading, error, empty, success
• Every form needs validation + error messages
• Every destructive action needs a confirmation modal
• Every async action needs a loading indicator
• No `any` types without a comment explaining why
• console.error for errors only — no console.log left behind
```

### Things that need approval before changing:

```
• Installing a new package (state what and why)
• Modifying the database schema (state the migration)
• Adding a new environment variable
• Changing the file structure pattern
• Switching out a core library
```

If you're unsure whether something is a reasonable deviation, just note it in the changelog and move on. The human will review.

---

## ENVIRONMENT VARIABLES

The app reads these. Never hardcode any of these values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # Server-only, never expose to client

# Google
GOOGLE_GEOCODING_API_KEY=            # Server-only

# Gmail (Nodemailer)
GMAIL_USER=
GMAIL_APP_PASSWORD=

# Branding (overridable via app_settings table)
NEXT_PUBLIC_COMPANY_NAME=Elivate
NEXT_PUBLIC_PRIMARY_COLOR=#000000
NEXT_PUBLIC_SECONDARY_COLOR=#FFFFFF

# App
NEXT_PUBLIC_APP_URL=                 # Used in invitation email links
```

**Rules:**
- Variables starting with `NEXT_PUBLIC_` are available on the client
- All others are server-only
- Reference via `process.env.VARIABLE_NAME`
- Never commit `.env.local` to git

---

## RESPONSIVE BREAKPOINTS

```
Mobile:     default (0px+)        ← Design mobile-first
Tablet:     md: (768px+)
Desktop:    lg: (1024px+)
```

**Cleaner side:** Mobile-first. Must look perfect at 375px width.
**Admin side:** Desktop-first in design, but must work at 375px (tables become cards).

---

## CHANGELOG — REQUIRED

This is the most important part of multi-agent collaboration. A `CHANGELOG.md` file lives in the project root. Every agent MUST read it at the start and update it at the end of every session.

### Format:

```markdown
# CHANGELOG

## [Session Date/Time] — [Agent Name or Session ID]

### What was built
- Created Button, Input, Card components in src/components/ui/
- Built the login page at src/app/login/page.tsx
- Set up Supabase client helpers in src/lib/supabase/

### What's left / next steps
- Signup page (needs invite token validation)
- Cleaner home page (check-in flow)
- Admin layout and sidebar not started yet

### Known issues
- Toast component not built yet — using browser alert() as placeholder
- Mobile bottom nav overflows on very small screens (< 320px)

### Decisions made
- Chose date-fns over native Intl for date formatting — needed relative time ("2 hours ago") which Intl doesn't handle cleanly
- Put the geofence check on both client and server as planned in ARD

### Files created or modified
- src/components/ui/Button.tsx (new)
- src/components/ui/Input.tsx (new)
- src/components/ui/Card.tsx (new)
- src/app/login/page.tsx (new)
- src/lib/supabase/client.ts (new)
- src/lib/supabase/server.ts (new)
- tailwind.config.ts (modified — added custom colors)
- src/types/index.ts (new — added Profile, Location interfaces)

### Packages installed
- date-fns (reason: relative time formatting)

---

## [Previous Session] — [Agent Name]
...
```

### Rules:

1. **Read CHANGELOG.md first** before writing any code. Understand what exists, what's pending, and what decisions were already made.
2. **Update CHANGELOG.md last** after finishing your work. Be specific — the next agent (or human) will rely on this.
3. **List every file** you created or modified. Don't summarize — be explicit.
4. **Log every package** you installed and why.
5. **Log every decision** where you had options and chose one. This prevents the next agent from undoing your work or choosing differently.
6. **Be honest about known issues.** Half-finished work is fine. Hiding it wastes the next agent's time.
7. **Note what's next.** Even a rough "next steps" list saves the next agent 10 minutes of orientation.

---

## TASK APPROACH

### Before you start coding:

```
1. Read CHANGELOG.md — understand current state
2. Read the relevant doc section (PRD for features, DESIGN_PRD for UI, ARD for backend)
3. Check what components/utilities already exist — don't rebuild
4. If the task is unclear, ask for clarification
```

### Before you say "done":

```
1. Test at 375px width (mobile) and 1280px width (desktop)
2. Verify TypeScript compiles (npx tsc --noEmit)
3. Verify all states work (loading, error, empty, success)
4. Verify auth/role guards work
5. Update CHANGELOG.md with everything you did
```

### When you're unsure:

```
1. Check the reference docs first
2. Check CHANGELOG.md for prior decisions on the same topic
3. If still unclear — state your options and ask
4. If it's a minor choice that doesn't affect architecture — pick one, log it, move on
```

---

## QUICK REFERENCE: COMMON PATTERNS

### Protect a page (auth guard):

```tsx
// In layout.tsx for cleaner/ or admin/
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export default async function CleanerLayout({ children }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'cleaner') redirect('/login');

  return <>{children}</>;
}
```

### Show a toast:

```tsx
// Use a global toast context/hook
const { showToast } = useToast();
showToast({ type: 'success', message: 'Checked in successfully!' });
showToast({ type: 'error', message: 'Something went wrong. Please try again.' });
```

### Fetch data in a Server Component:

```tsx
export default async function CleanersPage() {
  const supabase = await createServerClient();
  const { data: cleaners, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'cleaner')
    .order('full_name');

  if (error) return <ErrorState message="Failed to load cleaners" />;
  if (!cleaners?.length) return <EmptyState title="No cleaners yet" />;

  return <CleanerList cleaners={cleaners} />;
}
```

### Standard Button usage:

```tsx
<Button variant="primary" size="large" isLoading={isSubmitting} onClick={handleCheckin}>
  CHECK IN
</Button>

<Button variant="danger" size="default" onClick={() => setShowConfirm(true)}>
  Deactivate
</Button>

<Button variant="ghost" size="small" onClick={handleCancel}>
  Cancel
</Button>
```
