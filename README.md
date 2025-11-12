# 🎭 Mauj Planner - Cultural Events Organizer

A beautiful, modern personal planner web application for organizing and managing cultural festival events. Built with Next.js, React, and shadcn UI components.

![Mauj Planner](https://img.shields.io/badge/Mauj%20Planner-v1.0-amber?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 📋 Core Features
- **Event Browsing**: Browse all cultural events with detailed information
- **Smart Filtering**: Filter by category (Dance, Theatre, Music), venue, date, and artist
- **My Schedule**: Create and manage your personal event schedule
- **Combo Finder**: Discover days where you can attend multiple events (intelligent scheduling)
- **Advanced Statistics**: Visualize event distribution and planning insights
- **Export to CSV**: Download your schedule for offline reference

### 🎯 Advanced Features
- **Combo Day Detection**: Automatically finds event combinations on the same day
- **Travel Time Estimation**: Considers venue proximity when suggesting combos
- **Real-time Search**: Search for events by name, artist, or category
- **Wishlist Management**: Add/remove events from your personal schedule with one click
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode by Default**: Eye-friendly dark theme enabled by default

### 📊 Statistics & Insights
- Total events overview
- Events by category breakdown
- Events per venue
- Busiest days indicator
- Artist count tracking
- Selection status tracking

## 🎨 User Interface

### Modern, Minimalist Design
- **Dark Theme**: Sleek black background with slate accents
- **Accent Colors**: Amber highlights for selections and interactions
- **Category Colors**:
  - 🟣 Dance: Purple accents
  - 🟠 Theatre: Orange accents
  - 🔵 Music: Blue accents

### Responsive Layout
- **Desktop**: Side-by-side layout with filters on the left
- **Mobile**: Collapsible sidebar with hamburger menu
- **Tablet**: Optimized grid layout

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
cd mauj-planner
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
mauj-planner/
├── app/
│   ├── layout.tsx          # Root layout with dark mode
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
│
├── components/
│   ├── ui/                 # shadcn UI components
│   │   ├── badge.tsx       # Badge component
│   │   ├── button.tsx      # Button component
│   │   ├── card.tsx        # Card component
│   │   └── ...
│   ├── EventCard.tsx       # Individual event card component
│   ├── EventFilters.tsx    # Filter controls
│   ├── ComboFinder.tsx     # Combo day finder
│   ├── MySchedule.tsx      # Personal schedule view
│   ├── Statistics.tsx      # Stats and insights
│   └── Tabs.tsx            # Tab navigation
│
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   ├── utils.ts            # Utility functions
│   ├── store.ts            # Zustand state management
│   └── data.ts             # Data loading utilities
│
├── public/
│   └── data/
│       ├── performances.csv # Main events data
│       └── exhibition.csv   # Exhibition data
│
└── package.json            # Dependencies and scripts
```

## 🎮 How to Use

### 1. Browse Events
- Start from the **Browse** tab to see all available events
- Events are displayed as cards with all essential information

### 2. Filter Events
Use the left sidebar to narrow down:
- **Search Bar**: Quick search by event name or artist
- **Category Filter**: Dance, Theatre, or Music
- **Venue Filter**: Choose specific venues
- **Date Filter**: Select specific dates

### 3. Add to Your Schedule
- Click the **heart icon** on any event card to add it to your schedule
- The selected count updates in the header

### 4. Find Combo Days
- Visit the **Combos** tab to see intelligent combo suggestions
- System automatically finds which events can be attended on the same day
- Travel time between venues is calculated
- Click hearts to add suggested events to your schedule

### 5. View Your Schedule
- Go to the **Schedule** tab to see all your selected events
- Events are grouped by date and sorted by time
- Click the trash icon to remove an event
- **Export** button to download your schedule as CSV

### 6. Analyze Statistics
- Visit **Stats** tab for detailed insights:
  - Total events and selected count
  - Events distribution by category and venue
  - Busiest dates
  - Number of unique artists

## 🔄 How Combo Days Work

The Combo Finder uses intelligent algorithms to find events you can realistically attend in one day:

1. **Same Date Filter**: Only considers events on the same date
2. **Time Calculation**: Checks if events don't overlap
3. **Travel Time**: Estimates time needed to travel between venues:
   - Same venue: 0 minutes
   - Different venues: 15-25 minutes
4. **Performance Duration**: Assumes each performance is ~60 minutes

**Example Combo:**
```
Event 1: 7:15 PM at Gujarat University
Event 2: 8:30 PM at ATIRA (15 min travel)
✅ Combo is POSSIBLE (enough time between events)
```

## 📊 Data Format

### Performances CSV
```csv
Event Name,Artist/Group,Category,Sub-Category,Date,Time,Main Venue,Specific Venue
The Blue Hour,Ritu Changlani,Dance,Contemporary,14-Nov-2025,7:15 PM,Gujarat University,Amphi - GU
```

### Exhibition CSV
```csv
Category,Main Venue,Start Time,Featured Artists
Visual Arts,Gujarat University,5:00 PM,"Artist1, Artist2, ..."
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **React Version**: 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom shadcn implementation
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 🎨 Customization

### Modify Travel Times
Edit `lib/utils.ts` - `calculateTravelTime` function:
```typescript
const travelTimes: Record<string, Record<string, number>> = {
  "Venue A": {
    "Venue B": 20, // Custom travel time in minutes
  },
};
```

### Change Color Scheme
Edit `components/ui/badge.tsx` to modify category colors:
```typescript
dance: "border-transparent bg-purple-500/10 text-purple-700",
theatre: "border-transparent bg-orange-500/10 text-orange-700",
music: "border-transparent bg-blue-500/10 text-blue-700",
```

### Adjust Performance Duration
Edit `lib/utils.ts` - `canAttendBoth` function:
```typescript
const performanceDuration = 60; // Change this value (in minutes)
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (single column, collapsed sidebar)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (sidebar + content grid)

## 🚀 Performance Optimizations

- Memoized computations for filtering and combos
- Efficient CSV parsing
- Client-side state management with Zustand
- No unnecessary re-renders with React hooks

## 🐛 Troubleshooting

### Events Not Loading
- Check if CSV files exist in `public/data/`
- Verify CSV format matches the expected structure
- Check browser console for error messages

### Combo Days Not Showing
- Ensure events have proper dates and times
- Check travel time calculations between venues
- Verify performance duration assumption

### Styling Issues
- Clear browser cache
- Rebuild the project: `npm run build`
- Check Tailwind CSS is properly configured

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with ❤️ for cultural enthusiasts
- Inspired by modern UX/UI principles
- Designed for meaningful cultural experiences

## 📧 Contact & Support

For issues, feature requests, or suggestions, please create an issue or contact the development team.

---

**Made with 🎭 for the Mauj Festival**
