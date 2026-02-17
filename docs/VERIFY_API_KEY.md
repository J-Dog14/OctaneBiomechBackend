# Verify API Key is Working

Since the debug endpoint shows your key is configured correctly, let's test if authentication actually works.

## Quick Test

### Test 1: Verify the key preview matches

Your debug endpoint shows: `"aab...843"`

This means:
- First 3 characters: `aab`
- Last 3 characters: `843`

**Verify:** Does your API key start with `aab` and end with `843`? If not, you might be using a different key.

### Test 2: Test with curl (Command Line)

**Important:** You MUST use curl or Postman - browsers cannot send custom headers!

```bash
# Replace YOUR-64-CHAR-KEY with your actual 64-character key
curl -H "X-API-Key: YOUR-64-CHAR-KEY" \
  https://octane-biomech-backend.vercel.app/api/uais/athletes?limit=5
```

**Expected responses:**
- ✅ Success: `{"athletes":[...], "nextCursor": "...", "hasMore": true}`
- ❌ "Missing X-API-Key header": You're not sending the header (browser issue)
- ❌ "Invalid API key": The key doesn't match (check for spaces, typos)

### Test 3: Test with Postman

1. Create new GET request
2. URL: `https://octane-biomech-backend.vercel.app/api/uais/athletes?limit=5`
3. Go to **Headers** tab
4. Add header:
   - Key: `X-API-Key`
   - Value: `your-64-character-key-here`
5. Click **Send**

### Test 4: Verify Header Name

The header name is **case-insensitive** but make sure you're using:
- ✅ `X-API-Key` (recommended)
- ✅ `x-api-key` (also works)
- ❌ `X-Api-Key` (might work, but stick to `X-API-Key`)

---

## Common Issues

### "Missing X-API-Key header" Error

**You're testing in a browser:**
- Browsers cannot send custom headers
- Use curl or Postman instead
- Or install ModHeader browser extension

### "Invalid API key" Error

**The key doesn't match:**

1. **Copy the exact key from Vercel:**
   - Go to Vercel → Settings → Environment Variables
   - Click on `BIOMECH_API_KEYS`
   - Copy the value exactly (no spaces, no quotes)

2. **Verify first/last characters:**
   - Should start with: `aab`
   - Should end with: `843`
   - Total length: 64 characters

3. **Check for hidden characters:**
   - Make sure there are no spaces before/after
   - No quotes around the key
   - No line breaks

4. **Test with a simple key first:**
   - Temporarily set `BIOMECH_API_KEYS` to `test123` in Vercel
   - Redeploy
   - Test: `curl -H "X-API-Key: test123" https://octane-biomech-backend.vercel.app/api/uais/athletes?limit=5`
   - If this works, your original key might have special characters causing issues

---

## What to Share

If it's still not working, share:
1. The exact error message you're getting
2. Whether you're using curl, Postman, or browser
3. The first 6 and last 6 characters of your key (to verify it matches the preview)
