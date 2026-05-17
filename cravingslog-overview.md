# CravingLog — Product Overview

## What it is

A mobile-first PWA for tracking and resisting cravings (food, smoking, etc.). Users log cravings in real time, work through a guided 5-step resistance flow, and watch their stats and streak improve over time.

---

## Key Features

### Craving Logging
- Intensity slider (1–10, color-coded green → yellow → red)
- Trigger and location chip selectors with custom "add your own" option
- Free-text notes field
- Resisted toggle

### 5Ds Craving Relief Modal (bottom sheet)
Five sequential steps activated after every log:

| Step | Name | What happens |
|------|------|-------------|
| D1 | Drink | Drink water reminder |
| D2 | Delay | 5-minute countdown with animated box-breathing circle and rotating affirmations |
| D3 | Distract | Interactive trivia mini-game (90+ questions, multiple categories/difficulties) |
| D4 | Discuss | Prompt to reach out to support |
| D5 | Distance | Prompt to physically change environment |

### Stats Dashboard
- Resistance rate, current streak, average intensity, most common trigger/location, today's count
- Line/bar chart of cravings over time (Recharts)

### Auth
- Google OAuth via NextAuth v5 + PrismaAdapter
- Middleware-protected `/dashboard/*` routes
- Session injected with `user.id` for all API ownership checks

### Personalisation
- Per-user trigger and location chip options stored in the database, auto-seeded with defaults

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 App Router (TypeScript strict) |
| Auth | NextAuth v5 (Google OAuth, PrismaAdapter) |
| Database | PostgreSQL via Prisma ORM (Neon.tech / Vercel Postgres) |
| Styling | Tailwind CSS + custom `brand` purple palette |
| Charts | Recharts |
| Hosting | Vercel (Hobby) |

**~3,950 lines** of TypeScript/TSX across ~20 source files.

---

## API Surface

7 routes total:

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/cravings` | GET, POST | List (limit 50) / create cravings |
| `/api/cravings/[id]` | PATCH, DELETE | Update resisted flag / delete, with ownership check |
| `/api/stats` | GET | Streak, resistance rate, avg intensity, peak trigger |
| `/api/options` | GET, POST | Per-user trigger/location chip values |
| `/api/trivia` | GET | Random trivia question for D3 distract step |
| `/api/auth/[...nextauth]` | * | NextAuth handler |
| `/api/test/*` | POST | Test-only session injection + DB cleanup (CI only) |

---

## Testing

### Unit Tests (Vitest) — 827 lines across 5 suites

| Suite | Covers |
|-------|--------|
| `lib/stats.test.ts` | Streak, resistance rate, average intensity, peak trigger/location |
| `lib/intensity.test.ts` | Color/label mapping for intensity levels |
| `api/cravings.test.ts` | POST auth, validation, ownership |
| `api/cravings-id.test.ts` | PATCH/DELETE auth and ownership checks |
| `api/options.test.ts` | Chip creation and deduplication |

### E2E Tests (Playwright, Chromium) — 3 spec files

| Spec | Covers |
|------|--------|
| `auth.spec.ts` | Unauthenticated redirect, sign-in flow |
| `log-craving.spec.ts` | Form submission, 5Ds modal navigation, skip-to-end + mark resisted |
| `craving-management.spec.ts` | Delete a craving, cross-user data isolation |

---

## CI/CD

### GitHub Actions — Two Workflows

#### `ci.yml` — Runs on every push/PR to `main`

**Unit job:**
1. `npm ci`
2. Prisma generate
3. Vitest

**E2E job:**
1. Spin up a real Postgres 16 service container
2. `prisma db push` → seed trivia questions
3. Build Next.js production bundle
4. Start production server, wait for readiness
5. Run Playwright (Chromium)
6. Upload Playwright report artifact on failure (retained 7 days)

#### `claude.yml` — Claude Code Action

Triggered on issue open/assign and PR/issue comments. Automatically implements requested changes and creates PRs.

### Deployment

Vercel auto-deploys on merge to `main`.

---

## Complexity Assessment

**Moderate.** The core CRUD + auth is straightforward Next.js, but complexity comes from:

- The 5Ds modal with three distinct interaction modes — passive (drink/discuss/distance), timer-driven with animated breathing (delay), and game-driven (distract trivia)
- The trivia mini-game with a seeded question database (90+ questions across categories and difficulties)
- The E2E test harness requiring a real Postgres container, a test session bypass endpoint, and DB cleanup between runs
- Ownership-scoped data with multi-user isolation enforced at the API layer on every PATCH/DELETE
