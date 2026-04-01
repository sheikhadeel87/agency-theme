# Agency Theme

A **Next.js** marketing site with a built-in **admin CMS**. Manage services, portfolio, blog, team, dynamic pages, pricing, testimonials, legal copy, hero, “Why choose us,” and site-wide settings. Content lives in **MongoDB** (Mongoose). Images can go to **Cloudinary** or local `public/uploads/`. The contact section can send mail via **SMTP** (Nodemailer).

## Stack

| Layer | Details |
| ----- | ------- |
| Framework | **Next.js 16** (App Router), **React 19**, TypeScript |
| Styling | **Tailwind CSS v4**, shadcn-style UI primitives |
| Data | MongoDB · Mongoose · Server Actions |
| Rich text | TipTap |
| Extras | `next-themes` (light/dark) · `@dnd-kit` (admin navigation editor) · Lucide icons |

## Public site

- **Homepage** — configurable sections: hero, features, why choose us, team, services, pricing, portfolio, testimonials, blog teaser, contact.
- **Routes** — `/blog`, `/blog/[slug]`, `/portfolio`, `/portfolio/[slug]`, `/pricing` (when enabled), `/privacy-policy`, `/terms-conditions`, `/team/[slug]`, and **CMS pages** at `/[slug]` (e.g. About).
- **Theme** — Visitors can switch **light / dark** (system default supported). Layout uses CSS variables so backgrounds and text stay readable in both modes.

## Admin

- **URL:** `/admin` — cookie-based auth; unauthenticated users are redirected to `/admin/login`.
- **Defaults** (override in `.env.local`): username `adeel`, password `adeel123`.
- **Production:** Set a strong `ADMIN_SESSION_SECRET` and unique `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## Prerequisites

- **Node.js 20+** (recommended)
- **MongoDB** — local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit **`.env.local`**. At minimum set **`MONGODB_URI`**. Optional variables are documented in **`.env.example`** (Cloudinary, SMTP, admin overrides).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

## Project layout

| Path | Purpose |
| ---- | ------- |
| `src/app/` | App Router: public pages, `blog/`, `portfolio/`, `pricing/`, dynamic `[slug]`, `preview/`, admin under `(admin)/admin/` |
| `src/components/` | Shared UI, layout (header/footer), admin forms, previews |
| `src/sections/home/` | Homepage section blocks |
| `src/models/` | Mongoose schemas |
| `src/lib/` | DB connection, server actions, helpers, navigation |
| `src/middleware.ts` | Protects `/admin` routes |

## Newsletter

### Public subscribe API

`POST /api/newsletter/subscribe` — JSON body `{ "email": "user@example.com" }`.

**Validation (before saving to MongoDB):**

- **Format:** `validator.isEmail` via `normalizeNewsletterEmail` in `src/lib/newsletter-email.ts` (same rule as the Mongoose schema validator on `Newsletter`).
- **Disposable domains:** Blocked using the `disposable-email-domains` package (`src/lib/newsletter-subscribe-email-middleware.ts`).
- **DNS:** `dns.resolveMx` (Node `dns.promises`) — the domain must have MX records or the request fails with a clear error (no row inserted). Transient DNS issues may return **503** with a retry message.

Then: duplicate check, persist, rate limit by client IP (8 requests / 15 min / IP, in-memory). Responses are JSON with `success` and `message`; HTTP **201** (new), **409** (already subscribed), **400** (validation / disposable / no MX), **429** (rate limit), **503** (could not verify domain), **500** (server).

```bash
curl -s -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

**Optional:** `GET /api/newsletter/check?email=` — debounced in the footer for “already subscribed” UX; rate-limited separately.

### Admin (after login)

| Area | Route / API |
| ---- | ----------- |
| Subscribers table | `/admin/newsletter` — `GET /api/admin/newsletter`, `DELETE /api/admin/newsletter/:id` (session or Bearer session token) |
| Send newsletter | `/admin/newsletter/send` — `POST /api/newsletter/send` with JSON `{ subject, message, emails?: string[] }`. Sends with the shared SMTP transporter (`src/lib/mail-transport.ts`); one recipient per `sendMail`; response `{ success, sent, failed }` (SMTP failures and skipped-invalid counts; **bounces** from the provider later are not included). |

### Files

| Path | Role |
| ---- | ---- |
| `src/lib/newsletter-email.ts` | Format + length normalization |
| `src/lib/newsletter-subscribe-email-middleware.ts` | Disposable list + `resolveMx` |
| `src/controllers/newsletter-controller.ts` | Subscribe, check, admin list/delete, broadcast send |
| `src/models/Newsletter.ts` | Email field + validation |
| `src/app/api/newsletter/subscribe/route.ts` | Public subscribe |
| `src/app/api/newsletter/check/route.ts` | Public check |
| `src/app/api/newsletter/send/route.ts` | Admin send |
| `src/app/api/admin/newsletter/` | Admin list + delete |

**Note:** Regex alone cannot detect bad domains (e.g. no MX). Bounces after SMTP accepts are handled by your mail provider, not in-app counters.

