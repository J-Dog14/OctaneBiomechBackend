# Pre-Integration Checklist

Before integrating with the Octane app, complete these steps:

## ✅ 1. Testing

- [ ] Test all endpoints in Postman/Thunder Client
- [ ] Verify API key authentication works
- [ ] Test with real athlete UUIDs from your database
- [ ] Verify error handling (invalid UUIDs, missing data, etc.)
- [ ] Check that all Decimal values convert to numbers correctly

**Quick Test Script:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test authenticated endpoint
curl -H "X-API-Key: your-key" \
  http://localhost:3000/api/uais/athletes?limit=5
```

---

## ✅ 2. CORS Configuration

**If Octane app is on a different domain**, add CORS headers:

**Option A: Add to `next.config.js`** (if needed for browser requests - but you said server-to-server only)
```js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://octane-app-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-API-Key, Content-Type' },
        ],
      },
    ];
  },
};
```

**Note:** Since you're doing server-to-server calls, CORS shouldn't be needed. Only add this if Octane makes browser requests.

---

## ✅ 3. Environment Variables (Production)

Set these in your Vercel deployment:

- [ ] `DATABASE_URL` - Production Neon connection string (preferably read-only)
- [ ] `BIOMECH_API_KEYS` - Comma-separated production API keys
- [ ] `NODE_ENV=production` (set automatically by Vercel)

**Security:**
- [ ] Use read-only database credentials if possible
- [ ] Generate strong API keys (use a secure random generator)
- [ ] Never commit API keys to git

---

## ✅ 4. Deployment

- [ ] Deploy to Vercel (or your hosting platform)
- [ ] Verify production URL works: `https://your-api.vercel.app/api/health`
- [ ] Test production endpoints with API key
- [ ] Set up custom domain (optional but recommended)

---

## ✅ 5. API Documentation

- [ ] Share `API_ENDPOINTS_REFERENCE.md` with Octane team
- [ ] Document any Octane-specific requirements
- [ ] Provide example requests/responses

---

## ✅ 6. Error Handling

Verify consistent error responses:
- [ ] Missing API key → 401
- [ ] Invalid API key → 401
- [ ] Invalid UUID → 400
- [ ] Athlete not found → 404 (or null in response)
- [ ] Database errors → 500

---

## ✅ 7. Performance Considerations

- [ ] Test endpoint response times (should be < 500ms for most)
- [ ] Consider adding response caching if needed
- [ ] Monitor database query performance

---

## ✅ 8. Logging & Monitoring

- [ ] Set up error logging (Vercel logs, Sentry, etc.)
- [ ] Monitor API usage/rate limits
- [ ] Set up alerts for 500 errors

---

## ✅ 9. Octane Integration Setup

**In Octane app, you'll need:**

1. **Environment Variables:**
   ```
   BIOMECH_API_BASE_URL=https://your-api.vercel.app
   BIOMECH_API_KEY=your-production-key
   ```

2. **API Client Setup:**
   ```typescript
   // Example fetch helper
   async function fetchBiomechData(endpoint: string, athleteUuid: string) {
     const response = await fetch(
       `${process.env.BIOMECH_API_BASE_URL}${endpoint}?athleteUuid=${athleteUuid}`,
       {
         headers: {
           'X-API-Key': process.env.BIOMECH_API_KEY!,
         },
       }
     );
     if (!response.ok) throw new Error(`API error: ${response.status}`);
     return response.json();
   }
   ```

3. **UUID Mapping:**
   - Ensure Octane athlete UUIDs match `d_athletes.athlete_uuid` or use `app_db_uuid` mapping

---

## ✅ 10. Rate Limiting (Optional but Recommended)

Consider adding rate limiting for production:

```typescript
// Example with Upstash Redis
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
});
```

---

## ✅ 11. Final Verification

Before going live:

- [ ] All endpoints tested with real data
- [ ] Production environment variables set
- [ ] API keys rotated/secure
- [ ] Error handling verified
- [ ] Documentation shared with Octane team
- [ ] Monitoring/logging in place

---

## Quick Start for Octane Integration

1. **Get production API URL and key**
2. **Test connectivity:**
   ```bash
   curl -H "X-API-Key: <key>" \
     https://your-api.vercel.app/api/health
   ```
3. **Test athlete endpoint:**
   ```bash
   curl -H "X-API-Key: <key>" \
     "https://your-api.vercel.app/api/uais/athletes?limit=5"
   ```
4. **Integrate in Octane app using the API client pattern above**

---

## Support

If you encounter issues:
1. Check Vercel logs for errors
2. Verify environment variables are set
3. Test endpoints individually in Postman
4. Check database connectivity
