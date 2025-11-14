# Complete Quickstart Guide

Get your Mauj Planner up and running in 10 minutes!

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Clerk account (free)
- A Convex account (free)

---

## 🚀 Step-by-Step Setup

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Set Up Convex

```bash
# Initialize Convex (if not already done)
npx convex dev

# This will:
# - Create a new Convex project
# - Give you a deployment URL
# - Start the development server
```

Copy your Convex deployment URL (looks like `https://your-project.convex.cloud`).

### 3. Set Up Clerk

1. Go to [https://clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Go to **API Keys** in your Clerk dashboard
4. Copy your:
   - Publishable Key (starts with `pk_test_`)
   - Secret Key (starts with `sk_test_`)

### 4. Configure Environment

Create `.env.local` in your project root:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Clerk URLs (use defaults)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 5. Seed Initial Data (Optional)

If you have event data to import:

1. Place CSV files in `public/data/`
2. Start the dev server
3. Navigate to `http://localhost:3000/admin/seed`
4. Click "Import Data"

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the Mauj Planner!

---

## ✅ Verification Checklist

Test these features to ensure everything works:

### Anonymous Features (No Sign-In Required)
- [ ] Browse events in Timeline view
- [ ] Filter events by category, venue, date
- [ ] Search for events
- [ ] View event details in modal
- [ ] Add events to schedule
- [ ] View "My Schedule" tab

### Authenticated Features (Sign In Required)
- [ ] Sign up for an account
- [ ] Sign in successfully
- [ ] See user profile in header
- [ ] Access "AI Planner" button
- [ ] Generate optimized schedule
- [ ] View alternative plans
- [ ] Access "My Plans" page
- [ ] Compare multiple plans
- [ ] Share a schedule
- [ ] Export schedule as image

---

## 🎨 First-Time User Flow

### As an Anonymous User:
1. **Browse** → Filter events → Add favorites to schedule
2. **Explore** → Try different filters and dates
3. **Decide** → Sign up to unlock AI features

### As an Authenticated User:
1. **Click "AI Planner"** in the header
2. **Select preferences**:
   - Categories you like
   - Dates you can attend
   - Any venue preferences
3. **Generate Plans** → Get 3 optimized schedules
4. **Compare** → Go to "My Plans" to see side-by-side
5. **Share** → Generate link or export as image
6. **Enjoy!** → Your perfect festival schedule

---

## 🐛 Troubleshooting

### "Not authenticated" errors
**Fix**: Check your `.env.local` has correct Clerk keys, then restart dev server.

### Events not showing
**Fix**: Make sure you've seeded data at `/admin/seed` or check Convex dashboard.

### Clerk modal doesn't appear
**Fix**: Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_` and is correct.

### Can't generate plans
**Fix**: Sign in with Clerk first. AI Planner requires authentication.

### Convex errors
**Fix**: Run `npx convex dev` in a separate terminal. Keep it running.

---

## 📚 Learn More

### Documentation:
- **FEATURES.md** - Complete feature list
- **AUTH_SETUP.md** - Detailed Clerk setup
- **IMPLEMENTATION_SUMMARY.md** - Technical deep dive
- **DEVELOPER_GUIDE.md** - Development best practices

### Key Features to Try:

#### 1. Smart Filters
Use the sidebar to quickly narrow down events:
- By category (Music, Dance, Theatre)
- By venue (different locations)
- By date (specific festival days)
- By search (artist or event name)

#### 2. AI Planner
Let the algorithm create your perfect schedule:
- Select your favorite categories
- Choose available dates
- Optionally prefer certain venues
- Set max events per day
- Get 3 different optimized plans!

#### 3. Plan Comparison
Can't decide? Compare plans side-by-side:
- Select 2 or more plans
- See metrics: events, scores, types
- Expand to view full details
- Delete plans you don't want

#### 4. Social Sharing
Share your festival plans:
- Generate a unique share link
- Anyone can view (read-only)
- Or export as PNG for social media
- Beautiful, shareable format

---

## 🎯 Pro Tips

### For Festival-Goers:
1. **Start broad** → Use wide filters, then narrow down
2. **Try AI first** → Let the algorithm do the heavy lifting
3. **Compare alternatives** → Don't settle for the first plan
4. **Share with friends** → Coordinate meetups via shared links
5. **Export for offline** → Save PNG to your phone

### For Developers:
1. **Hot reload** → Changes auto-refresh
2. **Convex dashboard** → Monitor real-time data
3. **React DevTools** → Debug component state
4. **TypeScript** → Leverage type safety
5. **Linter** → Run `npm run lint` before committing

---

## 🚀 Ready to Deploy?

### Quick Deploy to Vercel:

```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# Deploy with Vercel CLI
npx vercel

# Or connect your GitHub repo at vercel.com
```

### Production Checklist:
- [ ] Create production Clerk app
- [ ] Deploy Convex to production
- [ ] Set production environment variables
- [ ] Test authentication flow
- [ ] Verify all features work
- [ ] Set up custom domain (optional)

---

## 🎉 You're All Set!

Your Mauj Planner is ready to use. Enjoy planning your perfect festival experience!

### Need Help?
- Check documentation files in the project root
- Review `IMPLEMENTATION_SUMMARY.md` for technical details
- Check Convex and Clerk docs for service-specific issues

### Have Fun!
This planner was built to make festival planning delightful. Experiment, explore, and enjoy! 🎭✨

---

**Happy Planning! 🎊**

