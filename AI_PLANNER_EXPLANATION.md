# AI Planner Feature - How It Works & Fixes

## 📋 Overview

The AI Planner is an intelligent scheduling system that helps users maximize the number of **different** performances they can attend in the minimum number of days, while avoiding schedule conflicts and respecting user preferences.

## 🔍 Related Files

### Core Implementation
- **`convex/planner.ts`** - Main planning algorithm (433 lines)
  - `greedyScheduling()` - Core interval scheduling algorithm
  - `scoreEvent()` - Scoring system for event prioritization
  - `generateAlternatives()` - Alternative plan generation
  - `generateSchedule()` - Main mutation that creates optimized plans

### UI Components
- **`components/PlannerModal.tsx`** - User interface for planner preferences and results
- **`app/page.tsx`** - Main page that triggers the planner modal

### Database Schema
- **`convex/schema.ts`** - Defines:
  - `events` - Unique events (performances)
  - `eventInstances` - Flattened occurrences (same event on different dates/times)
  - `schedules` - User's selected event instances
  - `savedPlans` - Generated plan variations
  - `plannerPreferences` - User preferences for planning

## 🧠 How the Current Algorithm Works

### 1. **Input Parameters**
- `preferredCategories` - Categories user wants to prioritize
- `availableDates` - Dates user can attend
- `maxEventsPerDay` - Maximum events per day (default: 4)
- `venuePreferences` - Preferred venues
- `allowVenueSwitches` - Whether to allow switching venues on same day

### 2. **Scoring System** (`scoreEvent`)
Each event instance gets a score:
- **Base score**: 100 points
- **Category match**: +50 points if in preferred categories
- **Venue preference**: +30 points if in preferred venues
- **Time optimization**: Up to +14.4 points for earlier end times (more scheduling flexibility)

### 3. **Greedy Scheduling Algorithm** (`greedyScheduling`)
1. **Score all events** based on preferences
2. **Sort by score** (descending), then by end time (ascending)
3. **Iterate through sorted events** and for each:
   - ✅ **NEW FIX**: Skip if this event (by `eventId`) was already selected
   - Check for time conflicts (overlapping events)
   - Check venue switch feasibility (15 min gap required)
   - Check max events per day limit
   - If no conflicts, add to schedule

### 4. **Alternative Plans** (`generateAlternatives`)
Generates 2-3 alternative plans with different strategies:
- **Alternative 1**: Reversed category priorities
- **Alternative 2**: Opposite venue switch preference
- **Alternative 3**: Focus on single venue with most events

## 🐛 Problem Identified & Fixed

### **The Bug**
The algorithm was selecting the **same performance multiple times** on different dates. For example:
- "4 feet ka Sapna" on 15-Nov
- "4 feet ka Sapna" on 16-Nov  
- "4 feet ka Sapna" on 18-Nov

This defeats the goal of **maximizing different performances** in minimum days.

### **Root Cause**
The `greedyScheduling` function only checked for:
- Time conflicts (overlapping events)
- Venue switch feasibility
- Max events per day limit

It **did NOT check** if the same event (by `eventId`) was already selected.

### **The Fix**
Added a `Set<Id<"events">>` to track selected event IDs:
```typescript
const selectedEventIds = new Set<Id<"events">>();

// Skip if we've already selected this event
if (selectedEventIds.has(instance.eventId)) {
  continue;
}

// When adding to schedule, also track the eventId
selected.push(instance);
selectedEventIds.add(instance.eventId);
```

Now the algorithm ensures **each unique performance is selected only once**, maximizing variety.

## 🚀 How to Enhance the Planner

### 1. **Add Preference for Event Diversity**
Add a preference option to prioritize:
- Different artists
- Different categories
- Different venues

### 2. **Improve Scoring Algorithm**
Enhance `scoreEvent()` to:
- Penalize selecting events from already-selected categories
- Boost events from underrepresented categories
- Consider artist diversity

### 3. **Better Alternative Generation**
Enhance `generateAlternatives()` to:
- Generate plans that maximize category diversity
- Create plans that minimize venue switches
- Generate plans that maximize artist diversity

### 4. **Add Optimization Goals**
Allow users to choose optimization goals:
- **Maximize diversity** (current behavior after fix)
- **Minimize venue switches**
- **Maximize preferred categories**
- **Minimize days** (pack as many events as possible in fewer days)

### 5. **Dynamic Time Slot Selection**
Currently, the algorithm picks the first available instance. Could be enhanced to:
- Select the instance that fits best in the schedule
- Consider travel time between venues more intelligently
- Optimize for consecutive events at same venue

### 6. **Constraint Satisfaction**
Add more sophisticated constraint handling:
- Minimum break time between events
- Maximum travel distance between venues
- Preferred time slots (morning/afternoon/evening)

### 7. **Multi-Objective Optimization**
Instead of greedy algorithm, consider:
- **Dynamic Programming** for smaller problem sizes
- **Genetic Algorithms** for exploring solution space
- **Linear Programming** for optimal solutions

### 8. **User Feedback Loop**
- Allow users to mark events as "must-see" or "avoid"
- Learn from user's manual schedule edits
- Suggest improvements to generated plans

## 📊 Algorithm Complexity

- **Time Complexity**: O(n²) where n = number of event instances
  - Scoring: O(n)
  - Sorting: O(n log n)
  - Conflict checking: O(n²) in worst case
  
- **Space Complexity**: O(n) for storing selected events and event IDs

## 🎯 Current Behavior (After Fix)

1. ✅ **No duplicate performances** - Each unique event selected only once
2. ✅ **Maximizes different performances** - Prioritizes variety
3. ✅ **Respects time conflicts** - No overlapping events
4. ✅ **Respects venue constraints** - Handles venue switches intelligently
5. ✅ **Respects daily limits** - Honors max events per day
6. ✅ **Generates alternatives** - Provides 2-3 plan variations

## 🔄 Testing the Fix

After the fix, when you generate a plan:
- Each performance title should appear **only once** in the schedule
- The algorithm will select different performances instead of repeating the same one
- You'll see more variety in your generated plans

Try generating a new plan and verify that duplicate performances are eliminated!

