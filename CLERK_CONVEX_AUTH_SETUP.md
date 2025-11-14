# Fixing Clerk + Convex Authentication

## Problem
You're getting "Not authenticated" error because the JWT authentication between Clerk and Convex is not properly configured.

## Solution Steps

### Step 1: Find Your Clerk Issuer URL

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to **API Keys** (in the sidebar)
4. Look for your **Frontend API** URL - it should look like:
   - `https://xxxxx.clerk.accounts.dev` OR
   - `https://clerk.yourdomain.com` (if custom domain)

This is your **domain** value for convex.json.

### Step 2: Create JWT Template in Clerk

1. In Clerk Dashboard, go to **JWT Templates** (sidebar under "Developers")
2. Click **"+ New Template"**
3. Select **"Convex"** from the pre-built templates
4. Name it: `convex` (this will be your applicationID)
5. The template should have these settings:
   - **Token Lifetime**: 3600 seconds (1 hour) - default is fine
   - **Claims**: Should include the default Convex claims
   - **Issuer**: This should automatically match your Frontend API URL
6. Click **"Save"**
7. **IMPORTANT**: Copy the **Issuer** value shown (you'll need this for convex.json)

### Step 3: Update convex.json

Open `convex.json` and replace `YOUR_CLERK_DOMAIN.clerk.accounts.dev` with your actual issuer URL:

```json
{
  "node": {
    "version": "18"
  },
  "authProviders": [
    {
      "domain": "https://your-actual-domain.clerk.accounts.dev",
      "applicationID": "convex"
    }
  ]
}
```

**Important Notes:**
- `domain` = Your Clerk issuer URL (from Step 1 or the JWT template)
- `applicationID` = The name of your JWT template (default: "convex")
- Make sure there's NO trailing slash in the domain
- The domain must match EXACTLY what's in your JWT template's issuer field

### Step 4: Update Environment Variables in Convex Dashboard

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Make sure these are set:
   - `CLERK_HOSTNAME` = Your Clerk Frontend API hostname (e.g., `xxxxx.clerk.accounts.dev`)
   - Any other Clerk-related variables you might need

### Step 5: Deploy Changes

After updating `convex.json`, you need to deploy:

```bash
npx convex deploy
```

### Step 6: Test

1. Clear your browser cache or use incognito mode
2. Sign out and sign back in to your app
3. Try using the AI Planner feature again

## Common Issues

### Issue 1: Still getting "Not authenticated"
- **Check**: Make sure the domain in `convex.json` EXACTLY matches the issuer in your JWT template
- **Check**: Ensure you've deployed the changes with `npx convex deploy`
- **Check**: Try signing out and back in

### Issue 2: "Invalid token" error
- **Check**: The JWT template name in Clerk matches the `applicationID` in convex.json
- **Check**: Token hasn't expired (default is 1 hour)

### Issue 3: CORS errors
- **Check**: Your Clerk Frontend API URL is correct
- **Check**: The domain in convex.json doesn't have a trailing slash

## How to Find Your Exact Values

### Method 1: From Clerk Dashboard
1. Clerk Dashboard → API Keys
2. Look for "Frontend API" - copy the URL

### Method 2: From Environment Variables
If you have `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, your domain is embedded in it:
- Key format: `pk_test_xxxxx` or `pk_live_xxxxx`
- The domain can be found in Clerk Dashboard under API Keys

### Method 3: From JWT Template
1. Clerk Dashboard → JWT Templates
2. Open your Convex template
3. Look at the "Issuer" field - that's your domain

## Example Configuration

Here's an example of what your `convex.json` should look like (with fake values):

```json
{
  "node": {
    "version": "18"
  },
  "authProviders": [
    {
      "domain": "https://magical-penguin-99.clerk.accounts.dev",
      "applicationID": "convex"
    }
  ]
}
```

## Verification Checklist

- [ ] JWT Template created in Clerk Dashboard
- [ ] JWT Template named "convex" (or matching your applicationID)
- [ ] Domain in convex.json matches Clerk issuer URL exactly
- [ ] No trailing slash in domain
- [ ] Deployed changes with `npx convex deploy`
- [ ] Signed out and back in
- [ ] Cleared browser cache

## Still Not Working?

If you're still having issues:

1. Check the browser console for any JWT-related errors
2. Verify your Clerk Publishable Key is correct in `.env.local`
3. Make sure ConvexProvider is properly wrapped with ClerkProvider (already done in your code)
4. Check Convex logs in the dashboard for more specific error messages

## Quick Fix Command Sequence

```bash
# After updating convex.json with correct domain:
npx convex deploy

# Then in your browser:
# - Sign out
# - Clear cache (Ctrl+Shift+Del or Cmd+Shift+Del)
# - Sign back in
# - Try AI Planner again
```

