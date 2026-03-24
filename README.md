# YasarPack platform

YasarPack is a premium fintech / crypto platform base built on **Next.js App Router + PostgreSQL + Prisma + NextAuth**.
It upgrades the provided premium redesign into a functional product foundation with real auth, user and admin dashboards, configurable payments, loyalty, support tickets, branding, CMS and multilingual content.

## Included modules

- real authentication with roles
- secure password hashing with bcrypt
- user dashboard
- admin dashboard
- configurable payment methods
- loyalty tiers and history
- support tickets with threaded messages
- KYC mock upload flow
- editable branding
- editable CMS blocks
- translation overrides (FR / EN)
- demo seed data

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth Credentials provider
- Zod
- React Hook Form for auth forms

## Demo accounts

- Admin: `admin@yasarpack.com` / `Admin123!`
- User: `user@yasarpack.com` / `User123!`

## Local installation

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`

## Required environment variables

See `.env.example`.

Main variables:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `UPLOAD_DIR`

## Recommended local PostgreSQL quick start

```bash
docker run --name yasarpack-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=yasarpack \
  -p 5432:5432 \
  -d postgres:16
```

## Project structure

See `docs/ARCHITECTURE.md`.

## Notes

- The current file-upload strategy uses local disk storage under `public/uploads` as a mock KYC implementation.
- The built-in rate limiter is intentionally simple and should be replaced by Redis / Upstash / gateway controls in distributed production.
- Branding, CMS and translations live in the database and are surfaced in the admin back-office.
