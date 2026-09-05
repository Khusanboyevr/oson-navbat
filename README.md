# Qulaynavbat 💈

**Qulaynavbat** ("EasyQueue") is a modern, mobile-first booking platform that lets people find and book barbers and salons in just a few taps — no more waiting in line for a haircut. Built as a fast, installable web app with a premium **glassmorphism** design system, it covers the full journey: discovering a barber, picking a service and time slot, confirming a booking, and managing it afterward — plus dedicated dashboards for barbers and platform admins.

The visual language — soft frosted-glass cards over a warm mesh-gradient background, Playfair Display headings paired with clean sans-serif body text, and a deep-blue/navy palette sampled directly from the brand logo — is used consistently across every screen, from the customer-facing app to both admin panels.

## ✨ Features

### Sign-in (Google only)
Sign-in is **Google-only** — no phone number, no SMS code (the backend removed `/auth/otp/*` entirely; those paths now 404). `/login` renders Google's own button (Google Identity Services); the ID token it returns is verified server-side, forwarded to the Django backend's `POST /auth/google/`, and the account (name + email + photo) is created and listed in the super admin panel. See [Auth](#-auth-google-sign-in).

### For customers
- **Home** — hero search, category filters, and a toggle between a card grid and a live **map** of every approved worker (Leaflet + OpenStreetMap, no API key needed). The list refreshes on a timer and on tab focus, so newly approved ustas appear without a redeploy
- **Barber profile** — a full page for the usta: photo over a colour wash drawn from their own accent, rating / category / experience badges, address, phone and directions, then two numbered steps (service, then date and time) beside a running booking summary (desktop sidebar / mobile sticky bar)
- **Booking confirmation** — a glass modal that confirms straight from the signed-in Google account (no phone, no SMS code), without leaving the page
- **My Bookings** — the customer's real bookings from the backend, split into active and history, cancellable in place
- **Profile** — the signed-in Google account (name, email, avatar), language selector, a native Web Push notification toggle, role shortcuts (usta schedule / super admin panel), support and logout
- **Notifications** — a bell icon in the header opens a glass dropdown with in-app notification history; the same events also arrive as native OS push notifications, even with the app closed

### For workers — usta registration (`/register/barber`)
A dedicated public link, separate from the customer login. A 3-step form collects everything a profile needs:

| Step | Fields |
|---|---|
| Shaxsiy ma'lumotlar | ism, familiya, telefon, email, yashash joyi |
| Ish joyi va lokatsiya | salon nomi, manzil, **map pin** — search an address, click the map, drag the pin, or use "mening joylashuvim"; the address field auto-fills from wherever the pin lands |
| Kasb va xizmatlar | yo'nalish, tajriba (yil), kasb, bio, profil rasmi, xizmatlar va narxlar |

The application lands in the super admin's review queue. **On approval the public profile is generated automatically from exactly this data** — profession + experience become the headline, the address and pin become the map marker, the services become the booking menu. There is no second "fill in your profile" step, and the worker's Google account is switched to the `barber` role so `/admin` opens for them.

### For barbers (`/admin`)
- Daily schedule read from `GET /bookings/?scope=today`: today's clients, pending count and earnings, computed from it live
- Accept / cancel / complete actions on each booking
- **Mening profilim** (`/admin/profile`) — the usta's own profile photo, bio and an unlimited service menu (add, edit, remove), all through `/barber/me/`. Whatever is saved here is what customers see on the map card and the booking page

### For platform admins (`/super-admin`)
- Live KPIs: registered accounts, active ustas, pending applications — plus whatever numeric totals `GET /super-admin/stats/` returns, rendered generically so a change in its shape can't break the page
- **Ustalar arizalari** (`/super-admin/applications`) — every worker application with all submitted details; approving creates the salon and the barber **on the backend** (`POST /super-admin/salons/` + `/super-admin/barbers/`), reject or delete otherwise
- **Ustalar ro'yxati** — read from `GET /super-admin/barbers/`; add by hand (same form), block/activate, delete
- **Foydalanuvchilar** (`/super-admin/users`) — read from `GET /super-admin/users/`; search, block/unblock and change role. There is no delete: the backend creates accounts through Google sign-in and blocks them instead

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

Users, barbers and salons live on the backend. This app keeps a thin server layer in front of it, for three reasons: the browser has no Django session (sign-in is server-side), the backend's CORS allowlist excludes localhost, and two things have no home upstream — the worker application queue and this app's own sessions.

- **`src/lib/server/store.ts`** — the worker application queue, this app's sessions, and a fallback mirror of users/barbers used only while the backend is unreachable. A JSON file under `DATA_DIR`, written atomically and re-read whenever it changes on disk. On a serverless host point `DATA_DIR` at a real volume if the pending queue must survive a redeploy.
- **`src/lib/server/backend.ts`** — the bridge to `api.qulaynavbat.uz`: auth, the open catalog, and every `/super-admin/*` call. Writes go straight to the backend and report whether they took; reads merge backend rows with any local fallback.
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
| `/api/admin/barbers` | `GET`, `POST` | super admin | `GET`/`POST /super-admin/barbers/` |
| `/api/admin/barbers/[id]` | `PATCH`, `DELETE` | super admin | `/block/`, `/activate/`, delete |
| `/api/admin/users` | `GET` | super admin | Everyone who signed in |
| `/api/admin/users/[id]` | `PATCH` | super admin | Block/unblock (`/block/`, `/unblock/`), change role (`/set-role/`) |
| `/api/notifications` | `GET` | signed in | History (`?is_read=false`) |
| `/api/notifications/unread-count` | `GET` | signed in | Bell badge |
| `/api/notifications/read` | `PUT` | signed in | Empty body = all, `{ ids }` = some |
| `/api/notifications/vapid-key` | `GET` | — | Web Push public key |
| `/api/notifications/subscribe` | `POST` | signed in | Registers a `PushSubscription` |
| `/api/me/barber` | `GET`, `PATCH` | signed-in usta | `GET`/`PATCH /barber/me/` |
| `/api/me/barber/avatar` | `POST`, `DELETE` | signed-in usta | Photo upload (multipart `avatar`) |
| `/api/bookings` | `GET`, `POST` | signed in | `GET /bookings/` (`?scope=today`), `POST /bookings/` |
| `/api/bookings/[id]` | `PATCH` | signed in | `/confirm/`, `/complete/`, `/cancel/` |
| `/api/bookings/slots` | `GET` | — | Free times for an usta on a date |

Nothing renders invented data any more: the mock booking and schedule modules are gone, and a slot is only shown as taken when the backend says so.

## 🔌 Backend (Real API)

`https://api.qulaynavbat.uz/api/v1`, Django REST, cookie-based auth (httpOnly session + CSRF).

- **`src/lib/server/backend.ts`** — the single place that talks to it: CSRF (`GET /auth/csrf/` → `X-CSRFToken`), cookie relay, refresh-on-401, and the `/auth/methods/` cache.
- **`src/lib/server/notifications-proxy.ts`** — relays the notification endpoints as the signed-in user, behind this app's `/api/notifications/*` routes.

**Auth:** `/auth/methods/`, `/auth/csrf/`, `/auth/me/`, `/auth/google/` (POST `{ id_token }` → `{ user, is_new_user }`), `/auth/logout/`, `/auth/refresh/`. `/auth/otp/*` is gone (404) — SMS login no longer exists anywhere.

**Open catalog (no auth, read-only by design):** `/salons/`, `/barbers/`, `/reviews/`. They answer `405` to `POST` on purpose — an open endpoint that accepted writes would let anyone publish a fake salon. Creating and editing happens elsewhere. Watch the paths: a `405` means the path exists but not that method, a `404` means the path is wrong.

| Wrong | Right |
|---|---|
| `/barbers/me/` | `/barber/me/` (singular) |
| `POST /barbers/` | `POST /super-admin/barbers/` |
| `POST /salons/` | `POST /super-admin/salons/` |
| `/auth/users/` | `/super-admin/users/` |

**The usta's own record:** `GET` / `PATCH /barber/me/` — bio and services, no super admin rights needed.

**Profile photos:** `multipart/form-data`, field name `avatar`, on `PATCH /barber/me/` (the usta) or `PATCH /super-admin/barbers/<id>/` (an admin). Max 5 MB, jpg/png/webp/gif, and the response carries the stored file's full URL. An image can't be sent on create, so approving an application creates the barber first and uploads the photo second. Never set `Content-Type` by hand — `fetch` writes it with the multipart boundary.

Field names worth pinning down: account status is `is_active` (**`false` means blocked**, there is no `is_blocked`), the join date is `created_at`, roles are `client` / `barber` / `superadmin`, `specialty` is `men` / `women` / `kids` / `unisex` for both barbers and salons, salon ids are UUIDs, `page_size` caps at 100, and ratings are computed by the backend. `/barbers/` nests the salon, but the map reads the **top-level** `location_lat` / `location_lng`: the server already picks whichever of the barber's or the salon's location applies.

**Super admin** (requires the `superadmin` role; everything else gets `403`):

| Method | Path | Purpose |
|---|---|---|
| `GET` `POST` | `/super-admin/salons/` | Salons / create |
| `GET` `PUT` `PATCH` `DELETE` | `/super-admin/salons/<id>/` | One salon |
| `GET` `POST` | `/super-admin/barbers/` | Barbers / create |
| `GET` `PUT` `PATCH` `DELETE` | `/super-admin/barbers/<id>/` | One barber |
| `POST` | `/super-admin/barbers/<id>/block/` `/activate/` | Block / activate |
| `GET` | `/super-admin/users/` `/<id>/` | Accounts |
| `POST` | `/super-admin/users/<id>/block/` `/unblock/` `/set-role/` | Account actions |
| `GET` | `/super-admin/stats/?period=day\|week\|month\|year\|all` | Platform totals |

All of them paginate and accept `?search=` / `?ordering=`.

**Creating an usta** (`POST /super-admin/barbers/`) takes `email`, `full_name`, `phone`, `salon`, `specialty`, `bio`, `experience_years`, `services[]`, `default_slot_minutes`. **`email` is the important field**: it is the Google account the usta signs in with, and the backend links the two on their first sign-in. A wrong email means they get a fresh "client" account and can't reach their panel. `salon` is optional (an usta may work independently) and carries the map coordinates, which is why approval creates the salon first.

## 🔔 Notifications (Web Push)

Native **Web Push**, backed by the Django backend ([`pywebpush`](https://pypi.org/project/pywebpush/) server-side):

- **`public/sw.js`** — service worker: shows the notification on `push`, focuses/opens a tab on `notificationclick`
- **`src/lib/push-client.ts`** — permission + `PushManager` subscription, using the VAPID public key fetched from the backend (`GET /notifications/vapid-key/`, now reporting `configured: true`)
- **`src/lib/notifications-api.ts`** — history, unread count, mark-as-read and subscribe, all through this app's `/api/notifications/*` routes (same-origin: no CSRF dance, no CORS problem, and the relay supplies the session the browser doesn't have)
- One deliberate backend behaviour not to "fix": a review's `client.full_name` arrives abbreviated (`"Bobur Aliyev"` → `"Bobur A."`). Reviews are public, so the full name is withheld on purpose.
- Push payload: `{ id, title, body, kind, url }`
- Reminders arrive in a 45–75 minute window before the appointment (the backend's cron runs every 15 min and dedupes)

## 🛠 What's next for the backend

1. **Confirm the booking payloads.** `API.md` lives in the backend repo, which this one can't read, so `POST /bookings/` currently sends `{ barber, service, date, time }` and `GET /bookings/available-slots/` asks with `?barber=&date=&service=`. Both surface the backend's own error rather than guessing further; if the field names differ, they are one file to change (`src/lib/server/bookings-api.ts`). Reads are mapped defensively and don't depend on exact names.
2. Confirm the `specialty` codes accepted by `/super-admin/barbers/` and `/super-admin/salons/`. The frontend sends `men` / `women` / `kids` (mapped from erkaklar / ayollar / bolalar) and `unisex` was the example for salons; if the vocabulary differs, it is one constant to change (`SPECIALTY_CODE` in `src/lib/server/backend.ts`).
3. **Confirm how to clear a profile photo.** Uploading is documented; removing isn't. `DELETE /api/me/barber/avatar` currently sends `PATCH /barber/me/` with `avatar: null` and surfaces whatever the backend answers.
4. **Move the application queue server-side.** Worker self-registration has no home on the backend (barbers are created by a super admin), so `/register/barber` submissions queue in this app's store until approved. They live in a JSON file under `DATA_DIR` on the frontend server — not in the browser — but they are still invisible to any other deployment and vulnerable to a redeploy on an ephemeral filesystem. The backend dev has offered the table and endpoints; worth taking.

## 🔍 SEO & PWA

- Per-page titles use a shared template (`Page | Qulaynavbat`); the barber detail page sets its title dynamically from the barber's name.
- A branded OpenGraph image is generated on the fly (`app/opengraph-image.tsx`) for rich link previews on Telegram, WhatsApp, etc.
- `app/manifest.ts` makes the app installable ("Add to Home Screen") with icons cropped from the brand mark and the app's actual theme/background colors.
