# Agency Theme

A **Next.js** marketing site with a built-in **admin area** for content: services, portfolio, blog, team, pages, pricing, testimonials, and site settings. Data is stored in **MongoDB** via Mongoose.

## Stack

- Next.js (App Router) · React · TypeScript · Tailwind CSS  
- MongoDB / Mongoose · TipTap (rich text) · Cloudinary or local uploads · Nodemailer (contact form)

## Prerequisites

- Node.js 20+ recommended  
- Running MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit **`.env.local`** — at minimum set **`MONGODB_URI`**. See `.env.example` for optional **Cloudinary**, **SMTP** (contact form), and **admin** overrides.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin

- URL: **`/admin`** (protected; unauthenticated users are sent to **`/admin/login`**).  
- Default credentials (override with `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env.local`):  
  **username:** `adeel` · **password:** `adeel123`  
- For production, set a strong **`ADMIN_SESSION_SECRET`** (see `.env.example`).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | ESLint                   |

## Project layout (high level)

- `src/app/` — routes (public site, blog, admin under `(admin)/admin`)  
- `src/components/` — UI and admin forms  
- `src/models/` — Mongoose schemas  
- `src/lib/` — DB connection, server actions, utilities  
- `src/middleware.ts` — admin route protection  
