import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Events table - stores unique events with multiple dates
  events: defineTable({
    title: v.string(),
    artist: v.string(),
    category: v.string(), // Music, Dance, Theatre
    subCategory: v.string(),
    venue: v.string(), // main venue
    specificVenue: v.string(),
    dates: v.array(v.string()), // array of dates this event occurs
    timeSlot: v.string(), // "19:15" or "21:00"
    duration: v.optional(v.number()), // duration in minutes, default 75
  })
    .index("by_category", ["category"])
    .index("by_venue", ["venue"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["category", "venue"],
    })
    .searchIndex("search_artist", {
      searchField: "artist",
      filterFields: ["category", "venue"],
    }),

  // EventInstances - flattened occurrences for scheduling
  eventInstances: defineTable({
    eventId: v.id("events"),
    date: v.string(), // DD-MMM-YYYY format
    dateObj: v.number(), // timestamp for sorting
    startTime: v.string(), // "19:15"
    endTime: v.string(), // "20:30"
    venue: v.string(),
    specificVenue: v.string(),
    title: v.string(),
    artist: v.string(),
    category: v.string(),
    subCategory: v.string(),
  })
    .index("by_date", ["date"])
    .index("by_event", ["eventId"])
    .index("by_date_time", ["date", "startTime"])
    .index("by_venue_date", ["venue", "date"]),

  // User schedules
  schedules: defineTable({
    userId: v.optional(v.string()), // Clerk user ID (optional for anonymous)
    sessionId: v.optional(v.string()), // session ID for anonymous users
    selectedEventInstances: v.array(v.id("eventInstances")),
    name: v.optional(v.string()), // Optional name for saved schedules
    isPublic: v.optional(v.boolean()), // Whether schedule is shareable
    shareToken: v.optional(v.string()), // Unique token for sharing
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_share_token", ["shareToken"]),

  // Users table (Clerk integration)
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Planner preferences (for intelligent planning)
  plannerPreferences: defineTable({
    userId: v.string(), // Clerk user ID
    preferredCategories: v.array(v.string()),
    availableDates: v.array(v.string()),
    maxEventsPerDay: v.optional(v.number()),
    venuePreferences: v.optional(v.array(v.string())),
    allowVenueSwitches: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Saved plans (different from schedules - these are plan variations)
  savedPlans: defineTable({
    userId: v.string(),
    scheduleId: v.id("schedules"),
    name: v.string(),
    description: v.optional(v.string()),
    planType: v.string(), // "optimized", "alternative_1", "alternative_2", "custom"
    score: v.optional(v.number()), // Quality score of the plan
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_schedule", ["scheduleId"]),
});

