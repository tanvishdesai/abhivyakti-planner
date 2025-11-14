# 🎭 Mauj Planner

An intelligent event planning web application for the Abhivyakti Cultural Festival, enabling visitors to maximize their festival experience by discovering events, avoiding schedule conflicts, and building personalized itineraries.

![Mauj Planner](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![Convex](https://img.shields.io/badge/Convex-Backend-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## ✨ Features

### 🎯 Smart Event Discovery
- **Timeline View**: Navigate events chronologically with beautiful date-based organization
- **Advanced Filters**: Filter by category (Music, Dance, Theatre), venue, and date
- **Smart Search**: Find events by title or artist name
- **Event Details**: Rich modal views with complete event information

### 📅 Schedule Management
- **Personal Schedule**: Build your custom festival itinerary
- **One-Click Adding**: Heart icon to instantly add/remove events
- **Real-time Sync**: Powered by Convex for instant updates
- **Session-based**: Works without authentication (anonymous users)

### 🎨 Beautiful Design
- Dark mode with glassmorphism effects
- Smooth animations and transitions
- Mobile-first responsive layout
- Category-based color coding

---

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Installation

```bash
# Install dependencies
npm install

# Start Convex backend
npx convex dev

# In another terminal, start Next.js
npm run dev

# Seed database at http://localhost:3000/admin/seed
```

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Convex (real-time database & functions)
- **Styling**: TailwindCSS 4, CVA, clsx
- **State**: Convex React hooks
- **Icons**: Lucide React

### Data Model

```typescript
// Events - Unique events with multiple dates
events {
  title, artist, category, subCategory
  venue, specificVenue
  dates: string[]  // Multiple occurrence dates
  timeSlot: "19:15" | "21:00"
  duration: number
}

// EventInstances - Flattened for scheduling
eventInstances {
  eventId, date, dateObj
  startTime, endTime
  venue, specificVenue
  title, artist, category, subCategory
}

// Schedules - User itineraries
schedules {
  userId | sessionId
  selectedEventInstances: Id[]
  createdAt, updatedAt
}
```

---

## 📂 Project Structure

```
mauj-planner/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main app (Convex-powered)
│   ├── admin/seed/        # Data seeding interface
│   └── layout.tsx         # Root layout + Convex provider
├── components/            # React components
│   ├── Timeline.tsx       # Timeline view
│   ├── EventModal.tsx     # Event details modal
│   ├── EventCard.tsx      # Event card (legacy)
│   └── ui/               # Shadcn-style UI components
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── events.ts         # Event CRUD operations
│   ├── eventInstances.ts # Instance queries
│   ├── schedules.ts      # Schedule management
│   └── seed.ts           # Data import functions
├── lib/                  # Utilities
│   ├── convex-client-provider.tsx
│   ├── use-session.ts    # Session hook
│   └── types.ts          # TypeScript types
└── public/data/          # CSV data files
    └── performances.csv
```

---

## 🎯 Milestones

### ✅ Milestone 1 - Data + Foundations
- [x] Convex schema & functions
- [x] Data seeding from CSV
- [x] Real-time queries
- [x] Event filtering

### ✅ Milestone 2 - Timeline & Scheduling
- [x] Timeline component with date navigation
- [x] Event details modal
- [x] Schedule add/remove
- [x] Personal schedule view
- [x] Mobile responsive design

### 🚧 Milestone 3 - Intelligent Planner (Upcoming)
- [ ] Preference-based planning wizard
- [ ] Interval scheduling algorithm
- [ ] Multi-category optimization
- [ ] Venue-transition constraints
- [ ] Alternative plan suggestions

### 🔮 Milestone 4 - Polish & Sharing
- [ ] Shareable schedule links
- [ ] Export to image/PDF
- [ ] PWA support
- [ ] User authentication (Clerk)
- [ ] Enhanced animations

---

## 🎨 Design Philosophy

The Mauj Planner embraces a **dark, sophisticated aesthetic** inspired by:
- Festival night vibes with ambient gradients
- Glass morphism for depth and hierarchy
- Category-coded colors for quick visual parsing
- Smooth micro-interactions for delight

---

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm/pnpm
- Convex account (free tier works great)

### Local Development

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev

# Terminal 3: TypeScript checking (optional)
npm run build
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## 📊 Data Import

The app supports CSV import for event data:

1. Place CSV in `public/data/performances.csv`
2. Visit `/admin/seed`
3. Click "Seed Database"
4. Events are deduplicated and instances created

**CSV Format:**
```csv
Event_ID,Category,Sub_Category,Event_Name,Venue,City,Date,Time,Duration_Minutes,Description
```

---

## 🤝 Contributing

This is a festival-specific project, but feel free to fork and adapt for your own events!

### Key Areas for Contribution
- Performance optimizations
- Additional filter types
- Export formats
- Mobile app wrapper
- Analytics dashboard

---

## 📝 License

MIT License - feel free to use this for your own cultural festivals!

---

## 🙏 Acknowledgments

- Built with ❤️ for the Abhivyakti Cultural Festival
- Powered by [Convex](https://convex.dev) for real-time magic
- UI components inspired by [shadcn/ui](https://ui.shadcn.com)

---

## 📧 Contact

For questions about the Mauj Planner:
- Open an issue on GitHub
- Check [Planning.md](./Plannning.md) for architecture details
- Review [Tasks.md](./Tasks.md) for current progress

---

**🎭 Plan smart. Experience more. Mauj Planner.**
