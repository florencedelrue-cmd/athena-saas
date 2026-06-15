# Athena Duaal — Production SaaS Platform

Multi-tenant gespreksfiche & competentietracker voor duaal leren.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript + TailwindCSS
- **Supabase** — Auth, PostgreSQL, Row Level Security
- **Stripe** — Checkout session API (structuur klaar)
- **React Context** — geen Redux

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Vul Supabase + Stripe keys in
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Supabase Setup

1. Maak een project op [supabase.com](https://supabase.com)
2. Voer `supabase/migrations/001_initial_schema.sql` uit in de SQL Editor
3. Kopieer URL, anon key en service role key naar `.env.local`

## Architecture

```
UI → AppContext → Supabase → UI
```

| Layer | Bestanden |
|-------|-----------|
| Auth | `lib/auth.ts`, `lib/supabase.ts`, `lib/server.ts`, `middleware.ts` |
| Data | `lib/db.ts` (client), `lib/db-server.ts` (SSR) |
| Billing | `lib/stripe.ts`, `app/api/stripe/route.ts` |
| State | `context/AppContext.tsx` |
| Realtime prep | `lib/realtime.ts` |

## Database

- `schools` — multi-tenant root + Stripe velden
- `users` — gekoppeld aan `auth.users`, role `admin`/`teacher`
- `students`, `fiches`, `competencies`, `logs`
- **RLS** op alle tabellen: `school_id = current user's school_id`

## Signup Flow

1. Auth user aanmaken (service role)
2. School record + Stripe customer (optioneel)
3. User record met `role = admin`
4. Auto-login → dashboard

## Stripe (Prep)

```bash
POST /api/stripe
{ "plan": "pro" }
→ { "url": "https://checkout.stripe.com/..." }
```

## Project Structure

```
/app/(auth)/login, signup
/app/(dashboard)/         — protected app
/app/api/auth/signup      — registratie + school
/app/api/stripe           — checkout sessie
/components/fases/        — 5 procesfase UI cards
/components/tracker/      — Cyclus Tracker visualisaties
/context/AppContext.tsx   — Supabase sync + state
/lib/                     — auth, db, stripe, constants
/types/                   — volledige TypeScript types
```

## Mobile

Responsive grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`), scrollable tabs, touch targets (`py-3 px-4`), sticky acties op mobiel.
