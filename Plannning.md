# Abhivyakti Planner — PLANNING.md

## 🎯 Purpose

Create an intelligent event‑planning web application for the Abhivyakti Cultural Festival, enabling visitors to:

* Maximize the number of shows they can attend
* Avoid schedule conflicts
* Explore events by category, venue, artist
* Build and save personalized itineraries
* Understand venue distances and feasible transitions

The website should serve as an intuitive festival companion — **like Google Calendar + Ticketmaster planning intelligence.**

---

## 📐 High‑Level Vision

The platform is a **smart planner** powered by:

* Clean UI displaying events on a timeline
* Filters for category, venue, date, time
* Personalized planning assistant
* Algorithmic schedule optimization
* User itinerary management
* Convex‑powered backend for real‑time reactive data

Users can:

* Explore events visually
* Build schedules manually or automatically
* Save itinerary across devices
* Compare alternate planning options

---

## 🏗️ System Architecture (High-Level)

```
               ┌──────────────────┐
               │   User (Web)     │
               └───────┬──────────┘
                       │
               Frontend (Next.js)
                       │
    ┌──────────────────┴──────────────────┐
    │                                     │
Event Timeline UI                  Intelligent Planner Engine
(React + Tailwind)               (Interval Scheduling Logic)
    │                                     │
    ├─────────────── Uses ────────────────┤
    │                                     │
Convex Backend  <────── Real-time sync ───┘
(Storing events, user schedules)
    │
Convex Database (Documents)
```

---

## 🧱 Tech Stack & Rationale

### **Frontend**

* **Next.js** → Best for React apps with good routing + SSR
* **TailwindCSS** → Fast styling, responsive timeline
* **Framer Motion** → Smooth transitions in timeline
* **FullCalendar.js / custom timeline** → Visual event layout
* **Zustand / Jotai (optional)** → Lightweight state management

### **Backend (Convex)**

* Real‑time reactivity (automatic re-fetch)
* Deno-like functions for logic
* Document database built in
* Easy auth integration

### **Algorithms**

* **Interval Scheduling Maximization** → Pick max non‑overlapping shows
* **Weighted Category Optimization** → Honor category preferences
* **Venue Transition Constraints** → Prevent impossible venue switches
* **Multi-Day Expansion** → Apply for entire festival window

### **Deployment**

* **Vercel** for frontend
* **Convex Cloud** for backend

---

## 📦 Data Model (Convex)

### events table

* id
* title
* category
* venue
* artist
* dates[]
* timeSlot ("19:15" | "21:00")

### users table

* id
* email / oauth provider

### schedules table

* id
* userId
* selectedEvents[] (eventInstance ids)

### eventInstances table

Flattened version:

* id
* eventId
* date
* start
* end
* venue

---

## ⚙️ Functional Constraints

* Each event has 2–4 dates, *all at the same venue*.
* Each day has exactly two time slots: **7:15 PM and 9:00 PM**.
* Users want to attend as many events as possible.
* Multiple events may run at the same time → conflicts.
* Travel time between venues may affect feasibility.
* Some users may only attend on selected dates.

---

## 🧠 Intelligent Planner Logic Overview

### Input Parameters

* Preferred categories
* Days available
* Max shows per day (optional)
* Venue-switch tolerance

### Algorithm

1. Filter all eventInstances by user availability
2. Apply weighted scoring for categories
3. Sort by end time (primary key)
4. Greedy pick non‑overlapping events
5. Check venue-switch feasibility
6. Produce schedule
7. Provide alternatives when conflict occurs

---

## 📊 Visual System

### Components

* Timeline view (horizontal scroll)
* Category filters (Music/Dance/Theatre)
* Venue selector (3 venues)
* Day selector (calendar grid)
* Event detail modal
* Add to Schedule button
* MySchedule page (calendar-like layout)

---

## 🏁 Milestones Overview

* Data import from CSV → Convex
* Event instance generation
* Timeline UI
* Filters
* Manual "My Schedule" creation
* Intelligent planner algorithm
* Planner UI wizard
* Shareable schedules
* Polishing & visual refinement

---

## 🛑 Risks & Constraints

* Timeline performance on mobile
* Algorithm complexity growing with expansions
* Venue-distance modelling simplification
* Real-time issues if Convex functions become heavy

---

## 🌟 Future Enhancements

* AI-based personalized recommendation engine
* Heatmap of popular shows
* Friend sync: see mutual events
* Offline PWA more
* Analytics for festival organizers
