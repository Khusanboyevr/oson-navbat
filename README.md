# Qulaynavbat 💈

**Qulaynavbat** ("EasyQueue") is a modern, mobile-first booking platform that lets people find and book barbers and salons in just a few taps — no more waiting in line for a haircut. Built as a fast, installable web app with a premium **glassmorphism** design system, it covers the full journey: discovering a barber, picking a service and time slot, confirming a booking, and managing it afterward — plus dedicated dashboards for barbers and platform admins.

The visual language — soft frosted-glass cards over a warm mesh-gradient background, Playfair Display headings paired with clean sans-serif body text, and a deep-blue/navy palette sampled directly from the brand logo — is used consistently across every screen, from the customer-facing app to both admin panels.

## ✨ Features

### For customers
- **Home** — hero search, category filters, and a toggle between a card grid and a live **Yandex Maps** view of nearby barbers (with a styled fallback when no API key is configured)
- **Barber profile** — bio, services, a date/time picker with simulated availability, and a running booking summary (desktop sidebar / mobile sticky bar)
- **Booking confirmation** — a glass modal that walks through phone entry → SMS code → success, without leaving the page
- **My Bookings** — active vs. history tabs, status pills, cancel / get-directions actions
- **Profile** — avatar, language selector, SMS/Telegram notification toggles, support and logout

### For barbers (`/admin`)
- Daily schedule with today's clients, pending count, and today's earnings, computed live
- Accept / cancel / complete actions on each booking

### For platform admins (`/super-admin`)
- Global KPIs: total customers, system-wide barbers, total revenue
- Barber management: add, block/unblock ustas
- Searchable customer list (`/super-admin/users`)

## 🛠 Tech Stack

- **[Next.js 16](https://nextjs.org/)** (App Router, Turbopack, route groups for distinct customer/dashboard layouts)
- **[React 19](https://react.dev/)** + **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com/)** — CSS-first theme (`globals.css`), no `tailwind.config.js` needed
- **[lucide-react](https://lucide.dev/)** for icons
- **[@pbe/react-yandex-maps](https://www.npmjs.com/package/@pbe/react-yandex-maps)** for the real map integration
- **[Playfair Display](https://fonts.google.com/specimen/Playfair+Display)** + **[Geist](https://vercel.com/font)** via `next/font`
- **[Supabase](https://supabase.com/)** for auth and the database (client + schema scaffolded; see [Backend](#-backend-supabase) below)

## 📁 Project Structure

```
src/
  app/
    (customer)/      # Home, barber detail, bookings, favorites, profile — wrapped in the top-nav AppShell
    (dashboard)/      # /admin and /superadmin — wrapped in the sidebar dashboard shell
  components/
    home/, barber/, bookings/, profile/, dashboard/, layout/, ui/
  lib/                # Mock data + pure helper functions (dates, number formatting, etc.)
```

Route groups (`(customer)`, `(dashboard)`) don't affect the URL — they just let each side of the app use its own layout shell (top nav vs. sidebar) without duplicating code.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ (Node 20+ recommended)
- npm

### Installation

```bash
npm install
```

### Environment variables (optional)

The Home page's map view works out of the box with a styled placeholder. To enable the real interactive map, copy the example env file and add a free Yandex Maps API key:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_YANDEX_MAPS_KEY=your-key-here
```

Get a key at [developer.tech.yandex.ru](https://developer.tech.yandex.ru/).

The same file also has `NEXT_PUBLIC_SITE_URL`, used to build absolute URLs for SEO metadata (OpenGraph images, canonical links). It defaults to `https://oson-navbat.vercel.app` — the existing Vercel deployment's domain, unchanged by the app's rename to Qulaynavbat; override it if your deployment uses a different domain.

It also has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — see [Backend (Supabase)](#-backend-supabase) below.

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

## 📦 Deployment

The app is ready to deploy on **[Vercel](https://vercel.com/new)** — connect the repository and add these environment variables in the project settings:
- `NEXT_PUBLIC_YANDEX_MAPS_KEY` — enables the live map (optional)
- `NEXT_PUBLIC_SITE_URL` — set this to your actual production URL if it differs from `https://oson-navbat.vercel.app` (rename the Vercel project too if you want the domain itself to say "qulaynavbat"), so OpenGraph/social share previews resolve correctly
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — enables real auth (optional; the login flow runs in demo mode without them)

## 🗄 Backend (Supabase)

The app currently runs entirely on mock data (`src/lib/*.ts`) — Supabase is wired in but optional until you connect a real project:

- **`src/lib/supabase.ts`** — the client. `isSupabaseConfigured` is `false` (and `supabase` is `null`) until both env vars above are set, so nothing crashes without credentials.
- **`src/lib/database.types.ts`** — hand-written to match the shape `supabase gen types typescript` produces, so it's a drop-in replacement once you generate real types from your project.
- **`src/lib/auth.ts`** — `signInWithGoogle`, `requestPhoneOtp`, `verifyPhoneOtp`, already wired to the `/login` UI. Every call is a no-op success in demo mode.

### Schema

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | One row per authenticated user (client, barber, or super admin) | `id` (matches `auth.users.id`), `phone`, `name`, `role` |
| `barbers` | A barbershop/salon profile, owned by a `profiles` row | `user_id` → `profiles.id`, `name`, `specialty`, `category`, `status`, `rating`, `location`, `lat`/`lng` |
| `bookings` | An appointment | `client_id` → `profiles.id`, `barber_id` → `barbers.id`, `date`, `time`, `service`, `price`, `status` |

To go live: create these tables in your Supabase project (matching `database.types.ts`), enable Row Level Security, add a Google provider and phone/SMS provider under Authentication, and add an `/auth/callback` route to complete the Google OAuth redirect.

### API routes

Stubs the frontend already calls, ready for a backend dev to fill in with real Supabase queries:

| Route | Methods | Notes |
|---|---|---|
| `/api/bookings` | `GET`, `POST` | `GET` currently returns the mock `BOOKINGS` list; `POST` echoes the submitted body back with a generated id. Response envelope: `{ status, message, data }`. |
| `/api/auth/telegram` | `GET`, `POST` | Stub target for the Telegram Bot API webhook — Telegram POSTs an `Update` object here on every bot event. |

## 🔍 SEO & PWA

- Per-page titles use a shared template (`Page | Qulaynavbat`); the barber detail page sets its title dynamically from the barber's name.
- A branded OpenGraph image is generated on the fly (`app/opengraph-image.tsx`) for rich link previews on Telegram, WhatsApp, etc.
- `app/manifest.ts` makes the app installable ("Add to Home Screen") with icons cropped from the brand mark and the app's actual theme/background colors.
