# 8ctane Biomech Read API (Next.js + Prisma + Neon + Vercel)
Implementation Plan (API-only, secure, low-complexity)

## Goals
- Stand up a **read-only** backend service on **Vercel** using **Next.js (App Router)**.
- Connect to existing **Neon Postgres** using **Prisma** (existing schema).
- Secure **server-to-server** access from Octane via **API Key** (no UI, no user auth).
- Keep it simple: minimal endpoints, predictable structure, easy key rotation.

---

## High-level Architecture
- **Octane (server-side only)** calls → **Biomech API service (Vercel)** → reads from **Neon** via **Prisma**.
- Auth via `X-API-Key` header validated against `BIOMECH_API_KEYS` env var.
- Database credentials use a **read-only Neon role** if possible.

---

## Milestone 0 — Repo + Project Setup
### 0.1 Create repo
- `pnpm create next-app biomech-api --ts --app --eslint`
- Delete UI surfaces you don’t need (optional):
  - Remove `app/page.tsx` (or leave a tiny “OK” page)
  - You’ll primarily use `app/api/**`

### 0.2 Add dependencies
- `pnpm add prisma @prisma/client zod`
- (Optional) `pnpm add @t3-oss/env-nextjs` for typed env
- (Optional) Upstash rate limit later: `pnpm add @upstash/ratelimit @upstash/redis`

### 0.3 Initialize Prisma
- `pnpm prisma init`

---

## Milestone 1 — Prisma Bootstrap from Existing Neon DB
### 1.1 Create Neon credentials
- Create a **read-only DB role** in Neon:
  - `GRANT CONNECT ON DATABASE ...`
  - `GRANT USAGE ON SCHEMA ...`
  - `GRANT SELECT ON ALL TABLES IN SCHEMA ...`
  - `ALTER DEFAULT PRIVILEGES IN SCHEMA ... GRANT SELECT ON TABLES ...`
- Create a **read-only connection string** for this service.

### 1.2 Pull the existing schema into Prisma
- Set local `.env.local`:
  - `DATABASE_URL="postgresql://...readonly..."`
- Run:
  - `pnpm prisma db pull`
- Review `prisma/schema.prisma`:
  - Confirm table names, relations, indexes
  - Fix any types Prisma couldn’t infer cleanly

### 1.3 Decide migration strategy (important)
- Since DB already exists:
  - **Do not run** `prisma migrate dev` until you’re sure you want Prisma to own schema changes.
- Suggested approach:
  - Start with **db pull only** (read-only service).
  - If you later need schema changes, establish a separate “schema owner” workflow.

### 1.4 Prisma client instantiation (serverless safe)
Create `lib/db/prisma.ts` with a singleton pattern (avoid creating many clients on hot reload).

---

## Milestone 2 — Security: API Key Auth + Key Rotation
### 2.1 Env vars (Vercel)
In the Biomech API service (Vercel):
- `BIOMECH_API_KEYS="prodKeyCurrent,prodKeyNext"`
- `DATABASE_URL="...readonly..."`

In Octane (Vercel):
- `BIOMECH_API_KEY="prodKeyCurrent"`
- `BIOMECH_API_BASE_URL="https://<biomech-api>.vercel.app"`

### 2.2 API key validator
- Require header: `X-API-Key`
- Compare to allowed list from `BIOMECH_API_KEYS` (comma-separated)
- Reject with `401` if missing/invalid
- Never log the key or headers verbatim

### 2.3 Rotation procedure (no downtime)
1) Add `newKey` to `BIOMECH_API_KEYS` on Biomech API (now both keys valid)
2) Deploy
3) Update Octane `BIOMECH_API_KEY` to `newKey`
4) Deploy
5) Remove old key from `BIOMECH_API_KEYS`
6) Deploy

### 2.4 Hard requirement
- Octane must call this API **server-to-server only**
  - Route handler / server action / backend job
  - Never from the browser

---

## Milestone 3 — Minimal API Skeleton (No Full Endpoint Spec Yet)
### 3.1 Folder structure

app/
api/
health/
route.ts
biomech/
sessions/
route.ts
sessions/
[sessionId]/
route.ts

lib/
auth/
requireApiKey.ts
db/
prisma.ts
validation/
biomech.ts
responses/
errors.ts (optional)


### 3.2 Health endpoint
- `GET /api/health`
- Returns `{ ok: true }`
- No DB call required (or add an optional DB ping endpoint if helpful)

### 3.3 First “read” endpoints (placeholders)
Start with minimal shapes you can adjust after you upload schema:
- `GET /api/biomech/sessions?orgId=...&athleteId=...&limit=...&cursor=...`
- `GET /api/biomech/sessions/:sessionId?orgId=...`

Implementation requirements:
- Validate query params with Zod
- Enforce org scoping in every query (`where: { orgId, ... }`)
- Add cursor pagination if tables are large

---

## Milestone 4 — Vercel Deployment Checklist
1) Create Vercel project from repo
2) Set env vars:
   - `DATABASE_URL` (read-only)
   - `BIOMECH_API_KEYS`
3) Deploy
4) Smoke test:
   - `GET /api/health`
   - Call a read endpoint with `X-API-Key`
5) Confirm logs do not include secrets

---

## Milestone 5 — Octane Integration (Server Side)
- Create a small server utility in Octane:
  - Reads `process.env.BIOMECH_API_KEY`
  - Adds `X-API-Key` header
  - Calls the Biomech API from server-only code
- Add a simple retry policy if desired (e.g., 2 retries on 5xx)

---

## Milestone 6 — Optional Hardening (Only if Needed)
- Rate limiting with Upstash (`@upstash/ratelimit`) on `/api/biomech/*`
- HMAC signing + timestamp (replay protection)
- Audit logging (redacted), request IDs
- RLS in Neon (extra isolation, adds complexity—only if needed)

---

## “Inputs Needed” (When You’re Ready)
When you upload the existing schema, we’ll finalize:
- Which tables are the source of truth
- What “session” means in your data model
- The minimal fields Octane needs (to avoid overexposing raw data)
- Index suggestions for the exact query patterns

---

## Definition of Done
- Vercel-deployed Next.js API-only service
- Prisma connected to Neon (read-only)
- `X-API-Key` auth enforced on all read routes
- Octane server-side fetch working in prod
- Documented rotation steps + env var conventions
