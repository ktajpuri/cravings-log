# CravingsLog — System Specification

Technical reference for contributors and maintainers. Covers architecture, data models, API contracts, component internals, and design decisions.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Authentication](#2-authentication)
3. [Database Schema](#3-database-schema)
4. [API Reference](#4-api-reference)
5. [Component Architecture](#5-component-architecture)
6. [Business Logic](#6-business-logic)
7. [Styling System](#7-styling-system)
8. [Data Flow Diagrams](#8-data-flow-diagrams)
9. [Key Design Decisions](#9-key-design-decisions)
10. [Maintenance Guide](#10-maintenance-guide)

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Next.js App (React 18, App Router)                      │    │
│  │                                                          │    │
│  │  Client Components (dashboard, form, modal, trivia)     │    │
│  │  └── fetch() → /api/* routes                           │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
              │ HTTP
              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Next.js Server (Vercel Edge / Node.js)                          │
│                                                                  │
│  ┌──────────────┐   ┌───────────────────┐   ┌───────────────┐  │
│  │ Middleware    │   │  API Route        │   │  Server       │  │
│  │ (auth guard) │   │  Handlers         │   │  Components   │  │
│  │ /dashboard/* │   │  /api/*           │   │  (login page) │  │
│  └──────────────┘   └─────────┬─────────┘   └───────────────┘  │
│                               │                                  │
│                    ┌──────────▼──────────┐                       │
│                    │  NextAuth v5        │                       │
│                    │  (session, OAuth)   │                       │
│                    └──────────┬──────────┘                       │
│                               │                                  │
│                    ┌──────────▼──────────┐                       │
│                    │  Prisma ORM         │                       │
│                    └──────────┬──────────┘                       │
└───────────────────────────────┼──────────────────────────────────┘
                                │ TLS
                                ▼
                    ┌───────────────────────┐
                    │  PostgreSQL (Neon)    │
                    │  5 tables             │
                    └───────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Google OAuth         │
                    │  (accounts.google.com)│
                    └───────────────────────┘
```

### Request lifecycle

1. Browser hits Next.js — server runs `middleware.ts` first on every request
2. Middleware calls `auth()` (NextAuth) — validates session cookie
3. Unauthenticated `/dashboard/*` requests → redirect to `/login`
4. Authenticated requests reach the page/route handler
5. API routes call `auth()` again to get `session.user.id` before any DB access
6. Prisma executes parameterised queries against PostgreSQL over TLS
7. Response serialised as JSON and returned to client

---

## 2. Authentication

### Provider

Google OAuth via NextAuth v5 with PrismaAdapter.

### Configuration — `auth.ts`

```typescript
NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google({ clientId, clientSecret })],
  pages: { signIn: "/login" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;   // inject DB user ID into JWT session
      return session;
    }
  }
})
```

### Session injection

By default, NextAuth does not include the database `user.id` in the client session. The `session` callback explicitly adds it so API routes can use `session.user.id` for ownership-scoped queries without a second lookup.

### Route protection

`middleware.ts` uses Next.js Middleware to guard the `/dashboard` prefix:

```typescript
export const config = { matcher: ["/dashboard/:path*"] }
```

Unauthenticated requests to any `/dashboard/*` path are redirected to `/login` before the page renders.

### NextAuth v5 notes

- Use `auth()` (not `getServerSession`) everywhere — in API routes, server components, and middleware
- The `handlers` export from `auth.ts` is re-exported in `/api/auth/[...nextauth]/route.ts`
- Session strategy: database sessions via `PrismaAdapter` (not JWT)

### OAuth callback URL

```
/api/auth/callback/google
```

Must be registered in Google Cloud Console for both `http://localhost:3000` (dev) and your production domain.

---

## 3. Database Schema

Managed with Prisma. Apply changes with `npm run db:push` (dev) or a migration in production.

### Entity Relationship

```
User ──< Craving
User ──< UserOption
TriviaQuestion (global, no user relation)

User ──< Account   (NextAuth)
User ──< Session   (NextAuth)
```

### Models

#### `User`
Standard NextAuth user. Extended by NextAuth + PrismaAdapter — do not rename fields.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String? | From Google profile |
| email | String (unique) | From Google profile |
| emailVerified | DateTime? | Not used (OAuth only) |
| image | String? | Google profile photo URL |
| createdAt | DateTime | Auto |

---

#### `Craving`
Core model. One record per logged craving.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | FK → User, cascade delete |
| intensity | Int | 1–10, validated in API |
| trigger | String? | e.g. "stress" |
| notes | String? | Free text |
| resisted | Boolean | Default false |
| location | String? | e.g. "home" |
| createdAt | DateTime | Auto, indexed |
| updatedAt | DateTime | Auto-updated |

Indexes: `userId`, `createdAt`

---

#### `UserOption`
Per-user lists of trigger and location chip values. Auto-seeded on first fetch.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | FK → User, cascade delete |
| type | String | `"trigger"` or `"location"` |
| value | String | Lowercased, trimmed |
| createdAt | DateTime | Auto |

Unique constraint: `(userId, type, value)` — prevents duplicate options per user.
Index: `(userId, type)` — used by every GET /api/options query.

Default seeds (inserted on first call per type per user):
- **Triggers**: stress, after coffee, boredom, after eating, social, alcohol, anxiety, habit, other
- **Locations**: home, office, outside, car, bar/restaurant, balcony, other

---

#### `TriviaQuestion`
Global pool of trivia/puzzle questions. Not user-scoped.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| question | String (unique) | Prevents duplicate seeds |
| answers | String[] | Always 4 options (PostgreSQL array) |
| correct | Int | 0-based index into `answers` |
| category | String | See categories below |
| type | String | See types below |
| difficulty | Int | 1=easy, 2=medium, 3=hard |
| createdAt | DateTime | Auto |

**Categories**: `geography`, `science`, `math`, `history`, `riddle`, `wordplay`, `culture`, `language`, `puzzle`

**Types**: `trivia`, `math`, `riddle`, `wordplay`, `puzzle`

Indexes: `category`, `type`

> Note: `answers` is stored as a PostgreSQL native array (`String[]`). When retrieved via `prisma.$queryRawUnsafe`, the `correct` and `difficulty` fields may return as `BigInt` — always normalise with `Number()` before serialising to JSON.

---

#### NextAuth models

`Account`, `Session`, `VerificationToken` — managed entirely by PrismaAdapter. Do not modify.

---

## 4. API Reference

All routes (except `/api/auth/*` and `/api/trivia`) require an active session. Missing or invalid sessions return `401`.

### `GET /api/cravings`

List cravings for the authenticated user.

**Query params:**

| Param | Type | Default | Notes |
|---|---|---|---|
| limit | number | 50 | Max records to return |
| from | ISO8601 | — | Filter: createdAt >= from |
| to | ISO8601 | — | Filter: createdAt <= to |

**Response:** `Craving[]` sorted by `createdAt DESC`.

---

### `POST /api/cravings`

Log a new craving.

**Body:**
```json
{
  "intensity": 7,
  "trigger": "stress",
  "notes": "Long day at work",
  "resisted": false,
  "location": "home"
}
```

`intensity` is required and must be 1–10. All other fields are optional.

**Response:** `Craving` (201)

---

### `PATCH /api/cravings/:id`

Update a craving. Ownership enforced — query uses both `id` and `userId`.

**Body:** Any subset of `{ intensity, trigger, notes, resisted, location }`.

**Response:** Updated `Craving`.

---

### `DELETE /api/cravings/:id`

Delete a craving. Ownership enforced.

**Response:** `{ success: true }`

---

### `GET /api/stats`

Return aggregated stats for the authenticated user.

**Response:**
```json
{
  "totalCravings": 42,
  "resistedCount": 34,
  "resistanceRate": "81%",
  "averageIntensity": 6.3,
  "mostCommonTrigger": "stress",
  "todayCount": 2,
  "currentStreak": 5
}
```

See [Streak calculation](#streak-calculation) below.

---

### `GET /api/options`

Return the authenticated user's chip options for a given type.

**Query params:**

| Param | Values |
|---|---|
| type | `trigger` \| `location` |

**Behaviour:** If the user has no options of that type yet, seeds defaults and returns them.

**Response:** `{ options: string[] }`

---

### `POST /api/options`

Add a custom trigger or location.

**Body:**
```json
{ "type": "trigger", "value": "after gym" }
```

Value is trimmed and lowercased before saving. Duplicate values for the same user+type are silently ignored (upsert with no-op update).

**Response:** `{ value: "after gym" }`

---

### `GET /api/trivia`

Return random trivia questions. No authentication required.

**Query params:**

| Param | Type | Default | Notes |
|---|---|---|---|
| count | number | 5 | Clamped to 1–20 |
| category | string | all | Filter by category |

**Response:** `TriviaQuestion[]`

```json
[
  {
    "id": "clxyz...",
    "question": "What is the capital of Japan?",
    "answers": ["Beijing", "Seoul", "Tokyo", "Bangkok"],
    "correct": 2,
    "category": "geography",
    "type": "trivia",
    "difficulty": 1
  }
]
```

Uses `ORDER BY RANDOM()` via `prisma.$queryRawUnsafe` for true DB-level randomness on every request.

---

## 5. Component Architecture

### Hierarchy

```
app/dashboard/page.tsx  (client, top-level state owner)
├── Navbar
├── StatsCard              ← receives Stats prop
├── CravingForm            ← calls onSuccess() after log
│   ├── IntensitySlider    ← internal subcomponent
│   ├── ChipGroup          ← internal subcomponent (×2: trigger, location)
│   └── FourDsModal        ← bottom sheet, opens after submit
│       └── TriviaGame     ← inside Distract step
└── CravingList            ← receives Craving[], calls onDelete()
```

### State ownership

`dashboard/page.tsx` owns `cravings[]` and `stats`. It passes callbacks (`onSuccess`, `onDelete`) down to `CravingForm` and `CravingList`. Both callbacks re-fetch data to keep the UI in sync.

`CravingForm` owns all form field state locally. After a successful POST, it resets its own state and opens the `FourDsModal`.

`FourDsModal` owns the active step index, trivia completion flag, and delay timer state. It closes and calls `onMarkResisted()` (= `fetchData`) when the user marks the craving as resisted.

### Component details

#### `CravingForm`

- Fetches trigger and location options from `/api/options` on mount
- `ChipGroup` subcomponent: if "other" is selected, reveals an inline `<input>` instead. On blur/Enter, POSTs to `/api/options` and inserts the new value before the "other" chip
- On submit: POSTs craving, captures `saved.id` from response, opens `FourDsModal` with that ID
- `onClose` on the modal calls `onSuccess()` to refresh the dashboard regardless of whether the user completed the 4Ds

#### `FourDsModal`

- Bottom sheet pattern: fixed positioned, `translateY(100%)` when closed → `translateY(0)` when open, CSS transition `ease-out 300ms`
- Backdrop: separate `div` with opacity transition, `pointer-events: none` when closed
- Resets all internal state (`step`, `triviaComplete`, `delayDone`) every time `open` changes to `true`
- Escape key listener attached/detached via `useEffect`
- Focus moved to close button on open (basic focus trap)

#### `DelayTimer` (inside `FourDsModal`)

- Countdown from 300s (5 min), decrements every second via `setTimeout` chain (not `setInterval` — avoids drift)
- Tracks `elapsed` separately from countdown for breathing phase calculation
- Breathing cycle: 16s total (4×4s: inhale → hold → exhale → hold)
- Phase scale animation uses CSS `transition` with duration equal to the phase duration — the circle CSS `transform: scale()` transitions smoothly between phases
- Affirmations rotate every 20s: `Math.floor(elapsed / 20) % AFFIRMATIONS.length`

#### `TriviaGame`

- `retryKey` state: incrementing it re-triggers the `useEffect` fetch (React's way to retry without a full remount)
- No `useMemo` shuffle — randomisation is done server-side by `ORDER BY RANDOM()`
- Answer buttons are `disabled` after selection to prevent double-taps
- Category label shown as emoji + text badge on each question

---

## 6. Business Logic

### Streak calculation

Location: `app/api/stats/route.ts`

```
1. Fetch all user's cravings, sorted by createdAt DESC
2. Group by ISO date (YYYY-MM-DD in user's server timezone)
3. Starting from today, iterate backward through each day:
   - If the day has no cravings → clean day, streak continues
   - If all cravings on that day have resisted=true → good day, streak continues
   - If any craving has resisted=false → streak broken, stop
4. Return streak count
5. Safety cap: 365 days
```

Edge case: If today has no cravings yet and yesterday's cravings were all resisted, the streak still counts. A day with zero cravings does not break the streak.

### Resistance rate

```typescript
Math.round((resistedCount / totalCravings) * 100) + "%"
```

Returns `"0%"` if `totalCravings === 0`.

### Average intensity

```typescript
Math.round((sumIntensity / totalCravings) * 10) / 10
```

One decimal place. Returns `0` if no cravings.

### Most common trigger

Groups all cravings by `trigger` field (excluding nulls), returns the trigger with the highest count. Ties broken by whichever appears first in the group result.

### UserOption auto-seeding

On the first `GET /api/options?type=trigger` call for a user:
1. Query `UserOption` for `(userId, type)`
2. If count === 0 → bulk insert seed values with `createMany({ skipDuplicates: true })`
3. Return seed values directly (avoids a second query)

On subsequent calls: return stored values, ordered by `createdAt ASC` (preserves insertion order — seeds first, custom values appended at end).

### Intensity colour mapping

Used in both `CravingForm` (slider) and `CravingList` (badge):

| Range | Colour | Tailwind |
|---|---|---|
| 1–3 | Green | `#22c55e` / emerald |
| 4–6 | Yellow/Amber | `#eab308` |
| 7–10 | Red | `#ef4444` |

The slider uses a finer gradient (5 stops: green → lime → yellow → orange → red).

---

## 7. Styling System

### CSS custom properties (`globals.css`)

```css
--md-shadow-1   /* subtle card lift */
--md-shadow-2   /* navbar, form cards */
--md-shadow-3   /* elevated cards */
--md-shadow-4   /* modal/bottom sheet */
```

### Tailwind brand palette (`tailwind.config.ts`)

Custom `brand` colour scale (indigo hues): 50, 100, 200, 500, 600, 700.

### CSS classes (`globals.css`)

| Class | Purpose |
|---|---|
| `.intensity-slider` | Custom range input with gradient track (WebKit + Firefox) |
| `.md-chip` | Chip button with hover/active overlay via `::after` pseudo-element |
| `.md-focus` | Material-style focus ring (indigo glow) |

### Inline styles for dynamic colours

Tailwind purges class names it cannot statically detect at build time. Any colour that is assembled dynamically (e.g. `` `bg-${color}-600` ``) will not be included in the CSS bundle.

**Rule:** Use inline `style={{ background: hex }}` for any colour value determined at runtime. Use Tailwind classes only for static values.

This applies to: chip selected states, intensity badge colours, FourDs step accent colours, trivia answer feedback colours.

---

## 8. Data Flow Diagrams

### Login flow

```
Browser                Next.js             Google              DB
   │                      │                   │                 │
   │ GET /                │                   │                 │
   │─────────────────────>│                   │                 │
   │ auth() → no session  │                   │                 │
   │<─ redirect /login ───│                   │                 │
   │                      │                   │                 │
   │ Click "Sign in"      │                   │                 │
   │─────────────────────>│ POST /api/auth/signin/google        │
   │                      │──────────────────>│                 │
   │                      │   OAuth consent   │                 │
   │<─────────────────────────────────────────│                 │
   │ Approve              │                   │                 │
   │─────────────────────────────────────────>│                 │
   │                      │<── auth code ─────│                 │
   │                      │ exchange for token│                 │
   │                      │ PrismaAdapter     │                 │
   │                      │ upsert User/Account/Session ───────>│
   │                      │<────────────────────────────────────│
   │<─ redirect /dashboard│                   │                 │
```

### Craving log + 4Ds flow

```
CravingForm          /api/cravings       DB          FourDsModal
    │                     │               │                │
    │ POST /api/cravings  │               │                │
    │────────────────────>│               │                │
    │                     │ INSERT Craving│                │
    │                     │──────────────>│                │
    │                     │<── { id, ...} │                │
    │<─── { id, ... } ────│               │                │
    │                     │               │                │
    │ setShowFourDs(true)  │               │                │
    │────────────────────────────────────────────────────> │
    │                     │               │                │
    │                     │          [User goes through 4Ds]
    │                     │               │                │
    │                     │   PATCH /api/cravings/:id      │
    │                     │<───────────────────────────────│
    │                     │ UPDATE resisted=true           │
    │                     │──────────────>│                │
    │                     │<──────────────│                │
    │                     │───────────────────────────────>│
    │ onMarkResisted() ── onSuccess()     │                │
    │ fetchData()         │               │                │
```

### Options auto-seed flow

```
CravingForm            /api/options              DB
    │                       │                     │
    │ GET /api/options       │                     │
    │ ?type=trigger          │                     │
    │──────────────────────>│                     │
    │                       │ SELECT UserOption    │
    │                       │ WHERE userId, type  │
    │                       │────────────────────>│
    │                       │<── [] (empty)        │
    │                       │                     │
    │                       │ createMany(seeds)    │
    │                       │────────────────────>│
    │                       │<── ok                │
    │<── { options: [...] } │                     │
    │                       │                     │
    │ (next time)           │                     │
    │ GET /api/options       │                     │
    │ ?type=trigger          │                     │
    │──────────────────────>│                     │
    │                       │ SELECT UserOption    │
    │                       │────────────────────>│
    │                       │<── [9 rows]          │
    │<── { options: [...] } │                     │
```

---

## 9. Key Design Decisions

### Why all pages are client components

The dashboard, form, and list all use `useState`/`useEffect` for data fetching and interactivity. Next.js 14 supports React Server Components (RSC), but mixing RSC with heavy client interaction (form state, modals, real-time updates) adds complexity without benefit at this scale. The entire dashboard is `"use client"`.

Login is a server component with a server action (`signIn`) — no client state needed.

### Why `db:push` instead of migrations

`prisma db push` directly syncs the schema to the database without creating migration files. This is appropriate for a project at this stage (small team, single environment, no production migration history needed). Switch to `prisma migrate` when you need:
- Tracked migration history
- Multi-environment promotion (dev → staging → prod)
- Rollback capability

### Why UserOptions are per-user, not global

Global options would make the feature simpler to query, but users have very different trigger/location contexts. Keeping options per-user means:
- Custom options don't pollute other users' lists
- Users can accumulate their own personalised history
- Future: users could delete their own options without affecting others

### Why `ORDER BY RANDOM()` for trivia

Prisma does not expose `RANDOM()` through its query builder. Options considered:

1. **Fetch all, shuffle in JS** — works but reads entire table on every request; unacceptable as question count grows
2. **Fetch pool of N, shuffle in JS** — better, but deterministic clustering around `skip` offset
3. **`$queryRawUnsafe` with `ORDER BY RANDOM()`** — true DB-level randomness, minimal data transfer, scales with table size ✓

The raw query is the only correct solution at scale. The trade-off is loss of Prisma type safety, mitigated by explicit TypeScript type annotations on the result and normalisation of `BigInt` fields.

### Why ChipGroup uses inline styles instead of Tailwind for active state

Tailwind's CSS purging scans source files at build time for complete class name strings. Dynamically assembled class names like `` `bg-${accentColor}-600` `` are invisible to the scanner and get stripped from the production bundle.

The fix: use `style={{ background: hex }}` for any value assembled at runtime. Static Tailwind classes (layout, spacing, border-radius) remain as Tailwind.

### Why the 4Ds modal opens after submit, not before

The craving is logged immediately on form submit. This ensures the data is captured even if the user abandons the 4Ds midway. The `resisted` flag is updated only if the user explicitly completes the routine and taps "Mark as resisted". This matches real-world behaviour — the user may not complete the 4Ds every time.

### Breathing timer: `setTimeout` chain vs `setInterval`

`setInterval` accumulates drift — each callback fires slightly late, and the drift compounds over 5 minutes. A `setTimeout` chain (each callback schedules the next one) resets the clock on every tick, keeping the countdown accurate.

---

## 10. Maintenance Guide

### Adding a new craving field

1. Add column to `Craving` model in `prisma/schema.prisma`
2. Run `npm run db:push`
3. Add field to `POST /api/cravings` body destructuring and `prisma.craving.create` data
4. Add field to `PATCH /api/cravings/[id]` update logic
5. Add UI in `CravingForm.tsx`
6. Display in `CravingList.tsx` if relevant

### Adding more trivia questions

Append to the `questions` array in `prisma/seed.ts` and run `npm run db:seed`. The seed is idempotent — existing questions (matched by `question` string) are skipped.

To add via SQL directly:
```sql
INSERT INTO "TriviaQuestion" (id, question, answers, correct, category, type, difficulty, "createdAt")
VALUES (gen_random_uuid(), 'Question text?', ARRAY['A','B','C','D'], 2, 'science', 'trivia', 1, NOW());
```

### Adding a new OAuth provider

1. Install the provider package if needed
2. Add to `providers` array in `auth.ts`
3. Add OAuth credentials to `.env.local`
4. PrismaAdapter handles user/account creation automatically

### Changing the session strategy to JWT

The current strategy stores sessions in the database (via `Session` table). To switch to stateless JWT:
1. Remove `adapter: PrismaAdapter(prisma)` from `auth.ts`
2. Add `session: { strategy: "jwt" }` to NextAuth config
3. Update the `session` callback to read from `token` instead of `user`
4. The `Session` and `Account` tables become unused

Trade-off: JWT sessions cannot be revoked server-side.

### Removing a user and their data

All `Craving` and `UserOption` records cascade-delete when the `User` is deleted (Prisma `onDelete: Cascade`). Delete the user record and everything else follows:

```typescript
await prisma.user.delete({ where: { id: userId } });
```

### Schema changes in production

Use `prisma db push` for non-destructive changes (adding nullable columns, adding tables, adding indexes). For destructive changes (renaming/removing columns), use a manual migration or switch to `prisma migrate` to generate SQL you can review before applying.

### Environment variables reference

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string with `?sslmode=require` for Neon |
| `AUTH_SECRET` | Yes | Min 32 bytes, generated with `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Yes | From Google Cloud Console OAuth client |
| `AUTH_GOOGLE_SECRET` | Yes | From Google Cloud Console OAuth client |
| `AUTH_URL` | Yes | Full base URL — must match registered OAuth redirect URI |

### Performance considerations

- The `/api/stats` route fetches all cravings for a user and processes them in JS. For users with thousands of cravings, add a `createdAt` index filter (e.g. last 90 days) or move streak/rate aggregations to SQL.
- The `/api/trivia` raw query is `O(n log n)` on the `TriviaQuestion` table due to `ORDER BY RANDOM()`. For tables under ~10k rows this is fine. Beyond that, use a keyset-based random sampling strategy.
- `/api/cravings` has a default limit of 50. The `@@index([userId])` and `@@index([createdAt])` indexes ensure this is fast even with large datasets.

### Local database inspection

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555` — a GUI browser for all tables.
