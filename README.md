# Octane Biomech Backend API

A Next.js App Router API-only service for reading biomechanics data from a Neon Postgres database using Prisma.

## Features

- Read-only API service (no database writes)
- Server-to-server API key authentication
- Cursor-based pagination
- Request validation with Zod
- Org-scoped data access
- Secure constant-time API key comparison

## Prerequisites

- Node.js 18+ and pnpm
- Neon Postgres database with existing data
- Read-only database connection string (recommended)

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set the following variables:

- `DATABASE_URL`: Your Neon Postgres connection string (preferably read-only)
- `BIOMECH_API_KEYS`: Comma-separated list of valid API keys (e.g., `"key1,key2"`)

### 3. Set Up Prisma

If you have an existing database schema, pull it into Prisma:

```bash
pnpm prisma db pull
```

This will populate `prisma/schema.prisma` with your database structure.

### 4. Generate Prisma Client

```bash
pnpm prisma generate
```

### 5. Update Repository Layer

After running `prisma db pull`, update `lib/biomech/repo.ts` with your actual Prisma model names and field names. The file contains TODO comments indicating where changes are needed.

### 6. Run Development Server

```bash
pnpm dev
```

The API will be available at `http://localhost:3000`.

## API Endpoints

### Health Check

```bash
GET /api/health
```

Returns: `{ ok: true }`

No authentication required.

### List Sessions

```bash
GET /api/biomech/sessions?orgId=<orgId>&athleteId=<athleteId>&limit=50&cursor=<cursor>
```

**Query Parameters:**
- `orgId` (required): Organization ID for scoping
- `athleteId` (optional): Filter by athlete ID
- `limit` (optional): Number of results per page (default: 50, max: 200)
- `cursor` (optional): Pagination cursor from previous response

**Headers:**
- `X-API-Key`: Valid API key

**Response:**
```json
{
  "items": [...],
  "nextCursor": "cursor-string-or-null"
}
```

### Get Session Detail

```bash
GET /api/biomech/sessions/<sessionId>?orgId=<orgId>
```

**Query Parameters:**
- `orgId` (required): Organization ID for scoping

**Headers:**
- `X-API-Key`: Valid API key

**Response:**
```json
{
  "id": "...",
  "orgId": "...",
  "athleteId": "...",
  "createdAt": "...",
  ...
}
```

## Example Requests

### Health Check

```bash
curl http://localhost:3000/api/health
```

### List Sessions

```bash
curl -H "X-API-Key: your-api-key-here" \
  "http://localhost:3000/api/biomech/sessions?orgId=org123&limit=10"
```

### Get Session Detail

```bash
curl -H "X-API-Key: your-api-key-here" \
  "http://localhost:3000/api/biomech/sessions/session123?orgId=org123"
```

## API Key Rotation

The service supports multiple API keys via the `BIOMECH_API_KEYS` environment variable (comma-separated). This enables zero-downtime key rotation:

1. Add the new key to `BIOMECH_API_KEYS`: `"old-key,new-key"`
2. Deploy the service
3. Update clients to use the new key
4. Remove the old key: `"new-key"`
5. Deploy again

## Security

- API keys are validated using constant-time comparison to prevent timing attacks
- Request headers are never logged
- All biomech endpoints require API key authentication
- Org scoping is enforced on all queries
- Input validation is performed with Zod schemas

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── health/
│   │   │   └── route.ts
│   │   └── biomech/
│   │       └── sessions/
│   │           ├── route.ts
│   │           └── [sessionId]/
│   │               └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth/
│   │   └── requireApiKey.ts
│   ├── biomech/
│   │   └── repo.ts
│   ├── db/
│   │   └── prisma.ts
│   ├── responses.ts
│   └── validation/
│       └── biomech.ts
├── prisma/
│   └── schema.prisma
├── .env.example
└── README.md
```

## Deployment

### Vercel

1. Push your code to a Git repository
2. Import the project in Vercel
3. Set environment variables:
   - `DATABASE_URL`
   - `BIOMECH_API_KEYS`
4. Deploy

The Prisma client will be generated during the build process.

## Development

### Prisma Studio

View and explore your database:

```bash
pnpm prisma studio
```

### Type Checking

```bash
pnpm run build
```

### Linting

```bash
pnpm lint
```

## Notes

- This is a read-only service. No database writes are performed.
- The repository layer (`lib/biomech/repo.ts`) contains placeholder implementations that must be updated after running `prisma db pull`.
- All API routes return appropriate HTTP status codes (4xx for client errors, 5xx for server errors).

