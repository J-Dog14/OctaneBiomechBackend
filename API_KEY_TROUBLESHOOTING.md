# API Key Troubleshooting Guide

## Step-by-Step Verification

### Step 1: Verify Environment Variable in Vercel

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Go to your project: `octane-biomech-backend`
   - Click **Settings** → **Environment Variables**

2. **Check `BIOMECH_API_KEYS`:**
   - Look for the variable `BIOMECH_API_KEYS`
   - **Important:** The variable name must be exactly `BIOMECH_API_KEYS` (case-sensitive)
   - Check the value - it should be your API key (no quotes, no extra spaces)
   - Example: `my-secret-api-key-123` (NOT `"my-secret-api-key-123"`)

3. **Check Environment Scope:**
   - Make sure it's set for **Production** (at minimum)
   - You can also set it for Preview and Development if you want

### Step 2: Verify You Redeployed

**Critical:** After adding/updating environment variables, you MUST redeploy!

1. **Option A: Redeploy from Dashboard**
   - Go to **Deployments** tab
   - Click the **"..."** (three dots) on your latest deployment
   - Click **"Redeploy"**
   - Wait for it to finish

2. **Option B: Push a New Commit**
   - Make any small change (or just add a comment)
   - Commit and push
   - Vercel will auto-deploy

### Step 3: Test with the Exact API Key

Use the **exact same API key** that you set in Vercel:

```bash
# Replace 'your-exact-api-key' with the value from Vercel
curl -H "X-API-Key: your-exact-api-key" \
  https://octane-biomech-backend.vercel.app/api/uais/athletes?limit=5
```

**Common mistakes:**
- ❌ Extra spaces: `" my-key "` (should be `my-key`)
- ❌ Quotes in Vercel: Don't put quotes around the value in Vercel
- ❌ Different key: Make sure you're using the same key in both places

### Step 4: Check Deployment Logs

1. Go to **Deployments** → Click on latest deployment
2. Check **Build Logs** for any errors
3. Check **Function Logs** (click on a function like `/api/uais/athletes`)
4. Look for any errors related to environment variables

---

## Common Issues & Solutions

### Issue: "Missing X-API-Key header"
**You're not sending the header:**
- Browsers can't send custom headers
- Use curl or Postman instead
- Or use a browser extension like ModHeader

### Issue: "Invalid API key"
**The key doesn't match:**

1. **Check for extra spaces:**
   - In Vercel, edit the variable
   - Make sure there are NO spaces before or after the key
   - Copy the exact value

2. **Verify the key matches:**
   - Copy the value from Vercel
   - Use that exact value in your curl/Postman request
   - Don't add quotes or modify it

3. **Check if you redeployed:**
   - Environment variables only take effect after redeployment
   - Go to Deployments → Redeploy the latest

4. **Test with a simple key first:**
   - Set `BIOMECH_API_KEYS` to something simple like `test123`
   - Redeploy
   - Test with: `curl -H "X-API-Key: test123" https://octane-biomech-backend.vercel.app/api/uais/athletes?limit=5`
   - If this works, your original key might have special characters or formatting issues

### Issue: "BIOMECH_API_KEYS not configured"
**The environment variable isn't being read:**

1. **Check variable name:**
   - Must be exactly: `BIOMECH_API_KEYS` (all caps, underscore, no typos)

2. **Check it's set for Production:**
   - In Vercel, when adding the variable, make sure "Production" is checked

3. **Redeploy:**
   - Always redeploy after adding environment variables

---

## Quick Test Script

Run this to test your API key (replace with your actual key):

```bash
# Test 1: Health (should work without key now)
curl https://octane-biomech-backend.vercel.app/api/health

# Test 2: Athletes (requires key)
curl -H "X-API-Key: YOUR-KEY-HERE" \
  https://octane-biomech-backend.vercel.app/api/uais/athletes?limit=5

# Test 3: Arm Action (requires key)
curl -H "X-API-Key: YOUR-KEY-HERE" \
  "https://octane-biomech-backend.vercel.app/api/uais/arm-action?athleteUuid=YOUR-UUID"
```

---

## Debug: Check What Vercel Sees

If you want to verify what Vercel is reading, you can temporarily add logging (then remove it):

1. Add a temporary endpoint to see the env var (for debugging only):
```typescript
// app/api/debug-env/route.ts (DELETE THIS AFTER TESTING!)
export async function GET() {
  // NEVER log the actual key in production!
  return Response.json({
    hasKeys: !!process.env.BIOMECH_API_KEYS,
    keyLength: process.env.BIOMECH_API_KEYS?.length ?? 0,
    // Don't log the actual key value!
  });
}
```

2. Test it: `curl https://octane-biomech-backend.vercel.app/api/debug-env`
3. **Delete this endpoint immediately after testing!**

---

## Final Checklist

- [ ] `BIOMECH_API_KEYS` is set in Vercel (exact name, no typos)
- [ ] Value has no extra spaces or quotes
- [ ] Set for Production environment
- [ ] Redeployed after setting the variable
- [ ] Using the exact same key in your test request
- [ ] Testing with curl/Postman (not browser)
- [ ] Header name is exactly `X-API-Key` (case-sensitive)
