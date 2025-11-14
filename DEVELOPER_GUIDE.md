# Developer Guide - Mauj Planner

## 🎯 Quick Reference for Developers

### Starting Development

```bash
# Terminal 1 - Start Convex (MUST be running)
npx convex dev

# Terminal 2 - Start Next.js
npm run dev

# Terminal 3 - (Optional) Watch types
npm run build -- --watch
```

---

## 🗂️ Key Files & Their Purpose

### Frontend Entry Points
- **`app/page.tsx`** - Main application (Convex-powered)
- **`app/layout.tsx`** - Root layout with Convex provider
- **`app/admin/seed/page.tsx`** - Data seeding interface

### Components
- **`components/Timeline.tsx`** - Timeline view with date navigation
- **`components/EventModal.tsx`** - Event details popup
- **`components/EventCard.tsx`** - Individual event card (legacy)
- **`components/EventFilters.tsx`** - Filter sidebar (legacy)

### Convex Backend
- **`convex/schema.ts`** - Database tables definition
- **`convex/events.ts`** - Event CRUD operations
- **`convex/eventInstances.ts`** - Event instance queries
- **`convex/schedules.ts`** - User schedule management
- **`convex/seed.ts`** - Data import/seeding

### Utilities
- **`lib/convex-client-provider.tsx`** - Convex React wrapper
- **`lib/use-session.ts`** - Anonymous session management
- **`lib/types.ts`** - TypeScript type definitions
- **`lib/store.ts`** - Zustand store (legacy, not used in new version)

---

## 📊 Data Flow

```
CSV Files (public/data/)
    ↓
Seed Script (/admin/seed)
    ↓
Convex Database (events, eventInstances)
    ↓
React Queries (useQuery hooks)
    ↓
UI Components (Timeline, Modal)
    ↓
User Interactions (Heart button)
    ↓
Convex Mutations (toggleEvent)
    ↓
Schedules Table
    ↓
My Schedule View
```

---

## 🔧 Common Development Tasks

### Adding a New Filter

1. **Add filter state in `app/page.tsx`:**
```typescript
const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
```

2. **Update filter logic:**
```typescript
const filteredInstances = useMemo(() => {
  return allInstances.filter((instance) => {
    // Add your filter condition
    const matchSubCategory = !selectedSubCategory || 
      instance.subCategory === selectedSubCategory;
    return matchCategory && matchVenue && matchSubCategory;
  });
}, [allInstances, selectedSubCategory]);
```

3. **Add UI in filter sidebar:**
```tsx
<FilterChip
  active={selectedSubCategory === 'value'}
  onClick={() => setSelectedSubCategory('value')}
>
  Label
</FilterChip>
```

### Creating a New Convex Query

1. **Define in appropriate file** (e.g., `convex/events.ts`):
```typescript
export const getByArtist = query({
  args: { artist: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("artist"), args.artist))
      .collect();
  },
});
```

2. **Use in React component:**
```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const events = useQuery(api.events.getByArtist, { artist: "Artist Name" });
```

### Adding a New Mutation

1. **Define in Convex** (e.g., `convex/schedules.ts`):
```typescript
export const clearSchedule = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const schedule = await ctx.db
      .query("schedules")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
    
    if (schedule) {
      await ctx.db.patch(schedule._id, {
        selectedEventInstances: [],
        updatedAt: Date.now(),
      });
    }
  },
});
```

2. **Use in React:**
```typescript
const clearScheduleMutation = useMutation(api.schedules.clearSchedule);

const handleClear = () => {
  clearScheduleMutation({ sessionId });
};
```

---

## 🎨 Styling Guidelines

### Color Palette
```typescript
// Primary Colors
amber-500    // Main accent
slate-50     // Text primary
slate-400    // Text secondary

// Category Colors
purple-500   // Dance
amber-500    // Theatre  
sky-500      // Music

// Background
slate-950    // Base
white/5      // Cards (5% opacity)
white/10     // Borders (10% opacity)
```

