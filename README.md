# RutGonLink

## Project overview

RutGonLink is a URL shortener with authentication, public redirect links, click tracking, analytics dashboards, and Redis-backed redirect caching.

The app has two deployable parts:

- `backend`: NestJS API for auth, short-link creation, redirect resolution, tracking, analytics, PostgreSQL, and Redis.
- `frontend`: Next.js app for the UI, auth pages, analytics pages, copy actions, toast feedback, and the public short-link proxy route.

Production URLs:

```text
Backend API: https://shol.up.railway.app/v1/app
Public app:  https://linkngan.vercel.app
```

The public short-link route lives on the frontend domain. It forwards request metadata such as referrer, user agent, IP, and Vercel geo headers to the backend before redirecting the user to the destination URL.

## Features implemented

- Create short links as an anonymous or logged-in user.
- Reuse an existing active short link when the same logged-in user shortens the same destination URL.
- Redirect short codes to their destination URLs.
- Track analytics for links owned by logged-in users.
- Store click metadata: referrer, UTM values, IP, country, city, device type, browser, and OS.
- View analytics list and detail pages.
- Filter analytics links by expiry status and search query.
- Delete owned short links.
- Invalidate Redis redirect cache when an owned link is deleted.
- Copy short links quickly from the create form, analytics list, and analytics detail page.
- Show toast notifications when a link is created or copied.
- Cache redirect lookups in Redis to reduce database reads.
- Expose Swagger documentation for backend APIs.

## Tech stack

| Area            | Tools                                                                               |
| --------------- | ----------------------------------------------------------------------------------- |
| Frontend        | Next.js App Router, React 19, TypeScript, React Hook Form, Zod, shadcn/ui, Chart.js |
| Backend         | NestJS, TypeScript, Prisma, PostgreSQL                                              |
| Auth            | HTTP-only JWT access and refresh cookies, hashed refresh token in PostgreSQL        |
| Cache           | Upstash Redis REST API                                                              |
| UI feedback     | Sonner                                                                              |
| Package manager | pnpm                                                                                |

## Architecture overview

RutGonLink uses a feature-oriented frontend and modular backend.

The frontend renders the product UI and calls backend APIs from server actions/utilities. Authenticated app pages live under `frontend/app/(app)`, auth pages live under `frontend/app/(auth)`, reusable UI components live under `frontend/components`, and feature-specific logic lives under `frontend/features`.

The frontend also owns the public short-link entrypoint:

```text
GET /:shortCode
```

That route receives requests on the Vercel domain, forwards tracking headers to the backend redirect endpoint, then returns the backend redirect response to the browser. This lets the backend record Vercel location headers while keeping displayed short links on the frontend domain.

The backend is organized as NestJS modules:

- `auth`: registration, login, logout, current-user lookup, JWT cookies.
- `shortenUrl`: short-link creation and redirect target resolution.
- `tracking`: click-event persistence and recent tracking reads.
- `analytics`: analytics list/detail queries and link deletion.
- `redis`: Upstash Redis wrapper for redirect cache.
- `prisma`: Prisma client lifecycle.
- `logger`: application logging.

Redirect resolution uses a cache-aside pattern:

```text
Request short code
-> read Redis key redirect:<shortCode>
-> on hit, return cached target
-> on miss, read PostgreSQL
-> validate active/expiry state
-> cache the redirect target with TTL
-> redirect and record click metadata
```

The API uses a global prefix, defaulting to:

```text
/v1/app
```

The backend redirect endpoint is excluded from that prefix so it can resolve:

```text
/:shortCode
```

## API design

Swagger is available locally at:

```text
http://localhost:3000/v1/app/docs
```

The API prefix is controlled by `API_GLOBAL_PREFIX`, which defaults to `v1/app`.

