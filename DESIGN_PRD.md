# Design PRD — CleanTrack
# The Definitive Design Reference for Development

**Version:** 1.0  
**Date:** February 5, 2026  
**Author:** Boko Isaac  
**Status:** Active Reference  
**Rule:** Every UI component, page, and interaction MUST comply with this document. If something is not covered here, ask before building.

---

## 1. Design Tokens

These are the single source of truth. Every color, size, and spacing value in the app must come from this section. No hardcoded values. No magic numbers.

### 1.1 Colors

All colors are stored in a central theme config (`lib/theme.ts` or `tailwind.config.ts`) and can be overridden via `app_settings` table or environment variables.

```
TOKEN NAME              HEX        TAILWIND CLASS       USAGE
─────────────────────────────────────────────────────────────────
--color-primary         #000000    bg-primary           Buttons, headers, nav active, loader bg
--color-secondary       #FFFFFF    bg-secondary         Text on primary, card bg, page bg
--color-accent          #10B981    bg-accent            Success states, active check-in, confirmations
--color-warning         #F59E0B    bg-warning           Geofence warnings, attention badges
--color-danger          #EF4444    bg-danger            Errors, blocked actions, sign-out, delete
--color-neutral-50      #FAFAFA    bg-neutral-50        Page background (cleaner)
--color-neutral-100     #F5F5F5    bg-neutral-100       Card backgrounds, input backgrounds
--color-neutral-200     #E5E5E5    bg-neutral-200       Borders, dividers, table borders
--color-neutral-300     #D4D4D4    bg-neutral-300       Disabled states, inactive borders
--color-neutral-400     #A3A3A3    text-neutral-400     Placeholder text, secondary text, hints
--color-neutral-600     #525252    text-neutral-600     Body text, descriptions
--color-neutral-900     #171717    text-neutral-900     Headings, primary text, labels
```

