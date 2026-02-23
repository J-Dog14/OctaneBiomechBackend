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

**Optional — Octane user lookup:** To look up users in the Octane app by email (dashboard "Send payload" page and athlete email → `app_db_uuid` resolution), set `OCTANE_APP_API_URL` (Octane app base URL, HTTPS) and `OCTANE_API_KEY` (Bearer token). Treat the API key like a password: do not commit it or use it in client-side code; keep it in server-side env only.

### 3. Set Up Prisma

**Important**: Prisma 7+ requires the connection URL to be passed to the PrismaClient constructor (not in the schema). The `DATABASE_URL` environment variable is used automatically.

If you have an existing database schema, pull it into Prisma:

```bash
# Make sure DATABASE_URL is set in your .env.local
pnpm prisma db pull
```

This will populate `prisma/schema.prisma` with your database structure. Note that `prisma db pull` reads the connection string from the `DATABASE_URL` environment variable.

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

#### Prerequisites

1. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you haven't already

#### Step-by-Step Deployment

1. **Push Code to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel will auto-detect Next.js settings

3. **Configure Build Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (or `pnpm build` if using pnpm)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (or `pnpm install`)

4. **Set Environment Variables**
   In the Vercel project settings, add these environment variables:
   
   - `DATABASE_URL`
     - Value: Your Neon Postgres connection string (read-only recommended)
     - Example: `postgresql://user:password@host:5432/database?sslmode=require`
   
   - `BIOMECH_API_KEYS`
     - Value: Comma-separated list of API keys
     - Example: `prod-key-abc123,prod-key-xyz789`
     - **Important**: No spaces after commas

5. **Deploy**
   - Click "Deploy"
   - Vercel will:
     - Install dependencies
     - Run `prisma generate` (via postinstall script)
     - Build the Next.js app
     - Deploy to production

6. **Verify Deployment**
   - Check the deployment logs for any errors
   - Test the health endpoint: `https://your-project.vercel.app/api/health`
   - Test an authenticated endpoint with your API key

#### Environment Variables in Vercel

To add/update environment variables after deployment:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add or edit variables
4. Redeploy for changes to take effect

#### Using Vercel CLI (Alternative)

You can also deploy using the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add BIOMECH_API_KEYS

# Deploy to production
vercel --prod
```

#### Build Configuration

The project is configured to automatically generate the Prisma client:
- `postinstall` script runs `prisma generate` after `npm install`
- `build` script runs `prisma generate && next build`

This ensures Prisma client is available during the Vercel build process.

#### Troubleshooting

**Prisma Client Not Found**
- Ensure `prisma` is in `devDependencies` (it is)
- Check that `prisma/schema.prisma` exists and is valid
- Verify build logs show `prisma generate` running

**Database Connection Issues**
- Verify `DATABASE_URL` is set correctly in Vercel
- Check that your Neon database allows connections from Vercel's IPs
- Ensure SSL is enabled in the connection string (`?sslmode=require`)

**API Key Authentication Failing**
- Verify `BIOMECH_API_KEYS` is set in Vercel
- Check for extra spaces in the comma-separated list
- Ensure you're sending the header as `X-API-Key` (case-sensitive)

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

