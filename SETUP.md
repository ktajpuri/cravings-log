# CravingLog — Setup Guide

## Prerequisites
- Node.js 18+ installed
- A free [Neon.tech](https://neon.tech) or Vercel Postgres database
- A Google Cloud project (for OAuth)

---

## 1. Install dependencies

```bash
npm install
```

## 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon.tech → your project → Connection string |
| `AUTH_SECRET` | Run: `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google Cloud Console → APIs & Services → Credentials |
| `AUTH_GOOGLE_SECRET` | Same as above |

## 3. Set up the database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to your database
```

## 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 5. Deploy to Vercel

```bash
npx vercel
```

Add all your environment variables in the Vercel dashboard under **Settings → Environment Variables**. Change `AUTH_URL` to your production URL.

### Google OAuth redirect URI
In Google Cloud Console, add this to your OAuth app's authorized redirect URIs:
```
https://your-app.vercel.app/api/auth/callback/google
```

---

## Project structure

```
craving-log/
├── app/
│   ├── (auth)/login/       # Login page
│   ├── api/
│   │   ├── auth/           # NextAuth handler
│   │   ├── cravings/       # CRUD API
│   │   └── stats/          # Aggregated stats
│   └── dashboard/          # Main app UI
├── components/             # UI components
├── lib/prisma.ts           # Database client
├── auth.ts                 # NextAuth config
├── middleware.ts            # Route protection
└── prisma/schema.prisma    # Database schema
```
