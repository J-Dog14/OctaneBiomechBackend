# Vercel Deployment Guide

Quick reference for deploying Octane Biomech Backend to Vercel.

## Quick Start

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Add environment variables (see below)
   - Click Deploy

## Required Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon Postgres connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `BIOMECH_API_KEYS` | Comma-separated API keys | `key1,key2,key3` |

## Build Configuration

Vercel will automatically:
- Detect Next.js framework
- Run `npm install` (which triggers `prisma generate` via postinstall)
- Run `npm run build` (which includes `prisma generate`)
- Deploy to production

## Post-Deployment Checklist

- [ ] Health check works: `GET https://your-app.vercel.app/api/health`
- [ ] API key authentication works: `GET https://your-app.vercel.app/api/biomech/sessions?orgId=test`
- [ ] Database connection successful (check Vercel function logs)
- [ ] Environment variables are set correctly

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

## Monitoring

- **Logs**: Vercel Dashboard → Deployments → [Select Deployment] → Functions
- **Analytics**: Enable in Project Settings → Analytics
- **Alerts**: Set up in Project Settings → Notifications

## Rollback

If a deployment fails:
1. Go to Deployments tab
2. Find the last working deployment
3. Click "..." → "Promote to Production"

