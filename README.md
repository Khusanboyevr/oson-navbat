# Qulaynavbat 💈

**Qulaynavbat** ("EasyQueue") is a modern, mobile-first booking platform that lets people find and book barbers and salons in just a few taps — no more waiting in line for a haircut. Built as a fast, installable web app with a premium **glassmorphism** design system, it covers the full journey: discovering a barber, picking a service and time slot, confirming a booking, and managing it afterward — plus dedicated dashboards for barbers and platform admins.

The visual language — soft frosted-glass cards over a warm mesh-gradient background, Playfair Display headings paired with clean sans-serif body text, and a deep-blue/navy palette sampled directly from the brand logo — is used consistently across every screen, from the customer-facing app to both admin panels.

## ✨ Features

### Sign-in (Google only)
Sign-in is **Google-only** — no phone number, no SMS code (the backend removed `/auth/otp/*` entirely; those paths now 404). `/login` renders Google's own button (Google Identity Services); the ID token it returns is verified server-side, forwarded to the Django backend's `POST /auth/google/`, and the account (name + email + photo) is created and listed in the super admin panel. See [Auth](#-auth-google-sign-in).

### For customers
- **Home** — hero search, category filters, and a toggle between a card grid and a live **map** of every approved worker (Leaflet + OpenStreetMap, no API key needed). The list refreshes on a timer and on tab focus, so newly approved ustas appear without a redeploy
- **Barber profile** — bio, services, a date/time picker with simulated availability, and a running booking summary (desktop sidebar / mobile sticky bar)
- **Booking confirmation** — a glass modal that confirms straight from the signed-in Google account (no phone, no SMS code), without leaving the page
- **My Bookings** — active vs. history tabs, status pills, cancel / get-directions actions
- **Profile** — the signed-in Google account (name, email, avatar), language selector, a native Web Push notification toggle, role shortcuts (usta schedule / super admin panel), support and logout
- **Notifications** — a bell icon in the header opens a glass dropdown with in-app notification history; the same events also arrive as native OS push notifications, even with the app closed

### For workers — usta registration (`/register/barber`)
A dedicated public link, separate from the customer login. A 3-step form collects everything a profile needs:

| Step | Fields |
|---|---|
| Shaxsiy ma'lumotlar | ism, familiya, telefon, email, yashash joyi |
| Ish joyi va lokatsiya | salon nomi, manzil, **map pin** (click, drag, or "mening joylashuvim"; the address auto-fills from the pin by reverse geocoding) |
| Kasb va xizmatlar | yo'nalish, tajriba (yil), kasb, bio, profil rasmi, xizmatlar va narxlar |

The application lands in the super admin's review queue. **On approval the public profile is generated automatically from exactly this data** — profession + experience become the headline, the address and pin become the map marker, the services become the booking menu. There is no second "fill in your profile" step, and the worker's Google account is switched to the `barber` role so `/admin` opens for them.

### For barbers (`/admin`)
- Daily schedule with today's clients, pending count, and today's earnings, computed live
- Accept / cancel / complete actions on each booking

### For platform admins (`/super-admin`)
- Live KPIs: registered accounts, active ustas, pending applications, completed-booking revenue
- **Ustalar arizalari** (`/super-admin/applications`) — every worker application with all submitted details; approve (creates the profile + map marker), reject, or delete
- **Ustalar ro'yxati** — add a worker by hand (same form, live immediately), block/unblock, delete
- **Foydalanuvchilar** (`/super-admin/users`) — everyone who signed in with Google; search, block/unblock, delete

## 🛠 Tech Stack

- **[Next.js 16](https://nextjs.org/)** (App Router, Turbopack, route groups for distinct customer/dashboard layouts, route handlers as the app's own API layer)
- **[React 19](https://react.dev/)** + **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com/)** — CSS-first theme (`globals.css`), no `tailwind.config.js` needed
- **[lucide-react](https://lucide.dev/)** for icons
- **[Leaflet](https://leafletjs.com/)** + **[react-leaflet](https://react-leaflet.js.org/)** with **OpenStreetMap** tiles for the map — free, keyless, and only the pieces we need (markers, popups, a click-to-pick location field). Replaced the Yandex Maps integration, which needed an API key the project never had
- **[Playfair Display](https://fonts.google.com/specimen/Playfair+Display)** + **[Geist](https://vercel.com/font)** via `next/font`
- **[Google Identity Services](https://developers.google.com/identity/gsi/web)** for sign-in
- A real **Django REST** backend at `api.qulaynavbat.uz` (cookie/CSRF-based auth) — see [Backend](#-backend-real-api)
- The native browser **Push API** for notifications — no paid SMS or third-party bot required

## 📁 Project Structure

```
src/
  app/
    (customer)/       # Home, barber detail, bookings, favorites, profile — top-nav AppShell
    (dashboard)/      # /admin and /super-admin — sidebar dashboard shell
    register/barber/  # Public worker (usta) registration page
    api/              # This app's own API layer (auth, barbers, admin)
  components/
    auth/, home/, map/, register/, barber/, bookings/, profile/, dashboard/, layout/, ui/
  lib/
    server/           # Server-only: store, Django bridge, session, validation
    *.ts              # Client helpers (i18n, dates, formatting, push, google-auth)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ (Node 20+ recommended)
- npm

### Installation

```bash
npm install
```

### Environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Required | What it does |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | The Django backend base URL (`https://api.qulaynavbat.uz/api/v1`). Everything else, the Google client ID included, is discovered from it. |
| `GOOGLE_CLIENT_ID` | — | Overrides the client ID the backend publishes. Only for a staging build pointing at another Google project. |
| `SUPER_ADMIN_EMAILS` | — | Comma-separated emails that get the super admin role. **If empty, the first account to sign in becomes the super admin.** |
| `DATA_DIR` | — | Where the app's own store writes (default `<project>/.data`). |
| `NEXT_PUBLIC_SITE_URL` | — | Production URL for SEO metadata. |

No Google setup is needed on the frontend: the backend owns the OAuth client and publishes its ID at `/auth/methods/`, which the login page reads at runtime. Whoever owns that client only has to list `http://localhost:3000` and `https://qulaynavbat.uz` under **Authorized JavaScript origins** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

The map needs no key at all.

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

## 🔐 Auth (Google sign-in)

1. `GoogleSignInButton` asks `/api/auth/methods` (which relays `GET /auth/methods/`) for the live client ID, then renders Google's button. Nothing is hardcoded, so rotating the ID on the backend is enough.
2. Google returns an ID token (JWT) to the browser, which POSTs it to `POST /api/auth/google`.
3. That route verifies the token against Google (`oauth2.googleapis.com/tokeninfo`, checking the audience against that same client ID, plus issuer, expiry and `email_verified`), so a token minted for another app is rejected.
4. It forwards the token to the backend's `POST /auth/google/`, which answers `{ user, is_new_user }` and sets its httpOnly session/refresh cookies. Those are mirrored server-side (`qn_backend`).
5. It creates/updates the local account and issues the app's own session cookie (`qn_session`, httpOnly).

**Every backend call the browser needs goes through this app's server**, because the Django cookies never reach the client (and the backend's CORS allowlist only covers `qulaynavbat.uz`). A backend `401` is retried once behind `POST /auth/refresh/`; if that fails too, the user signs in with Google again. If the backend is unreachable the account is still created locally and flagged `syncedWithBackend: false`, which the super admin panel shows as "faqat lokal".

`user.phone` is `null` for Google-only accounts, and the app never renders a phone for a customer. The phone numbers it does show belong to ustas and come from the registration form, which requires one.

Roles: `client` → `/`, `barber` → `/admin`, `superadmin` → `/super-admin`. Super-admin pages and every `/api/admin/*` route check the role server-side.

## 🗄 Data & API routes

The Django backend can't yet store users, applications, or barbers (see below), so this app runs its own thin backend-for-frontend:

- **`src/lib/server/store.ts`** — persistence (users, sessions, worker applications, barber profiles) in a JSON file under `DATA_DIR`, written atomically and re-read whenever the file changes on disk. It is deliberately a single module with a small API, so swapping it for SQL/Supabase — or deleting it once the Django endpoints exist — touches nothing else. On a serverless host `DATA_DIR` must point at a real volume.
- **`src/lib/server/backend.ts`** — the bridge to `api.qulaynavbat.uz`. Every write tries the backend first and reports whether it took; reads merge backend rows with local ones. Calling it from the server also sidesteps the backend's CORS allowlist, so `localhost` development works.
- **`src/lib/server/session.ts`** — cookie session + `requireSuperAdmin()` guard.
- **`src/lib/server/validation.ts`** — one validator shared by public registration and admin-side creation.

| Route | Methods | Auth | Notes |
|---|---|---|---|
| `/api/auth/methods` | `GET` | — | Live sign-in methods + Google client ID |
| `/api/auth/google` | `POST` | — | Verify Google ID token, create session |
| `/api/auth/session` | `GET` | — | Current user (or `null`) |
| `/api/auth/logout` | `POST` | — | Clears both cookies, logs out of Django |
| `/api/barbers` | `GET` | — | Public list: local approved + backend `/barbers/` |
| `/api/barbers/apply` | `POST` | — | Worker application (status `pending`) |
| `/api/admin/applications` | `GET` | super admin | Review queue |
| `/api/admin/applications/[id]` | `PATCH`, `DELETE` | super admin | Approve/reject; delete |
| `/api/admin/barbers` | `GET`, `POST` | super admin | List all; add manually |
| `/api/admin/barbers/[id]` | `PATCH`, `DELETE` | super admin | Block/unblock; delete (backend-owned rows are read-only) |
| `/api/admin/users` | `GET` | super admin | Everyone who signed in |
| `/api/admin/users/[id]` | `PATCH`, `DELETE` | super admin | Block/unblock, change role; delete |
| `/api/notifications` | `GET` | signed in | History (`?is_read=false`) |
| `/api/notifications/unread-count` | `GET` | signed in | Bell badge |
| `/api/notifications/read` | `PUT` | signed in | Empty body = all, `{ ids }` = some |
| `/api/notifications/vapid-key` | `GET` | — | Web Push public key |
| `/api/notifications/subscribe` | `POST` | signed in | Registers a `PushSubscription` |
| `/api/bookings` | `GET`, `POST` | — | Still a stub over mock booking data |

Bookings are the one flow still running on mock data (`src/lib/bookings.ts`) — everything auth-, worker- and map-related is real.

## 🔌 Backend (Real API)

`https://api.qulaynavbat.uz/api/v1`, Django REST, cookie-based auth (httpOnly session + CSRF).

- **`src/lib/server/backend.ts`** — the single place that talks to it: CSRF (`GET /auth/csrf/` → `X-CSRFToken`), cookie relay, refresh-on-401, and the `/auth/methods/` cache.
- **`src/lib/server/notifications-proxy.ts`** — relays the notification endpoints as the signed-in user, behind this app's `/api/notifications/*` routes.

**Verified live:** `/auth/methods/`, `/auth/csrf/`, `/auth/me/`, `/auth/google/` (POST `{ id_token }` → `{ user, is_new_user }`), `/auth/logout/`, `/auth/refresh/`, `/notifications/*`, and read-only `/salons/`, `/barbers/`, `/reviews/` (both barber lists currently empty). `/auth/otp/request/` and `/auth/otp/verify/` are gone (404) — SMS login no longer exists anywhere.

## 🔔 Notifications (Web Push)

Native **Web Push**, backed by the Django backend ([`pywebpush`](https://pypi.org/project/pywebpush/) server-side):

- **`public/sw.js`** — service worker: shows the notification on `push`, focuses/opens a tab on `notificationclick`
- **`src/lib/push-client.ts`** — permission + `PushManager` subscription, using the VAPID public key fetched from the backend (`GET /notifications/vapid-key/`, now reporting `configured: true`)
- **`src/lib/notifications-api.ts`** — history, unread count, mark-as-read and subscribe, all through this app's `/api/notifications/*` routes (same-origin: no CSRF dance, no CORS problem, and the relay supplies the session the browser doesn't have)
- Push payload: `{ id, title, body, kind, url }`
- Reminders arrive in a 45–75 minute window before the appointment (the backend's cron runs every 15 min and dedupes)

## 🛠 What's next for the backend

1. **Add a worker/barber write endpoint** — `POST /barbers/` (or `/salons/`) is `405` today. The frontend already posts the full payload on every approval (`pushBarberToBackend` in `src/lib/server/backend.ts`: name, salon, specialty, category, phone, email, address, residence, latitude/longitude, experience, bio, services) and records whether it succeeded, so it starts syncing the moment the endpoint accepts it.
2. **Add a users list endpoint** (`GET /auth/users/` or similar, staff-only) so the super admin panel can read accounts from the backend instead of the local store.
3. **Optionally an applications endpoint**, if worker applications should live server-side rather than in this app's store.
4. Share exact request/response shapes (OpenAPI/Swagger) for `/bookings/`, `/reviews/`, `/salons/` — bookings are the last flow still on mock data.

## 🔍 SEO & PWA

- Per-page titles use a shared template (`Page | Qulaynavbat`); the barber detail page sets its title dynamically from the barber's name.
- A branded OpenGraph image is generated on the fly (`app/opengraph-image.tsx`) for rich link previews on Telegram, WhatsApp, etc.
- `app/manifest.ts` makes the app installable ("Add to Home Screen") with icons cropped from the brand mark and the app's actual theme/background colors.
