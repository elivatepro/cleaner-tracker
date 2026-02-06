# Tasks

## Project setup
- [ ] Initialize Next.js 14 (App Router) with TypeScript strict mode.
- [ ] Add Tailwind CSS config with design tokens from DESIGN_PRD.md.
- [ ] Create the required `src/` folder structure from AGENT_INSTRUCTIONS.md.
- [ ] Add base root files: `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`.

## Core UI components
- [ ] Build `src/components/ui/Button.tsx` (variants, sizes, loading, disabled).
- [ ] Build `src/components/ui/Input.tsx` (label, error, helper, states).
- [ ] Build `src/components/ui/Card.tsx` (variants, hover).
- [ ] Build `src/components/ui/Modal.tsx`.
- [ ] Build `src/components/ui/Badge.tsx`.
- [ ] Build `src/components/ui/Spinner.tsx`.
- [ ] Build `src/components/ui/Toast.tsx` + global toast provider/hook.

## Core utilities & types
- [ ] Add Supabase clients (`src/lib/supabase/client.ts`, `server.ts`, `admin.ts`).
- [ ] Add geofence helpers (`src/lib/geofence.ts`).
- [ ] Add geolocation helper (`src/lib/geolocation.ts`).
- [ ] Add Google geocode helper (`src/lib/geocode.ts`).
- [ ] Add email helper (`src/lib/email.ts`).
- [ ] Add theme tokens (`src/lib/theme.ts`).
- [ ] Define all types in `src/types/index.ts`.

## App shell & auth
- [ ] Build `src/app/layout.tsx` (font, global providers, branded loader).
- [ ] Build landing redirect `src/app/page.tsx`.
- [ ] Build auth pages `src/app/login/page.tsx`, `src/app/signup/page.tsx`.
- [ ] Add cleaner/admin layouts with auth guards.

## Cleaner flows
- [ ] Build cleaner dashboard `src/app/cleaner/page.tsx`.
- [ ] Build check-in page `src/app/cleaner/checkin/page.tsx`.
- [ ] Build checkout page `src/app/cleaner/checkout/page.tsx`.
- [ ] Build history page `src/app/cleaner/history/page.tsx`.
- [ ] Build profile page `src/app/cleaner/profile/page.tsx`.

## Admin panel
- [ ] Build admin dashboard `src/app/admin/page.tsx`.
- [ ] Build cleaners list + detail pages.
- [ ] Build locations list + detail pages.
- [ ] Build assignments management page.
- [ ] Build checklist management page.
- [ ] Build activity log + detail pages.
- [ ] Build settings page.

## API routes
- [ ] Implement auth routes (`/api/auth/*`).
- [ ] Implement admin routes (`/api/admin/*`).
- [ ] Implement cleaner routes (`/api/cleaner/*`).
- [ ] Implement public routes (`/api/invite/[token]`, `/api/settings/public`).

## PWA & branding
- [ ] Add `public/manifest.json` and required icons.
- [ ] Add `public/sw.js` (basic caching).
- [ ] Build `src/components/BrandedLoader.tsx`.

## QA & polish
- [ ] Verify mobile (375px) and desktop (1280px) layouts.
- [ ] Run `npx tsc --noEmit`.
- [ ] Confirm loading/error/empty/success states for data views.
- [ ] Confirm form validation + loading + toasts.
