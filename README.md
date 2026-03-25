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
