# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build production bundle
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema changes to database
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:studio    # Open Prisma Studio GUI
```

No test suite is configured.

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:
- `DATABASE_URL` — PostgreSQL connection string (Neon.tech or Vercel Postgres)
- `AUTH_SECRET` — Random secret for NextAuth encryption
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth credentials from Google Cloud Console
- `AUTH_URL` — `http://localhost:3000` for local dev

## Architecture

**Stack**: Next.js 14 App Router, TypeScript (strict), Tailwind CSS, Prisma + PostgreSQL, NextAuth v5 (Google OAuth).

**Auth flow**: `auth.ts` configures NextAuth with Google provider + PrismaAdapter. `middleware.ts` protects `/dashboard/*`. Auth callbacks inject `user.id` into the session object. The `(auth)/login` route group handles unauthenticated users.

**Data flow**: All pages are client components. The dashboard fetches from `/api/cravings` and `/api/stats` on mount. API routes live in `app/api/` and always call `auth()` to validate the session before touching the database. Ownership checks are enforced on PATCH/DELETE by querying with both `id` and `userId`.

**Database**: Prisma schema in `prisma/schema.prisma`. The core model is `Craving` (userId, intensity 1–10, trigger, notes, resisted bool, location, timestamps). `lib/prisma.ts` exports a singleton client (globalThis pattern to prevent hot-reload connection leaks).

**Styling**: Tailwind with a custom `brand` purple palette defined in `tailwind.config.ts`. Intensity levels use color coding: green (1–3), yellow (4–6), red (7–10).

**Stats**: `/api/stats` computes streak, resistance rate, average intensity, and most common trigger entirely in the API route using Prisma aggregations and raw JS — no dedicated stats table.

## Key Conventions

- Import path alias `@/*` maps to the project root (e.g., `@/lib/prisma`, `@/components/...`).
- After modifying `prisma/schema.prisma`, always run `db:generate` then `db:push`.
- NextAuth v5 uses `auth()` (not `getServerSession`) for session access in API routes.
