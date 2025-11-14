# Authentication Setup Guide

This guide will help you set up Clerk authentication for the Mauj Planner application.

## Prerequisites

- Node.js and npm installed
- A Clerk account (free tier is sufficient)
- Convex project set up

## Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

## Step 2: Get Your Clerk Keys

1. In your Clerk dashboard, navigate to **API Keys**
2. Copy your:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add the following variables:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key

# Clerk URLs (these can stay as-is for default behavior)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Step 4: Configure Clerk Dashboard

### 1. Application Settings

In your Clerk dashboard:

1. Go to **Settings** → **Paths**
2. Set the following paths:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - Home URL: `/`

### 2. Authentication Options

Configure which sign-in methods you want to enable:

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable your preferred options (Email is recommended for festival apps)
3. Configure social login providers if desired (Google, Facebook, etc.)

## Step 5: Verify Installation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. You should see:
   - A "Sign In" button in the header (when not authenticated)
   - User profile button (when authenticated)

## Step 6: Test Authentication Flow

1. Click "Sign In" in the header
2. Create a new account or sign in with an existing one
3. After signing in, you should:
   - See your user profile in the header
   - Be able to access the AI Planner button
   - Be able to view the My Plans page

## Features Enabled by Authentication

Once authenticated, users can:

### 1. AI Planner
- Generate optimized schedules based on preferences
- Create multiple plan variations
- Save plans for comparison

### 2. Schedule Management
- Save personalized schedules
- Share schedules with others via links
- Export schedules as images

### 3. Plan Comparison
- View all saved plans in the Plans page
- Compare multiple plans side-by-side
- Delete plans they no longer need

## Troubleshooting

### Issue: "Not authenticated" errors

**Solution**: Ensure your `.env.local` file has the correct Clerk keys and restart your dev server.

### Issue: Clerk modal doesn't appear

**Solution**: Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly and starts with `pk_`.

### Issue: Redirect loop after sign-in

**Solution**: Verify your Clerk dashboard paths match the URLs in your `.env.local` file.

### Issue: Can't access protected features

**Solution**: Make sure the Convex auth integration is working by checking your Convex dashboard logs.

## Security Notes

1. **Never commit `.env.local`** to version control
2. Use different Clerk applications for development and production
3. Rotate your secret keys periodically
4. Enable MFA (Multi-Factor Authentication) in production

## Next Steps

Now that authentication is set up, you can:

1. Use the AI Planner to generate optimized schedules
2. Save and compare multiple plans
3. Share your festival schedule with friends
4. Export your schedule as a beautiful image

## Support

For Clerk-specific issues:
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Support](https://clerk.com/support)

For application issues:
- Check the `DEVELOPER_GUIDE.md` for technical details
- Review the Convex console for backend errors

