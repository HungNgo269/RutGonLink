# RutGonLink

RutGonLink is a URL shortener with authentication, real redirect links, click tracking, analytics dashboards, and Redis-backed redirect caching.

## Features

- Create short links as an anonymous or logged-in user.
- Redirect short codes to their destination URLs through the backend.
- Track analytics only for links owned by logged-in users.
- Store click metadata such as referrer, UTM values, IP, country, city, device, browser, and OS.
- View analytics list and detail pages in the frontend.
- Filter analytics links by expiry status and search with debounce.
- Delete owned short links.
- Reuse an existing active short link when the same user shortens the same destination URL.
- Cache redirect lookups in Redis to reduce database reads.

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | Next.js App Router, React 19, TypeScript, React Hook Form, Zod, shadcn/ui, Chart.js |
| Backend | NestJS, TypeScript, Prisma, PostgreSQL |
| Auth | HTTP-only JWT access and refresh cookies, hashed refresh token in DB |
| Cache | Upstash Redis REST API |
| Package manager | pnpm |

## Project Structure

```text
.
+-- AI_CHAT_LOG.md
+-- README.md
+-- backend
|   +-- prisma
|   |   +-- migrations
|   |   +-- schema.prisma
|   |   +-- seed.sql
|   +-- src
|       +-- analytics
|       +-- auth
|       +-- logger
|       +-- prisma
|       +-- redis
|       +-- shortenUrl
|       +-- tracking
+-- frontend
    +-- app
    |   +-- (app)
    |   +-- (auth)
    +-- components
    +-- features
    +-- lib
```

## Prerequisites

- Node.js compatible with the installed Next.js and NestJS versions.
- pnpm.
- PostgreSQL database.
- Upstash Redis database or compatible Redis REST credentials.

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
PORT=3000
API_GLOBAL_PREFIX=v1/app
SHORTEN_URL_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=replace-with-a-long-random-secret
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=604800
JWT_ACCESS_COOKIE_NAME=access_token
JWT_REFRESH_COOKIE_NAME=refresh_token
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=100
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_CACHE_TTL_S=3600
```

### Frontend

Create `frontend/.env.local`.

```env
SHORTEN_URL_API_BASE_URL=http://localhost:3000/v1/app
SHORTEN_URL_PUBLIC_BASE_URL=http://localhost:3000
JWT_ACCESS_COOKIE_NAME=access_token
JWT_REFRESH_COOKIE_NAME=refresh_token
```

`SHORTEN_URL_API_BASE_URL` must include the backend global prefix because frontend server actions call endpoints such as `/auth/me`, `/shorten-url`, and `/analytics/links` through this base URL.

`SHORTEN_URL_PUBLIC_BASE_URL` should point to the public redirect host, without the API prefix, because short links are served as `/:shortCode`.

## Backend Setup

```bash
cd backend
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm run start:dev
```

The backend listens on `http://localhost:3000` by default.

Swagger is available at:

```text
http://localhost:3000/v1/app/docs
```

To load the provided smoke-test seed data, run `backend/prisma/seed.sql` against your PostgreSQL database with your preferred SQL client.

## Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Common Scripts

### Backend

```bash
pnpm run start:dev
pnpm run build
pnpm run test
pnpm run test:e2e
pnpm run lint
```

### Frontend

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## API Overview

The backend uses `API_GLOBAL_PREFIX`, which defaults to `v1/app`, for API routes. The redirect endpoint is intentionally excluded from that prefix.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/app/auth/register` | Register and set auth cookies |
| `POST` | `/v1/app/auth/login` | Login and set auth cookies |
| `GET` | `/v1/app/auth/me` | Read the current authenticated user |
| `POST` | `/v1/app/auth/logout` | Logout and clear auth cookies |
| `POST` | `/v1/app/shorten-url` | Create or reuse a short link |
| `GET` | `/:shortCode` | Redirect to the destination URL |
| `GET` | `/v1/app/analytics/links` | List current user's link analytics |
| `GET` | `/v1/app/analytics/links/:shortCode` | Read one link's analytics details |
| `DELETE` | `/v1/app/analytics/links/:shortCode` | Delete one owned short link |
| `GET` | `/v1/app/shorten-url/:shortCode/tracking` | Read recent tracking events for an owned link |

## Data Model Notes

- `shortened_links.user_id` is nullable so anonymous users can create short links.
- Analytics rows are created only for links owned by logged-in users.
- Raw clicks are stored in `click_events`.
- Aggregated link stats are stored by hour, day, and week.
- Aggregated creator stats are stored by day, week, and month for leaderboard-style reporting.
- Primary keys use `BigInt` to support snowflake-style IDs.

## Development Notes

- The frontend App Router separates authenticated app pages under `frontend/app/(app)` and auth pages under `frontend/app/(auth)`.
- Frontend feature code lives under `frontend/features`.
- Backend feature modules live under `backend/src`, with separate modules for auth, analytics, short links, tracking, Redis, Prisma, and logging.
- Redirect tracking uses request headers and does not currently call a third-party geolocation API.
- Redis uses a cache-aside pattern: check Redis first, fall back to PostgreSQL, then cache the redirect target.

## AI Work Log

Major AI-assisted implementation sessions are documented in `AI_CHAT_LOG.md`. The log records the original prompt context, generated work, accepted parts, follow-up modifications, and why each session affected the project.
