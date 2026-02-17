# Testing Production API

## Test Health Endpoint

Since the health endpoint requires API key authentication, you can't test it directly in a browser. Use one of these methods:

### Method 1: Using curl (Command Line)

```bash
curl -H "X-API-Key: your-api-key-here" \
  https://octane-biomech-backend.vercel.app/api/health
```

Expected response:
```json
{"dbOk": true}
```

### Method 2: Using Postman

1. Create a new GET request
2. URL: `https://octane-biomech-backend.vercel.app/api/health`
3. Headers tab:
   - Key: `X-API-Key`
   - Value: `your-api-key-here`
4. Send request

### Method 3: Using Browser Extension

Install a browser extension like "ModHeader" that lets you add custom headers:
1. Install ModHeader extension
2. Add header: `X-API-Key: your-api-key-here`
3. Visit: `https://octane-biomech-backend.vercel.app/api/health`

---

## Verify Environment Variable is Set

If you're still getting "Missing X-API-Key header" even with the header:

1. **Check Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify `BIOMECH_API_KEYS` is set
   - Make sure it's set for **Production** environment
   - Value should be: `your-api-key-here` (or comma-separated if multiple)

2. **Redeploy After Setting Variables:**
   - After adding/updating environment variables, you MUST redeploy
   - Go to Deployments → Click "..." on latest → "Redeploy"
   - Or push a new commit

3. **Check Deployment Logs:**
   - In Vercel, go to your latest deployment
   - Check the build logs for any errors
   - Check function logs for runtime errors

---

## Test Other Endpoints

### Test Athletes Endpoint:
```bash
curl -H "X-API-Key: your-api-key-here" \
  "https://octane-biomech-backend.vercel.app/api/uais/athletes?limit=5"
```

### Test with Specific Athlete:
```bash
curl -H "X-API-Key: your-api-key-here" \
  "https://octane-biomech-backend.vercel.app/api/uais/arm-action?athleteUuid=YOUR-UUID-HERE"
```

---

## Troubleshooting

### Still Getting "Missing X-API-Key header"?
- Make sure you're sending the header (browsers can't do this)
- Use curl or Postman instead
- Verify the header name is exactly `X-API-Key` (case-sensitive)

### Getting "Invalid API key"?
- Check that `BIOMECH_API_KEYS` in Vercel matches the key you're sending
- Make sure you redeployed after setting the variable
- Check for extra spaces in the environment variable value

### Getting Database Errors?
- Verify `DATABASE_URL` is set in Vercel
- Make sure you're using the pooled connection string
- Check Neon database allows connections from Vercel
