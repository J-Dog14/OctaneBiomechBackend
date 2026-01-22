# Vercel Setup Guide

## Understanding Vercel URLs

Your Vercel deployment has its own web URL, separate from your database connection string.

**❌ Wrong:** Using `DATABASE_URL` in browser
```
https://postgresql://neondb_owner:...@ep-cold-bonus.../api/health
```

**✅ Correct:** Using your Vercel app URL
```
https://your-project-name.vercel.app/api/health
```

---

## Step 1: Find Your Vercel Project URL

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Log in to your account
   - Find your project (likely named `octane-biomech-backend` or similar)

2. **Check the Project Overview:**
   - Click on your project
   - Look at the top of the page - you'll see your deployment URL
   - It will look like: `https://octane-biomech-backend-xyz123.vercel.app`
   - Or if you set a custom domain: `https://your-custom-domain.com`

3. **Alternative: Check Deployments Tab:**
   - Go to the "Deployments" tab
   - Click on the latest deployment
   - The URL will be shown at the top

---

## Step 2: Verify Environment Variables in Vercel

**Important:** Environment variables in your local `.env` file are NOT automatically in Vercel. You must set them separately in the Vercel dashboard.

1. **Go to Project Settings:**
   - In your Vercel project, click **Settings**
   - Click **Environment Variables** in the left sidebar

2. **Add/Verify These Variables:**

   **DATABASE_URL:**
   ```
   postgresql://neondb_owner:npg_7EvrQcJsO1LB@ep-cold-bonus-a4zk087n-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
   - Make sure to use the **pooled connection string** if available (better for serverless)
   - Or use the direct connection string

   **BIOMECH_API_KEYS:**
   ```
   your-api-key-here,another-key-if-needed
   ```
   - Comma-separated, no spaces
   - Use the same key you tested with in Postman

3. **Set for All Environments:**
   - Make sure variables are set for **Production**, **Preview**, and **Development**
   - Or at minimum, set for **Production**

4. **Redeploy After Adding Variables:**
   - After adding/updating environment variables, you need to redeploy
   - Go to **Deployments** tab
   - Click **"..."** on the latest deployment → **"Redeploy"**
   - Or push a new commit to trigger a new deployment

---

## Step 3: Test Your Deployment

Once you have your Vercel URL, test it:

### Test Health Endpoint (No Auth Required):
```bash
curl https://your-project-name.vercel.app/api/health
```

Expected response:
```json
{"dbOk": true}
```

### Test Authenticated Endpoint:
```bash
curl -H "X-API-Key: your-api-key" \
  https://your-project-name.vercel.app/api/uais/athletes?limit=5
```

---

## Step 4: Check Deployment Status

1. **Go to Deployments Tab:**
   - Check if your latest deployment shows "Ready" (green checkmark)
   - If it shows "Error" or "Building", check the logs

2. **Check Build Logs:**
   - Click on a deployment
   - Scroll down to see build logs
   - Look for any errors (especially Prisma-related)

3. **Check Function Logs:**
   - In the deployment, click on a function (e.g., `/api/health`)
   - Check "Logs" tab for runtime errors

---

## Common Issues & Solutions

### Issue: "Site can't be reached"
**Solution:** You're using the wrong URL. Use your Vercel project URL, not the database URL.

### Issue: "401 Unauthorized"
**Solution:** 
- Check that `BIOMECH_API_KEYS` is set in Vercel
- Make sure you redeployed after adding the variable
- Verify the API key matches what you're sending

### Issue: "Database connection error"
**Solution:**
- Verify `DATABASE_URL` is set correctly in Vercel
- Make sure you're using the pooled connection string (better for serverless)
- Check that your Neon database allows connections from Vercel's IPs

### Issue: "Prisma Client not found"
**Solution:**
- Check build logs - `prisma generate` should run automatically
- Verify `prisma/schema.prisma` is in your repo
- Make sure `@prisma/client` is in `dependencies` (not just `devDependencies`)

---

## Quick Checklist

- [ ] Found your Vercel project URL
- [ ] Set `DATABASE_URL` in Vercel environment variables
- [ ] Set `BIOMECH_API_KEYS` in Vercel environment variables
- [ ] Redeployed after setting environment variables
- [ ] Tested `/api/health` endpoint
- [ ] Tested authenticated endpoint with API key

---

## Next Steps

Once your deployment is working:
1. Share the Vercel URL with your Octane team
2. Share the API key (securely)
3. Update `API_ENDPOINTS_REFERENCE.md` with your actual production URL
4. Test all endpoints in production