**Rules:**
- `--color-primary` and `--color-secondary` MUST be swappable via env vars (`NEXT_PUBLIC_PRIMARY_COLOR`, `NEXT_PUBLIC_SECONDARY_COLOR`) or the `app_settings` table
- Accent, warning, and danger colors are fixed — they are functional, not branding
- Never use raw hex values in components. Always reference the token
- Background of the entire app body is `--color-neutral-50` for cleaner side and `--color-secondary` (#FFFFFF) for admin side

### 1.2 Typography

```
FONT FAMILY:  Inter (import from Google Fonts)
FALLBACK:     system-ui, -apple-system, sans-serif

TOKEN NAME       SIZE    WEIGHT    LINE-HEIGHT    USAGE
───────────────────────────────────────────────────────────────
--text-display   32px    700       1.2            Splash screen company name
--text-h1        24px    700       1.2            Page titles ("Dashboard", "My Activity")
--text-h2        20px    600       1.3            Section titles ("Recent Activity", "Task Checklist")
--text-h3        16px    600       1.4            Card titles, table headers
--text-body      16px    400       1.5            Default text, descriptions, form inputs
--text-body-sm   14px    400       1.5            Timestamps, secondary info, metadata
--text-caption   12px    400       1.5            Labels, hints, helper text (use sparingly)
```

**Rules:**
- Minimum font size on any screen: 12px (captions only). Body text must NEVER be below 16px
- Headings are ALWAYS `--color-neutral-900`
- Body text is ALWAYS `--color-neutral-600`
- Links are `--color-primary` with underline on hover
- Never use font-weight below 400 or above 700

### 1.3 Spacing

Base unit: 4px. All spacing must be a multiple of 4px.

```
TOKEN       VALUE     TAILWIND    USAGE
─────────────────────────────────────────────────────
--space-1   4px       p-1         Tight inner padding (badges)
--space-2   8px       p-2         Inline element spacing, icon gaps
--space-3   12px      p-3         Compact padding (table cells)
--space-4   16px      p-4         Standard component padding, gap between form fields
--space-5   20px      p-5         Card inner padding
--space-6   24px      p-6         Section spacing within a page
--space-8   32px      p-8         Page horizontal padding (mobile)
--space-10  40px      p-10        Page vertical padding
--space-12  48px      p-12        Page horizontal padding (desktop)
--space-16  64px      p-16        Section breaks, large vertical gaps
```

**Rules:**
- Mobile page padding: 16px horizontal, 24px vertical
- Desktop page padding: 48px horizontal, 32px vertical
- Gap between form fields: 16px
- Gap between sections: 32px
- Gap between cards in a grid: 16px
- Never use spacing values that aren't in this table

### 1.4 Border Radius

```
TOKEN               VALUE     USAGE
──────────────────────────────────────────
--radius-sm         8px       Buttons, inputs, badges, small elements
--radius-md         12px      Cards, containers, modals
--radius-lg         16px      Bottom sheets, large modals
--radius-full       9999px    Avatars, circular icons, status dots
```

### 1.5 Shadows

```
TOKEN               VALUE                              USAGE
─────────────────────────────────────────────────────────────────
--shadow-sm         0 1px 2px rgba(0,0,0,0.05)         Cards at rest, inputs
--shadow-md         0 4px 6px rgba(0,0,0,0.07)         Cards on hover, elevated elements
--shadow-lg         0 10px 15px rgba(0,0,0,0.10)       Modals, dropdown menus, overlays
```

### 1.6 Z-Index Scale

```
TOKEN               VALUE     USAGE
──────────────────────────────────────────
--z-base            0         Default
--z-dropdown        10        Dropdown menus
--z-sticky          20        Sticky headers, bottom nav
--z-overlay         30        Modal backdrop
--z-modal           40        Modal content
--z-toast           50        Toast notifications
--z-loader          60        Branded splash loader (always on top)
```

---

## 2. Component Specifications

Every reusable component with its exact specs. Developers must build components to match these specifications.

### 2.1 Button

```
VARIANT       BG                TEXT              BORDER           HOVER
────────────────────────────────────────────────────────────────────────────
Primary       --color-primary   --color-secondary none             opacity 0.9
Secondary     --color-secondary --color-primary   1px primary      bg neutral-100
Outline       transparent       --color-primary   1px primary      bg neutral-50
Danger        --color-danger    #FFFFFF           none             opacity 0.9
Ghost         transparent       --color-neutral-600  none          bg neutral-100

SIZE          HEIGHT    PADDING (H)    FONT SIZE    ICON SIZE
─────────────────────────────────────────────────────────────
Small         36px      12px           14px         16px
Default       44px      20px           16px         20px
Large         52px      24px           16px         20px

STATES:
- Disabled:   opacity 0.5, cursor not-allowed
- Loading:    Replace text with Spinner component, button disabled
- Pressed:    transform scale(0.97), transition 100ms

BORDER-RADIUS: --radius-sm (8px)
FULL WIDTH:    When inside a form or modal, buttons are full width
ICON + TEXT:   Icon left of text, 8px gap
```

### 2.2 Input

```
PROPERTY          VALUE
─────────────────────────────────────────────
Height:           48px
Padding:          12px horizontal
Background:       --color-neutral-100
Border:           1px solid --color-neutral-200
Border radius:    --radius-sm (8px)
Font:             --text-body (16px)
Text color:       --color-neutral-900
Placeholder:      --color-neutral-400

STATES:
- Focus:          border-color --color-primary, ring 2px primary/20%
- Error:          border-color --color-danger, ring 2px danger/20%
- Disabled:       opacity 0.5, bg neutral-200

LABEL:
- Position:       Above input, 4px gap
- Font:           --text-body-sm (14px), weight 500
- Color:          --color-neutral-900

ERROR MESSAGE:
- Position:       Below input, 4px gap
- Font:           --text-caption (12px)
- Color:          --color-danger

HELPER TEXT:
- Position:       Below input, 4px gap
- Font:           --text-caption (12px)
- Color:          --color-neutral-400
```

### 2.3 Card

```
PROPERTY          VALUE
─────────────────────────────────────────────
Background:       --color-secondary (#FFFFFF)
Border:           1px solid --color-neutral-200
Border radius:    --radius-md (12px)
Shadow:           --shadow-sm
Padding:          20px
Hover (if clickable): shadow-md, translateY(-1px), transition 200ms

VARIANTS:
- Default:        As above
- Active:         Border 2px solid --color-accent (green border for active check-in)
- Warning:        Border 2px solid --color-warning
- Danger:         Border 2px solid --color-danger
```

### 2.4 Badge

```
SIZE              HEIGHT    PADDING (H)    FONT
──────────────────────────────────────────────────
Small             20px      6px            11px, weight 500
Default           24px      8px            12px, weight 500

BORDER-RADIUS:    --radius-full (pill shape)

VARIANTS:
- Success:        bg accent/10%, text accent         ("Active", "Within Range", "Checked In")
- Warning:        bg warning/10%, text warning        ("Pending", "Outside Range")
- Danger:         bg danger/10%, text danger           ("Inactive", "Blocked")
- Neutral:        bg neutral-200, text neutral-600    ("Checked Out", default)
- Live:           bg accent, text white, with pulse dot  ("Active Now")
```

### 2.5 Avatar

```
SIZE              DIMENSIONS    FONT (FALLBACK)
──────────────────────────────────────────────────
Small             32x32px       12px
Default           40x40px       14px
Large             64x64px       20px
XLarge            96x96px       32px (profile page only)

BORDER-RADIUS:    --radius-full (circle)
BORDER:           2px solid --color-neutral-200
FALLBACK:         If no image, show initials on --color-primary bg with --color-secondary text
IMAGE FIT:        object-fit: cover
```

### 2.6 Modal

```
PROPERTY          VALUE
─────────────────────────────────────────────
Backdrop:         rgba(0,0,0,0.5)
Background:       --color-secondary
Border radius:    --radius-lg (16px)
Shadow:           --shadow-lg
Padding:          24px
Width:            min(480px, calc(100vw - 32px))
Position:         Centered vertically and horizontally

MOBILE OVERRIDE:  Below 640px, modals become full-screen (100vw x 100vh, no border radius)

HEADER:           Title (--text-h2) + close button (X icon, top right)
FOOTER:           Action buttons, right-aligned. Primary action on the right.

ANIMATION:
- Enter:          Fade in backdrop (200ms) + scale modal from 0.95 to 1 (200ms)
- Exit:           Reverse of enter

CLOSE TRIGGERS:   X button, click backdrop, Escape key
```

### 2.7 Toast

```
PROPERTY          VALUE
─────────────────────────────────────────────
Position:         Top center, 16px from top
Width:            min(400px, calc(100vw - 32px))
Border radius:    --radius-sm
Shadow:           --shadow-lg
Padding:          12px 16px
Z-index:          --z-toast (50)
Auto-dismiss:     3 seconds (success), 5 seconds (error), manual dismiss available

VARIANTS:
- Success:        Left border 4px --color-accent, icon CheckCircle
- Error:          Left border 4px --color-danger, icon XCircle
- Warning:        Left border 4px --color-warning, icon AlertTriangle
- Info:           Left border 4px --color-primary, icon Info

ANIMATION:
- Enter:          Slide down from -100%, fade in (300ms ease-out)
- Exit:           Slide up to -100%, fade out (200ms ease-in)
```

### 2.8 Table (Admin)

```
PROPERTY              VALUE
─────────────────────────────────────────────
Header bg:            --color-neutral-100
Header text:          --text-body-sm, weight 600, --color-neutral-600, uppercase, letter-spacing 0.05em
Row height:           56px minimum
Row border:           1px solid --color-neutral-200 (bottom)
Row hover:            bg --color-neutral-50
Cell padding:         12px horizontal, 16px vertical
Cell text:            --text-body (16px), --color-neutral-900

MOBILE BEHAVIOR:      Below 768px, tables convert to card layout (each row becomes a stacked card)

SORTABLE COLUMNS:     Show chevron icon (up/down) next to header text. Active sort column is --color-primary
PAGINATION:           Below table. "← Prev | Page X of Y | Next →". Buttons are Ghost variant.
```

### 2.9 Checkbox

```
PROPERTY          VALUE
─────────────────────────────────────────────
Size:             24x24px
Border:           2px solid --color-neutral-300
Border radius:    6px
Background:       --color-secondary (unchecked), --color-primary (checked)
Checkmark:        White, 2px stroke, animated scale 0→1 (150ms)
Tap target:       48x48px (invisible padding around the checkbox)
Label gap:        12px (between checkbox and text)
Label font:       --text-body
```

### 2.10 Slider (Geofence Radius)

```
PROPERTY          VALUE
─────────────────────────────────────────────
Track height:     6px
Track bg:         --color-neutral-200
Track fill:       --color-primary
Thumb size:       24x24px circle
Thumb bg:         --color-primary
Thumb border:     3px solid --color-secondary
Min label:        Left-aligned below track, --text-caption
Max label:        Right-aligned below track, --text-caption
Value display:    Above thumb or in adjacent input field, --text-body, weight 600
```

---

## 3. Layout Specifications

### 3.1 Cleaner Layout (Mobile-First)

```
STRUCTURE:
┌──────────────────────────────────┐
│ Status Bar (device native)       │  ← PWA standalone hides this
├──────────────────────────────────┤
│ App Header (56px)                │
├──────────────────────────────────┤
│                                  │
│ Content Area                     │  ← Scrollable
│ (padding: 16px horizontal,      │
│  24px top, 80px bottom)         │  ← 80px bottom to clear nav
│                                  │
├──────────────────────────────────┤
│ Bottom Navigation (64px)         │  ← Fixed at bottom
└──────────────────────────────────┘

APP HEADER:
- Height:         56px
- Background:     --color-secondary
- Border bottom:  1px solid --color-neutral-200
- Left:           Avatar (32px) + Greeting text
- Right:          Settings icon (24px, --color-neutral-400)
- Position:       Sticky top

BOTTOM NAVIGATION:
- Height:         64px + safe-area-inset-bottom
- Background:     --color-secondary
- Border top:     1px solid --color-neutral-200
- Items:          3 (Home, History, Profile)
- Icon size:      24px
- Label font:     --text-caption (12px)
- Active:         --color-primary (icon + label)
- Inactive:       --color-neutral-400
- Position:       Fixed bottom
```

### 3.2 Admin Layout (Desktop-First)

```
STRUCTURE:
┌──────────────────────────────────────────────────────────────┐
│ Top Bar (64px)                                               │
├─────────────┬────────────────────────────────────────────────┤
│             │                                                │
│  Sidebar    │  Content Area                                  │
│  (240px)    │  (max-width: 1200px, centered)                 │
│             │  (padding: 32px)                               │
│             │                                                │
│             │                                                │
│             │                                                │
│             │                                                │
└─────────────┴────────────────────────────────────────────────┘

TOP BAR:
- Height:         64px
- Background:     --color-primary
- Left:           Logo (32px height) + Company Name (--text-h3, --color-secondary)
- Right:          Admin name + avatar (32px) + dropdown trigger
- Position:       Sticky top
- Z-index:        --z-sticky

SIDEBAR:
- Width:          240px (desktop), 64px icons-only (tablet), hidden + hamburger (mobile)
- Background:     --color-secondary
- Border right:   1px solid --color-neutral-200
- Position:       Fixed left, full height minus top bar
- Nav item height: 44px
- Nav item padding: 12px horizontal
- Nav item active: bg --color-neutral-100, left border 3px --color-primary, text --color-primary
- Nav item hover:  bg --color-neutral-50
- Nav item icon:   20px, 12px gap to label
- Nav item font:   --text-body (16px), weight 400 (normal), weight 600 (active)

CONTENT AREA:
- Background:     --color-neutral-50
- Max width:      1200px
- Padding:        32px
- Centered:       Auto horizontal margin when viewport > 1200px + sidebar
```

### 3.3 Page Header Pattern

Every page (admin and cleaner) follows this header pattern:

```
PAGE HEADER:
- Title:          --text-h1 (24px bold), --color-neutral-900
- Subtitle:       --text-body-sm (14px), --color-neutral-400 (optional)
- Action button:  Right-aligned on same line as title (desktop), below title (mobile)
- Margin bottom:  24px before content starts
```

---

## 4. Page-by-Page Requirements

### 4.1 Branded Splash Loader

**When it appears:** Every app open, until auth session is resolved and initial data is loaded.

**Duration rules:**
- Minimum display: 800ms (even if data loads instantly — prevents flash)
- Maximum display: 10s (show error state after 10s with "Retry" button)

**Implementation:**

```
CONTAINER:
- Position:       fixed, inset 0
- Background:     --color-primary
- Z-index:        --z-loader (60)
- Display:        flex, center everything

LOGO:
- Size:           64x64px
- Position:       Centered
- Source:         app_settings.logo_url OR fallback to company name text

SPINNER RING:
- Size:           120x120px (logo sits inside this)
- Border:         3px solid rgba(255,255,255,0.15)
- Border-top:     3px solid --color-secondary
- Animation:      rotate 360deg, 1s linear infinite
- Position:       Centered, logo is absolutely positioned inside

COMPANY NAME:
- Position:       24px below the spinner ring
- Font:           --text-body-sm, --color-secondary, opacity 0.8

EXIT ANIMATION:
- Trigger:        When isLoading becomes false
- Animation:      Fade out opacity 1→0, 300ms ease-out
- After animation: Remove from DOM (display none or unmount)
```

### 4.2 Login Page

**URL:** `/login`

**Elements (top to bottom):**

1. Company logo — 64x64px, centered, 48px from top of content area
2. Company name — --text-h1, --color-neutral-900, 8px below logo
3. Gap — 40px
4. Email input — Full width, label "Email", type email, autocomplete email
5. Gap — 16px
6. Password input — Full width, label "Password", type password, show/hide toggle icon
7. Gap — 24px
8. Sign In button — Full width, Primary variant, Large size
9. Gap — 16px
10. "Don't have an account?" — --text-body-sm, --color-neutral-400, centered
11. "Sign up with invitation" — --text-body-sm, --color-primary, underline, centered, links to `/signup`

**Error states:**
- Invalid credentials: Toast error "Invalid email or password"
- Empty fields: Inline error below each empty field "This field is required"
- Network error: Toast error "Something went wrong. Please try again."

**Loading state:**
- On submit: Sign In button shows spinner, all inputs disabled

**Page background:** --color-neutral-50
**Content max-width:** 400px, centered

### 4.3 Signup Page

**URL:** `/signup?token=INVITE_TOKEN`

**Pre-conditions:**
- If no token in URL or token is invalid/expired → redirect to `/login` with Toast warning "Invalid or expired invitation"
- If token is valid → pre-fill email field from invitation record (read-only)

**Elements (top to bottom):**

1. Back arrow + "Back to Login" — top left, --text-body-sm
2. "Create Account" — --text-h1, centered
3. Gap — 24px
4. Avatar upload — 96x96px circle, centered, camera icon overlay, tap to open file picker. Shows "Add Photo (Optional)" text below
5. Gap — 24px
6. Full Name input — required
7. Email input — pre-filled from invite, read-only (grayed out), label shows "Email (from invitation)"
8. Phone Number input — required, type tel
9. Password input — required, minimum 8 characters, show/hide toggle
10. Gap — 24px
11. Create Account button — Full width, Primary, Large

**On success:** Redirect to `/cleaner` (home), Toast success "Welcome to [Company Name]!"

### 4.4 Cleaner Home — No Active Check-in

**URL:** `/cleaner`

**Greeting section:**
- Avatar (32px) + "Good [morning/afternoon/evening], [First Name]" — --text-h3
- Time rules: morning (5AM-12PM), afternoon (12PM-5PM), evening (5PM-9PM), night (9PM-5AM)
- Settings gear icon right-aligned

**Primary assignment card:**
- Full width Card component with --shadow-sm
- Location pin icon (--color-primary) + Location name (--text-h3)
- Address text (--text-body-sm, --color-neutral-400)
- "Geofence: [X]m radius" — --text-caption, --color-neutral-400
- Gap — 16px
- CHECK IN button — Full width, Primary, Large, inside the card

**"My Locations" section (if multiple assignments):**
- Section title "My Locations" — --text-h3
- Horizontal scroll container of small location cards
- Each card: 160px wide, location name (--text-body-sm, weight 600), address truncated (--text-caption)
- Tap a card → it becomes the primary assignment card above

**No assignments state:**
- EmptyState component: icon MapPin (48px, --color-neutral-300), "No assignments yet" (--text-h3), "Your admin will assign you to a location." (--text-body-sm, --color-neutral-400)

### 4.5 Geofence Check Flow

**Triggered when:** Cleaner taps CHECK IN

**Step 1 — Getting Location:**
- CHECK IN button enters loading state
- Text below button: "Getting your location..." with pulsing location icon
- GPS request via browser Geolocation API

**Step 2A — Within geofence:**
- Brief success flash (button turns accent green with checkmark, 500ms)
- Then proceed to record check-in
- Toast success "Checked in at [Location Name]"
- Screen transitions to active check-in state (4.6)

**Step 2B — Outside geofence:**
- Replace the primary card content with the warning state:
  - Warning triangle icon — 48px, --color-warning
  - "Too Far Away" — --text-h2, --color-warning
  - "You are [X]m away from [Location Name]." — --text-body
  - "You need to be within [radius]m to check in." — --text-body-sm, --color-neutral-400
  - Gap — 24px
  - TRY AGAIN button — Full width, Primary, Large (re-triggers GPS capture)
  - "Cancel" link below — --text-body-sm, --color-neutral-400 (returns to normal home state)

**Step 2C — GPS error/denied:**
- Replace card content with error state:
  - XCircle icon — 48px, --color-danger
  - "Location Access Required" — --text-h2
  - "Please enable location access in your browser settings to check in." — --text-body
  - TRY AGAIN button

### 4.6 Cleaner Home — Active Check-in

**URL:** `/cleaner` (same page, different state)

**Primary card changes:**
- Card border: 2px solid --color-accent (green)
- CheckCircle icon (--color-accent) replaces MapPin
- "Currently Checked In" badge — Success variant, top right of card
- Location name + address (same as before)
- "Checked in at [time]" — --text-body-sm, --color-neutral-600
- "Duration: [Xh Ym]" — --text-body, weight 600, --color-neutral-900 — updates every 60 seconds
- Gap — 16px
- CHECK OUT button — Full width, Primary, Large

**All other UI elements are hidden/dimmed.** The active check-in is the ONLY action available. My Locations section is hidden. Focus 100% on the current job.

### 4.7 Checkout Flow

**URL:** `/cleaner/checkout?checkin=[ID]` (or modal/sheet — developer's choice, but full page preferred for simplicity)

**Page title:** "Check Out" with back arrow

**Section 1 — Location Summary:**
- Location name — --text-h3
- "Checked in at [time]" — --text-body-sm

**Section 2 — Task Checklist:**
- Section title "Task Checklist" — --text-h2
- Divider line
- Subtitle "Default Tasks" — --text-body-sm, --color-neutral-400, weight 600, uppercase
- List of default checklist items — each is a Checkbox (24px) + label (--text-body), 48px row height, 8px vertical gap
- If location has custom items:
  - Gap — 16px
  - Subtitle "Location Tasks" — --text-body-sm, --color-neutral-400, weight 600, uppercase
  - List of custom checklist items — same format

**Section 3 — Photos:**
- Section title "Add Photos" with "(optional)" in --color-neutral-400 — --text-h3
- Thumbnail grid: 80x80px squares, --radius-sm, 8px gap
- First tile: dashed border (--color-neutral-300), Camera icon centered (--color-neutral-400), tap to open camera/file picker
- Uploaded tiles: image thumbnail with X button (top right, 20px circle, --color-danger bg, white X)
- Max 5 photos. After 5, the "+" tile disappears. Show "5/5 photos" text.

**Section 4 — Remarks:**
- Section title "Remarks" with "(optional)" in --color-neutral-400 — --text-h3
- Textarea: --text-body, min-height 80px, auto-expand up to 200px, max 500 characters
- Character counter: bottom right, --text-caption, --color-neutral-400, turns --color-danger at 450+

**Section 5 — Submit:**
- Gap — 24px
- COMPLETE CHECKOUT button — Full width, Primary, Large
- Button state: if admin requires all tasks checked and not all are checked → button is disabled with tooltip "Complete all required tasks"

### 4.8 Checkout Confirmation

**Displayed after successful checkout (inline or new page)**

**Layout:**
- CheckCircle icon — 64px, --color-accent, centered
- "Checkout Complete!" — --text-h1, centered
- Gap — 24px
- Summary card:
  - Location name — --text-h3
  - Check-in time → Check-out time — --text-body
  - Duration — --text-body, weight 600
  - Tasks completed — "X/Y completed" — --text-body-sm
  - Photos uploaded — "X uploaded" — --text-body-sm
- Gap — 32px
- BACK TO HOME button — Full width, Primary, Large → navigates to `/cleaner`

### 4.9 Activity History (Cleaner)

**URL:** `/cleaner/history`

**Grouping:** Entries grouped by date. Date headers: "Today", "Yesterday", or "Feb 3, 2026" format.

**Date header:** --text-body-sm, weight 600, --color-neutral-400, uppercase, 24px top margin, 8px bottom margin

**Activity card (per entry):**
- Card component
- Location name — --text-h3
- Time range: "[check-in time] → [check-out time]" — --text-body-sm, --color-neutral-600
- Bottom row: Duration badge (--text-caption, --color-neutral-200 bg) + Tasks badge ("X/Y tasks", success variant if all complete)
- Tap → navigate to detail view showing full checklist, photos, remarks

**Pagination:** "Load more" button at bottom (Ghost variant) or infinite scroll

**Empty state:** "No activity yet. Check in at a location to see your history here."

### 4.10 Profile Page (Cleaner)

**URL:** `/cleaner/profile`

**Elements (top to bottom):**
1. Avatar — XLarge (96px), centered, with camera overlay icon
2. "Change Photo" link — --text-body-sm, --color-primary, centered
3. Gap — 32px
4. Full Name input — editable
5. Email input — read-only (--color-neutral-400 bg, no focus state)
6. Phone input — editable
7. Gap — 24px
8. SAVE CHANGES button — Full width, Primary, disabled until changes are made
9. Gap — 16px
10. SIGN OUT button — Full width, Danger Outline variant (--color-danger border + text, transparent bg)

### 4.11 Admin Dashboard

**URL:** `/admin`

**Stat cards (top row):**
- 4 cards in a row (2x2 on mobile)
- Each card: StatCard component
  - Number: --text-display (32px, 700 weight), --color-neutral-900
  - Label: --text-body-sm, --color-neutral-400
  - Cards: "Cleaners" (total), "Locations" (total), "Active Now" (with pulsing green dot), "This Week" (check-ins count)

**Recent Activity section:**
- Table component with columns: Avatar+Name, Location, Action (badge: "Checked In" success / "Checked Out" neutral), Time
- Show last 10 entries
- "View All Activity →" link at bottom → navigates to `/admin/activity`

**Currently Active section (if any cleaners are checked in):**
- Horizontal card row
- Each card: Avatar + name, location name, "Since [time]", live duration with pulsing green dot
- If no one is active: hide this section entirely

### 4.12 Admin — Cleaner Management

**URL:** `/admin/cleaners`

**Page header:** "Cleaners" title + "+ Invite Cleaner" button (Primary, default size)

**Search bar:** Full width input, placeholder "Search cleaners...", search icon left

**Table columns:** Avatar+Name, Email, Phone, Status (badge), Actions (dropdown: View Profile, Deactivate/Activate)

**Pending Invitations section (below table):**
- Only visible if there are pending invites
- Section title "Pending Invitations" — --text-h3
- Each row: email, sent date, expiry date, "Resend" button (Ghost)

**Invite modal:** Triggered by "+ Invite Cleaner" button. See Component Spec 2.6 for modal design.

### 4.13 Admin — Location Management

**URL:** `/admin/locations`

**Page header:** "Locations" + "+ Add Location" button

**Table columns:** Name, Address, Radius (with "m" suffix), Cleaners assigned (count), Status (badge), Actions

**Click row** → navigate to `/admin/locations/[id]` detail page

**Add Location modal:** Name input, Address textarea, Radius slider (50-500m) + number input synced, Save button. Info text below address: "Address will be converted to GPS coordinates automatically."

### 4.14 Admin — Location Detail

**URL:** `/admin/locations/[id]`

**Back link:** "← Locations"

**Location header:** Name (--text-h1), Edit + overflow menu buttons. Address, "Geofence: Xm", Status badge below.

**Assigned Cleaners subsection:** Avatar chips (name + avatar in a pill shape), "+ Assign" button opens a dropdown/modal to select from unassigned cleaners. X on each chip to remove assignment.

**Custom Checklist subsection:** "Custom Checklist Items" title + "+ Add Item" button. List with drag handles for reorder, edit and delete icons per item. Note: "These appear in addition to the default checklist."

**Recent Activity subsection:** Table of recent check-ins/outs at this location.

### 4.15 Admin — Default Checklist

**URL:** `/admin/checklist`

**Page header:** "Default Checklist" + "+ Add Item" button

**Description:** "These tasks appear on every checkout, regardless of location." — --text-body-sm, --color-neutral-400

**List:** Drag-handle + label + Edit button + Delete button per row. Sortable via drag and drop.

**Add/Edit:** Inline text input that appears at the bottom (or modal — developer's choice, but inline is faster UX).

### 4.16 Admin — Activity Log

**URL:** `/admin/activity`

**Page header:** "Activity Log" + "Export CSV" button (Secondary variant with Download icon)

**Filters row (below header):**
- Cleaner dropdown (all / specific cleaner)
- Location dropdown (all / specific location)
- Date range picker (start date – end date)
- Status dropdown (all / checked in / checked out)
- All filters are on one row (desktop) or stacked 2x2 (mobile)

**Table columns:** Cleaner (avatar+name), Location, Date, Check-in time, Check-out time, Duration, Tasks (X/Y), Geofence flag (⚠ icon if violation)

**Row click** → navigate to `/admin/activity/[id]` detail

**Geofence violation indicator:** ⚠ warning icon (--color-warning) next to the cleaner name if either check-in or checkout was outside geofence

**Pagination:** Below table, 20 items per page

### 4.17 Admin — Activity Detail

**URL:** `/admin/activity/[id]`

**Back link:** "← Activity Log"

**Header:** Cleaner name + avatar, location name, date

**Summary card:** Check-in time, check-out time, duration, geofence status at check-in (✅ Within / ⚠ Outside [Xm]), geofence status at checkout (same)

**Checklist section:** Full task list with ✅ (completed, --color-accent) and ❌ (not completed, --color-danger) icons. Completion count "X of Y completed."

**Photos section:** Thumbnail grid (120x120px), click to open full-size in a lightbox modal. Show count "X photos."

**Remarks section:** Text block in a Card, or "No remarks" in --color-neutral-400 italic if empty.

### 4.18 Admin — Settings

**URL:** `/admin/settings`

**Sections separated by 32px gaps:**

**Company Information:**
- Company Name input
- Company Logo — current logo preview (64px) + "Upload New" button (Secondary). Accepts PNG, JPG, SVG, WebP. Max 2MB.
- Primary Color — color swatch (24x24 circle) + hex input. Color picker on click.
- Secondary Color — same as above

**Defaults:**
- Default Geofence Radius — number input + "meters" suffix. This pre-fills when creating new locations.

**Notifications:**
- Checkbox: "Email me when a cleaner checks in"
- Checkbox: "Email me when a cleaner checks out"

**SAVE SETTINGS button** — Full width (mobile) or auto-width right-aligned (desktop), Primary, disabled until changes made.

---

## 5. Interaction & Animation Rules

### 5.1 Page Transitions

- All page navigations: Fade transition, 200ms ease
- No slide transitions (keep it simple and fast)

### 5.2 Loading States

**Every async action must have a loading state. No exceptions.**

| Action | Loading Indicator |
|---|---|
| Page load | Skeleton placeholders (pulse animation) |
| Button submit | Button spinner (replaces text, button disabled) |
| Data fetch | Skeleton rows in tables, skeleton cards in grids |
| Image upload | Progress bar overlay on thumbnail |
| GPS capture | Pulsing location icon + "Getting your location..." text |

**Skeleton spec:**
- Background: --color-neutral-200
- Animation: Pulse opacity 0.5→1→0.5, 1.5s ease-in-out infinite
- Shape: Match the element being loaded (rectangle for text, circle for avatar, etc.)
- Border radius: Same as the element being loaded

### 5.3 Empty States

**Every list, table, and data view must have an empty state.**

```
EMPTY STATE COMPONENT:
- Icon:           48px, --color-neutral-300
- Title:          --text-h3, --color-neutral-900
- Description:    --text-body-sm, --color-neutral-400, max-width 300px, centered
- Action button:  Optional, Secondary variant (e.g., "Invite your first cleaner")
- Vertical center in the available space
```

### 5.4 Error States

**Every form must handle errors. Every API call must handle failure.**

- Form validation: Inline errors below fields (--text-caption, --color-danger)
- API errors: Toast error with message
- Network errors: Toast error "Something went wrong. Please try again."
- 404 pages: EmptyState component with "Page not found" + "Go Home" button

### 5.5 Confirmation Dialogs

**Destructive actions require confirmation:**
- Deactivate cleaner
- Deactivate location
- Remove assignment
- Delete checklist item

**Confirmation modal:**
- Title: "Are you sure?"
- Description: Specific to the action (e.g., "This will deactivate Sarah Johnson's account. They won't be able to check in until reactivated.")
- Two buttons: "Cancel" (Ghost) + "Confirm" (Danger)

---

## 6. Responsive Rules

### 6.1 Breakpoints

```
MOBILE:     0 — 639px      (sm)
TABLET:     640 — 1023px   (md)
DESKTOP:    1024px+         (lg)
```

### 6.2 Responsive Behavior Table

| Element | Mobile | Tablet | Desktop |
|---|---|---|---|
| Admin sidebar | Hamburger menu (overlay) | Icons only (64px) | Full sidebar (240px) |
| Admin top bar | Logo + hamburger left, avatar right | Same | Logo + name left, avatar right |
| Cleaner bottom nav | Visible, 64px fixed | Visible | Hidden |
| Stat cards | 2 columns | 4 columns | 4 columns |
| Tables | Card layout (stacked) | Horizontal scroll | Full table |
| Modals | Full screen | Centered, max 480px | Centered, max 480px |
| Forms | Single column | Single column | Single column (max 600px) |
| Page padding | 16px horizontal | 24px horizontal | 32px horizontal |
| Filters row | Stacked (1 per row) | 2 per row | 4 per row inline |
| Photo grid | 3 columns (80px each) | 4 columns | 5 columns |
| Action buttons | Full width, stacked | Auto width, inline | Auto width, inline |

### 6.3 Touch Targets

**Minimum touch target: 44x44px. Recommended: 48x48px.**

This applies to:
- Buttons (already covered by height spec)
- Checkboxes (24px visual + invisible 48px padding)
- Table rows (56px min height)
- Nav items (44px min height)
- Close buttons on modals
- Photo remove buttons
- Dropdown triggers

---

## 7. PWA Requirements

### 7.1 Manifest

```json
{
  "name": "[Company Name] - CleanTrack",
  "short_name": "[Company Name]",
  "description": "Check in and track your cleaning assignments",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 7.2 Meta Tags (in root layout)

```html
<meta name="theme-color" content="#000000" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

### 7.3 Service Worker

Minimal service worker for PWA install eligibility:
- Cache: App shell (HTML, CSS, JS, fonts)
- Strategy: Network-first with cache fallback for pages, cache-first for static assets
- Offline page: Simple "You're offline" message with company logo

### 7.4 Install Prompt

- Do NOT show a custom install banner. Let the browser handle the native install prompt.
- On the login and cleaner home pages, include a subtle hint: "Tip: Add to your home screen for quick access" — --text-caption, --color-neutral-400, show only once (localStorage flag)

---

## 8. Email Template Design

### 8.1 Shared Template Structure

All emails use the same HTML template with variable content.

```
WIDTH:          600px max, centered
BACKGROUND:     #F5F5F5 (email body), #FFFFFF (content card)
CARD:           border-radius 8px, padding 32px

HEADER:
- Logo:         48px height, centered
- Company name: 20px bold, --color-neutral-900, centered, 8px below logo

BODY:
- Heading:      24px bold, --color-neutral-900
- Text:         16px, --color-neutral-600, line-height 1.6
- CTA Button:   background --color-primary, color --color-secondary, padding 14px 32px, border-radius 8px, 16px font bold, centered

FOOTER:
- Divider:      1px solid #E5E5E5, full width
- Text:         12px, #A3A3A3, centered
- Content:      "© 2026 [Company Name]" + "Powered by CleanTrack"
```

### 8.2 Invitation Email

**Subject:** "You're invited to join [Company Name] on CleanTrack"

**Body:**
- Heading: "Welcome to [Company Name]!"
- Text: "You've been invited to join [Company Name]'s cleaning team. Create your account to start tracking your assignments."
- CTA: "Create Your Account" → signup URL with token
- Footnote: "This invitation expires in 72 hours."

### 8.3 Check-in Confirmation

**Subject:** "✅ Checked in at [Location Name]"

**Body:**
- Heading: "Check-in Confirmed"
- Text: "You successfully checked in at [Location Name] at [Time] on [Date]."
- No CTA button needed

### 8.4 Check-out Confirmation

**Subject:** "✅ Checkout complete — [Location Name]"

**Body:**
- Heading: "Checkout Complete"
- Summary table: Location, Check-in time, Check-out time, Duration, Tasks completed (X/Y)
- No CTA button needed

---

## 9. Developer Checklist

Before any PR is merged, verify:

- [ ] All colors reference design tokens (no hardcoded hex)
- [ ] All text uses typography tokens (no custom font sizes)
- [ ] All spacing uses the spacing scale (multiples of 4px)
- [ ] All interactive elements have minimum 48px touch target
- [ ] All async actions have loading states
- [ ] All lists/tables have empty states
- [ ] All forms have validation + error states
- [ ] All destructive actions have confirmation dialogs
- [ ] Responsive: tested at 375px (mobile), 768px (tablet), 1280px (desktop)
- [ ] Branded loader appears on initial load
- [ ] Toast notifications for success/error feedback
- [ ] No raw HTML buttons — always use Button component
- [ ] No raw HTML inputs — always use Input component
- [ ] Avatar fallback (initials) works when no image
- [ ] Tables convert to card layout on mobile
- [ ] Admin sidebar collapses correctly at each breakpoint
- [ ] PWA installable (Lighthouse check)
- [ ] Fonts loaded from Google Fonts (Inter)
- [ ] Icons from Lucide React only
