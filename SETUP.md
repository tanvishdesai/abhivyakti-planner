# Mauj Planner - Setup Guide

## 🚀 Quick Start

This guide will help you set up the Mauj Planner application with Convex backend.

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Convex

1. **Initialize Convex development environment:**

```bash
npx convex dev
```

This will:
- Create a new Convex project (if needed)
- Generate a `NEXT_PUBLIC_CONVEX_URL`
- Start watching your Convex functions for changes
- Open the Convex dashboard

2. **Create `.env.local` file:**

Copy the Convex URL from the terminal output:

```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
```

### Step 3: Seed the Database

1. **Keep Convex dev running** in one terminal
2. **In a new terminal**, start the Next.js dev server:

```bash
npm run dev
```

3. **Navigate to the seeding page:**

```
http://localhost:3000/admin/seed
```

4. **Click "Seed Database"** to import all event data from CSV files into Convex

5. **Verify** by clicking "Check Status" - you should see:
   - Events created
   - Event instances generated
   - Ready to use!

### Step 4: Use the App

Navigate to the main page:

```
http://localhost:3000
```

You should now see:
- ✅ All events loaded from Convex
- ✅ Timeline view with date navigation
- ✅ Filters working (category, venue, date)
- ✅ Add events to your schedule
- ✅ View your personalized schedule

---

## 📁 Project Structure

```
mauj-planner/
├── app/
│   ├── admin/seed/          # Data seeding admin page
│   ├── page.tsx             # Main app (Convex-powered)
│   ├── page-old.tsx         # Old CSV-based version (backup)
│   └── layout.tsx           # Root layout with Convex provider
├── components/
│   ├── Timeline.tsx         # Timeline view component
│   ├── EventModal.tsx       # Event details modal
│   ├── EventCard.tsx        # Event card component
│   ├── EventFilters.tsx     # Filter sidebar
│   ├── MySchedule.tsx       # Schedule view
│   └── ui/                  # UI components
├── convex/
│   ├── schema.ts            # Database schema
│   ├── events.ts            # Event queries/mutations
│   ├── eventInstances.ts    # Event instance queries
│   ├── schedules.ts         # Schedule management
│   ├── seed.ts              # Data seeding functions
│   └── http.ts              # HTTP endpoints
├── lib/
│   ├── convex-client-provider.tsx  # Convex React provider
│   ├── use-session.ts       # Session management hook
│   ├── types.ts             # TypeScript types
│   ├── data.ts              # CSV loading utilities
│   └── store.ts             # Zustand store (legacy)
└── public/data/
    ├── performances.csv     # Event data
    └── exhibition.csv       # Exhibition data
```

---

## 🗄️ Database Schema

### Events Table
Stores unique events with multiple dates:
- `title`, `artist`, `category`, `subCategory`
- `venue`, `specificVenue`
- `dates[]` - array of dates this event occurs
- `timeSlot` - "19:15" or "21:00"
- `duration` - default 75 minutes

### EventInstances Table
Flattened occurrences for scheduling:
- `eventId` - reference to events table
- `date`, `dateObj` (timestamp)
- `startTime`, `endTime`
- `venue`, `specificVenue`
- Denormalized: `title`, `artist`, `category`, `subCategory`

### Schedules Table
User schedules:
- `userId` or `sessionId` (for anonymous users)
- `selectedEventInstances[]` - array of event instance IDs
- `createdAt`, `updatedAt`

---

## 🎯 Milestones Completed

### ✅ Milestone 1 - Data + Foundations
- [x] Created Convex schema (events, eventInstances, schedules, users)
- [x] Built Convex queries and mutations
- [x] Integrated Convex provider with Next.js
- [x] Created data seeding script
- [x] Updated app to use Convex instead of CSV

### ✅ Milestone 2 - Timeline & Scheduling
- [x] Built Timeline component with date navigation
- [x] Implemented horizontal date scrolling
- [x] Created Event Details Modal
- [x] Added schedule mutations (add/remove events)
- [x] Integrated personal schedule rendering
- [x] Mobile-responsive design

---

## 🎨 Features

### Event Discovery
- **Timeline View**: Navigate events by date with visual timeline
- **Filters**: Category, Venue, Date, and Search
- **Event Cards**: Rich event information with artist, time, venue
- **Event Modal**: Detailed view with all event information

### Schedule Management
- **Add to Schedule**: Click heart icon on any event
- **My Schedule Tab**: View all selected events in timeline format
- **Persistent**: Uses Convex for real-time sync across devices
- **Session-based**: Works without authentication (anonymous users)

### User Experience
- Dark mode design with glassmorphism effects
- Smooth transitions and animations
- Mobile-first responsive layout
- Fast performance with Convex real-time queries

---

## 🔧 Development

### Running Convex Dev Mode

Always keep this running while developing:

```bash
npx convex dev
```

This watches your Convex functions and automatically deploys changes.

### Running Next.js Dev Server

```bash
npm run dev
```

### Viewing Convex Dashboard

```bash
npx convex dashboard
```

Or visit the URL shown in `npx convex dev` output.

---

## 📝 Next Steps (Milestone 3+)

### Milestone 3 - Intelligent Planner
- [ ] Build planner preferences UI
- [ ] Implement interval scheduling algorithm
- [ ] Add category-weight scoring
- [ ] Apply venue-switch restriction check
- [ ] Provide multiple plan variations

### Milestone 4 - Polish & Sharing
- [ ] Improve animations
- [ ] Create shareable schedule links
- [ ] Add export-to-image
- [ ] PWA support
- [ ] Authentication (Clerk/Convex Auth)

---

## 🐛 Troubleshooting

### "Cannot find module '@/convex/_generated/api'"

**Solution**: Make sure `npx convex dev` is running. It generates the API types automatically.

### Events not loading

**Solution**:
1. Check that `.env.local` has correct `NEXT_PUBLIC_CONVEX_URL`
2. Verify Convex dev server is running
3. Make sure you've seeded the database via `/admin/seed`

### Session not persisting

**Solution**: Check browser localStorage is enabled. Session ID is stored in `mauj_session_id`.

---

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

## 🎉 Success!

You now have a fully functional event planning application powered by Convex! 

🎭 Happy planning!

