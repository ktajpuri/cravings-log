# CravingsLog

A web app that helps people quit smoking by tracking cravings and guiding them through the clinically-backed **4Ds technique** (Drink, Delay, Distract, Discuss) every time a craving hits.

---

## What It Does

Users log each craving — intensity, trigger, location, and notes. After logging, the app immediately launches an interactive 4Ds routine:

1. **Drink** — Prompted to drink a full glass of water
2. **Delay** — 5-minute guided breathing exercise with rotating affirmations
3. **Distract** — A 5-question trivia/puzzle minigame drawn from a database of 90+ questions
4. **Discuss** — Prompted to reach out to someone for support

On completing the routine, the user can mark the craving as resisted. The dashboard tracks streaks, resistance rate, average intensity, and most common trigger over time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 + Material Design shadows |
| Auth | NextAuth v5 (Google OAuth) |
| ORM | Prisma 5 |
| Database | PostgreSQL (Neon.tech / Vercel Postgres) |
| Runtime | Node.js 20+ |

---

## Prerequisites

- Node.js 20+
- A PostgreSQL database (free tier on [Neon.tech](https://neon.tech) works)
- A Google OAuth app ([console.cloud.google.com](https://console.cloud.google.com))

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd cravings-log
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Generate with: openssl rand -base64 32
AUTH_SECRET="your-random-secret"

# From Google Cloud Console → APIs & Services → Credentials
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Local dev URL
AUTH_URL="http://localhost:3000"
```

**Google OAuth setup:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → Create OAuth Client ID
3. Application type: Web application
4. Authorised redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Set up the database

```bash
# Push schema to your database and generate Prisma Client
npm run db:push

# Seed trivia questions (90 questions across 9 categories)
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Commands

```bash
npm run dev           # Start development server (http://localhost:3000)
npm run build         # Build for production (runs prisma generate first)
npm run start         # Start production server
npm run lint          # Run ESLint

npm run db:push       # Sync Prisma schema to database
npm run db:generate   # Regenerate Prisma Client after schema changes
npm run db:seed       # Seed trivia questions (idempotent — safe to re-run)
npm run db:studio     # Open Prisma Studio GUI for the database
```

---

## Project Structure

```
cravings-log/
├── app/
│   ├── page.tsx                        # Root: redirects based on auth
│   ├── layout.tsx                      # Root layout + SessionProvider
│   ├── globals.css                     # Tailwind + custom animations
│   ├── (auth)/login/page.tsx           # Google OAuth login page
│   ├── dashboard/page.tsx              # Main app dashboard
│   └── api/
│       ├── auth/[...nextauth]/         # NextAuth handler
│       ├── cravings/route.ts           # GET (list) + POST (create)
│       ├── cravings/[id]/route.ts      # PATCH (update) + DELETE
│       ├── stats/route.ts              # Aggregated stats
│       ├── trivia/route.ts             # Random trivia questions
│       └── options/route.ts           # Per-user trigger & location options
│
├── components/
│   ├── Navbar.tsx                      # Top nav with user info + sign out
│   ├── CravingForm.tsx                 # Log craving form
│   ├── CravingList.tsx                 # Recent cravings feed
│   ├── StatsCard.tsx                   # Stats grid (streak, rate, etc.)
│   ├── FourDsModal.tsx                 # 4Ds routine bottom sheet
│   └── fourds/
│       └── TriviaGame.tsx              # Trivia minigame component
│
├── lib/
│   └── prisma.ts                       # Singleton Prisma client
│
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── seed.ts                         # Trivia question seed data
│
├── auth.ts                             # NextAuth configuration
├── middleware.ts                       # Route protection (/dashboard/*)
├── tailwind.config.ts                  # Custom brand palette
└── .env.example                        # Environment variable template
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example` under **Settings → Environment Variables**
4. Update `AUTH_URL` to your production domain (e.g. `https://your-app.vercel.app`)
5. Add `https://your-app.vercel.app/api/auth/callback/google` to your Google OAuth authorised redirects
6. Deploy — Vercel runs `npm run build` which includes `prisma generate`
7. After first deploy, run `npm run db:seed` locally against your production `DATABASE_URL` to seed trivia questions

---

## Adding Trivia Questions

Open `prisma/seed.ts` and add entries to the `questions` array:

```ts
{
  question: "Your question here?",
  answers: ["Option A", "Option B", "Option C", "Option D"],
  correct: 2,               // 0-based index of correct answer
  category: "science",      // geography | science | math | history | riddle | wordplay | culture | language | puzzle
  type: "trivia",           // trivia | math | riddle | wordplay | puzzle
  difficulty: 1,            // 1=easy, 2=medium, 3=hard
}
```

Then run `npm run db:seed` — it skips questions that already exist.

---

## License

MIT