### Component Patterns
```tsx
// Card with glassmorphism
<Card className="border-white/10 bg-white/5 backdrop-blur">
  {/* content */}
</Card>

// Filter chip (active state)
<button className={cn(
  "rounded-full border px-3.5 py-1.5 text-xs font-semibold",
  active 
    ? "border-amber-300/60 bg-amber-400/15 text-amber-100"
    : "border-white/10 bg-white/5 text-slate-300"
)}>
  {label}
</button>
```

---

## 🧪 Testing Workflows

### Testing Data Seeding
1. Go to `/admin/seed`
2. Click "Seed Database"
3. Check status - should show events created
4. Open Convex dashboard to verify data
5. Return to main page - events should load

### Testing Schedule Management
1. Find an event on timeline
2. Click heart icon → should turn amber
3. Switch to "My Schedule" tab
4. Event should appear
5. Click heart again → should remove
6. Refresh page → schedule persists

### Testing Filters
1. Select a category filter
2. Event count should update
3. Timeline should show only matching events
4. Clear filters → all events return
5. Try combining multiple filters

---

## 🔍 Debugging Tips

### Convex Dev Not Working
```bash
# Kill any running Convex processes
npx convex dev --kill-all

# Restart
npx convex dev
```

### Types Not Generating
```bash
# Convex generates types on save
# Make sure convex dev is running
# Try restarting it if types aren't updating
```

### Schedule Not Persisting
- Check browser console for session ID
- Verify `localStorage.getItem('mauj_session_id')` exists
- Check Convex dashboard → schedules table

### Events Not Loading
- Verify Convex URL in `.env.local`
- Check database has data (Convex dashboard)
- Look for console errors
- Verify `useQuery` hooks are not returning null

---

## 📦 Build & Deploy

### Building for Production

```bash
# Build Next.js
npm run build

# Deploy Convex (if needed)
npx convex deploy

# Start production server
npm start
```

### Environment Variables for Production

```bash
# Required
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Optional (for future auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
```

---

## 🚀 Performance Tips

### Optimizing Queries
```typescript
// ✅ Good - Index-based query
.withIndex("by_date", (q) => q.eq("date", selectedDate))

// ❌ Bad - Full table scan
.filter((q) => q.eq(q.field("date"), selectedDate))
```

### Memo Usage
```typescript
// Memoize expensive computations
const filteredEvents = useMemo(() => {
  return events.filter(/* ... */);
}, [events, filters]);
```

### Avoiding Re-renders
```typescript
// Use callbacks for event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

---

## 📚 Useful Convex Patterns

### Conditional Queries
```typescript
const data = useQuery(
  api.schedules.get,
  sessionId ? { sessionId } : "skip"
);
```

### Batch Reads
```typescript
const events = await Promise.all(
  ids.map((id) => ctx.db.get(id))
);
```

### Transactions (Future)
```typescript
// Convex handles atomicity automatically
// Multiple writes in a mutation are atomic
```

---

## 🐛 Known Issues & Workarounds

### Issue: Session not initializing on first load
**Workaround**: Check `useSession` hook - adds small delay for localStorage

### Issue: Types out of sync
**Solution**: Restart `npx convex dev`

### Issue: Filter state not clearing
**Solution**: Ensure all filter state is reset in `clearFilters()`

---

## 📞 Getting Help

- Check Convex logs: `npx convex dashboard`
- Review browser console for errors
- Verify `.env.local` configuration
- Check network tab for failed requests

---

## 🎯 Next Features to Implement

### Priority High
- [ ] Smart planner algorithm (Milestone 3)
- [ ] User authentication (Clerk)
- [ ] Shareable schedule links

### Priority Medium
- [ ] Export to PDF
- [ ] Conflict detection UI
- [ ] Venue map integration

### Priority Low
- [ ] PWA support
- [ ] Dark/Light mode toggle
- [ ] Animation enhancements

---

**Happy coding! 🎭**

