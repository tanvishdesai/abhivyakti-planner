# Abhivyakti Planner — TASK.md

A living task board tracking all current work, active items, bugs, backlog, and discoveries.

---

# ✅ Active Tasks (In Progress)

* [x] Import cleaned CSV data into Convex
* [x] Build Convex schema: events, eventInstances, schedules, users
* [x] Write data-import script (Next.js → Convex mutation)
* [x] Generate eventInstances for each occurrence (flattening logic)
* [x] Timeline UI base (horizontal scroll + day grouping)
* [x] Implement category + venue filters
* [x] Basic event card + modal component
* [x] Set up "My Schedule" state using Convex
* [ ] Set up user auth (Convex Auth + Clerk) - **Deferred to Milestone 4**

---

# 🚀 Milestone 1 — Data + Foundations ✅ COMPLETED

### Goal: App displays all events dynamically from Convex

* [x] Create `events` table
* [x] Create `eventInstances` table
* [x] Create admin-only data loading route
* [x] Validate timeSlot → actual datetime generation
* [x] Render events in Explore page
* [x] Add filters (category/venue/date)

**✅ Deliverable Completed:** Working event explorer connected to Convex with real-time data sync.

---

# 🚀 Milestone 2 — Timeline & Scheduling ✅ COMPLETED

### Goal: Users can visually browse by day and time

* [x] Build timeline layout component
* [x] Position eventInstances based on date/time
* [x] Mobile-horizontal scrolling support
* [x] Event details modal
* [x] Add "Add to Schedule" backend mutation
* [x] Render user's personal schedule

**✅ Deliverable Completed:** Functional timeline + manual scheduling with beautiful UI.

---

# 🚀 Milestone 3 — Intelligent Planner (Core Feature) ✅ COMPLETED

### Goal: Auto-generate optimized schedule

* [x] Build planner preferences UI (categories, available days)
* [x] Implement interval scheduling (greedy algorithm)
* [x] Add category-weight scoring
* [x] Apply venue-switch restriction check
* [x] Return optimized list of eventInstances
* [x] Provide 2–3 alternative plan variations
* [x] Save planner output into MySchedule

**✅ Deliverable Completed:** Working intelligent planning engine with greedy interval scheduling, category weighting, and alternative plan generation.

---

# 🚀 Milestone 4 — UX Polish & Sharing ✅ COMPLETED

* [x] Improve modal design + animations (Framer Motion)
* [x] Create shareable schedule link
* [x] Add export-to-image functionality (html2canvas)
* [x] Add ability to compare multiple plan options
* [x] Set up Clerk authentication
* [x] Create Plans comparison page
* [x] Add share and export buttons to schedule view

**✅ Deliverable Completed:** Public-ready version with full authentication, sharing, export, and comparison features.

---

# 🐞 Bugs / Issues (To Track)

* [ ] Timeline overlapping on narrow screens
* [ ] Event card overflow on multiple-day shows
* [ ] Rendering performance drops with many events
* [ ] Venue-switch times not properly validated yet

---

# 📥 Backlog (Future Work)

* [ ] Add map + walking time UI between venues
* [ ] Add AI event recommendation system
* [ ] Add heatmap showing popular events
* [ ] Social features: friend planning sync
* [ ] Admin dashboard for organizers
* [ ] Live updates during festival

---

# ❗ Discoveries (Notes During Development)

* Time slots are fixed (7:15 PM, 9:00 PM) → simplifies scheduling
* Shows repeat on different days, but never across venues
* EventInstances table is crucial for simplicity
* Greedy interval scheduling is enough for v1 planner
* Convex should handle live updates easily
* Clerk integration with Convex works seamlessly via ConvexProviderWithClerk
* Framer Motion significantly improves modal UX with smooth animations
* html2canvas enables easy schedule export without backend rendering
* Share tokens provide secure public sharing without complex permissions

---

# 🏁 Completed

## Milestone 1 - Data + Foundations ✅
- Created comprehensive Convex schema (events, eventInstances, schedules, users)
- Built complete CRUD operations for all entities
- Implemented data seeding script with CSV import
- Created admin interface at `/admin/seed`
- Integrated Convex provider with Next.js app
- Set up real-time queries and mutations

## Milestone 2 - Timeline & Scheduling ✅
- Built Timeline component with date navigation
- Implemented horizontal date scrolling
- Created Event Details Modal with rich information
- Added schedule management (add/remove events)
- Integrated personal schedule rendering
- Implemented session-based anonymous user support
- Mobile-responsive design throughout
- Filter system with category, venue, date, and search

## Milestone 3 - Intelligent Planner ✅
- Implemented greedy interval scheduling algorithm
- Category-based preference weighting system
- Venue switch feasibility checking (15-min buffer)
- Max events per day constraint
- Alternative plan generation (2-3 variations)
- Saved plans with scoring system
- Real-time plan generation with loading states

## Milestone 4 - UX Polish & Sharing ✅
- Clerk authentication integrated with Convex
- User profile management with UserButton
- Framer Motion animations on modals
- Share schedule functionality with unique tokens
- Public shared schedule viewing page
- Export to image (PNG) using html2canvas
- Plan comparison page with side-by-side view
- Multi-plan selection and comparison UI
- Delete saved plans functionality

## Technical Achievements
- TypeScript throughout with full type safety
- Real-time data synchronization via Convex
- Glassmorphism dark theme design
- Optimized performance with React hooks
- Proper state management with Convex React
- Session persistence via localStorage
- CSV import with deduplication logic
- Clerk authentication with JWT-based security
- Convex-Clerk integration for authenticated mutations
- Framer Motion for smooth animations
- html2canvas for client-side image export
- Server-side rendering with Next.js 16
- Responsive design for mobile and desktop