| Method   | Path                                      | Purpose                                       |
| -------- | ----------------------------------------- | --------------------------------------------- |
| `GET`    | `/v1/app`                                 | Health/basic app response                     |
| `POST`   | `/v1/app/auth/register`                   | Register and set auth cookies                 |
| `POST`   | `/v1/app/auth/login`                      | Login and set auth cookies                    |
| `GET`    | `/v1/app/auth/me`                         | Read the current authenticated user           |
| `POST`   | `/v1/app/auth/logout`                     | Logout and clear auth cookies                 |
| `POST`   | `/v1/app/shorten-url`                     | Create or reuse a short link                  |
| `GET`    | `/:shortCode`                             | Redirect to the destination URL               |
| `GET`    | `/v1/app/analytics/links`                 | List current user's link analytics            |
| `GET`    | `/v1/app/analytics/links/:shortCode`      | Read one link's analytics details             |
| `DELETE` | `/v1/app/analytics/links/:shortCode`      | Delete one owned short link                   |
| `GET`    | `/v1/app/shorten-url/:shortCode/tracking` | Read recent tracking events for an owned link |

Frontend environment variables separate backend API calls from public short-link display:

```env
SHORTEN_URL_API_BASE_URL=http://localhost:3000/v1/app
SHORTEN_URL_PUBLIC_BASE_URL=http://localhost:5173
```

`SHORTEN_URL_API_BASE_URL` includes the API prefix because frontend code calls endpoints such as `/auth/me`, `/shorten-url`, and `/analytics/links`.

`SHORTEN_URL_PUBLIC_BASE_URL` does not include the API prefix because public short links use `/:shortCode`.

## Data model

The database is PostgreSQL and is managed through Prisma.

Main tables:

- `organizations`: organization/workspace records. The current app is mostly user-focused, but the schema supports organization ownership.
- `users`: registered users, password hashes, refresh token hashes, user tier, and optional organization membership.
- `shortened_links`: short code, destination URL, owner user/organization, creator type, active state, expiry, and timestamps.
- `click_events`: raw click tracking events for owned links, including referrer, UTM values, location headers, device/browser/OS, and IP.
- `link_stats_hourly`, `link_stats_daily`, `link_stats_weekly`: aggregate tables for link-level reporting.
- `creator_stats_daily`, `creator_stats_weekly`, `creator_stats_monthly`: aggregate tables for creator-level reporting and leaderboard-style metrics.

Important relationships:

- A `User` can own many `ShortenedLink` records.
- A `ShortenedLink` can have many `ClickEvent` records.
- `shortened_links.user_id` is nullable, so anonymous users can create links.
- Click analytics are persisted only for links owned by logged-in users.
- `click_events` references both `link_id` and `user_id` to keep click data scoped to the link owner.
- Primary keys use `BigInt` IDs generated by the application.

Important indexes and constraints:

- `shortened_links.short_code` is unique.
- `shortened_links` is indexed by user, organization, and creation time.
- `click_events` is indexed by link, user, organization, clicked time, referrer domain, location, and device type.
- Aggregate stats tables use unique constraints per link/date or creator/date bucket.

## How to run

It is normal for a README to include environment variable setup. The common pattern is to commit `.env.example`, document required variables, and never commit real secrets.

Prerequisites:

- Node.js compatible with the installed Next.js and NestJS versions.
- pnpm.
- PostgreSQL database.
- Upstash Redis database or compatible Redis REST credentials.

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Backend local environment should include:

```env
PORT=3000
API_GLOBAL_PREFIX=v1/app
SHORTEN_URL_PUBLIC_BASE_URL=http://localhost:5173
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

Frontend local environment should include:

```env
SHORTEN_URL_API_BASE_URL=http://localhost:3000/v1/app
SHORTEN_URL_PUBLIC_BASE_URL=http://localhost:5173
JWT_ACCESS_COOKIE_NAME=access_token
JWT_REFRESH_COOKIE_NAME=refresh_token
```

Run the backend:

```bash
cd backend
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm start:dev
```

The backend runs at:

```text
http://localhost:3000
```

Run the frontend in a separate terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend runs at:

```text
http://localhost:5173
```
