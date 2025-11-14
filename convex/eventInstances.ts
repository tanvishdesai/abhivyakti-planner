import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query all event instances
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("eventInstances").collect();
  },
});

// Query event instances by date
export const listByDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("eventInstances")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

// Query event instances with filters
export const listFiltered = query({
  args: {
    date: v.optional(v.string()),
    category: v.optional(v.string()),
    venue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let instances = await ctx.db.query("eventInstances").collect();

    if (args.date) {
      instances = instances.filter((i) => i.date === args.date);
    }
    if (args.category) {
      instances = instances.filter((i) => i.category === args.category);
    }
    if (args.venue) {
      instances = instances.filter((i) => i.venue === args.venue);
    }

    return instances;
  },
});

// Get instances for a specific event
export const getByEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("eventInstances")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

// Get single event instance
export const get = query({
  args: { id: v.id("eventInstances") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get multiple event instances by IDs
export const getMany = query({
  args: {
    ids: v.array(v.id("eventInstances")),
  },
  handler: async (ctx, args) => {
    const instances = await Promise.all(
      args.ids.map((id) => ctx.db.get(id))
    );
    return instances.filter((i) => i !== null);
  },
});

// Create an event instance
export const create = mutation({
  args: {
    eventId: v.id("events"),
    date: v.string(),
    dateObj: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    venue: v.string(),
    specificVenue: v.string(),
    title: v.string(),
    artist: v.string(),
    category: v.string(),
    subCategory: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("eventInstances", args);
  },
});

// Delete an event instance
export const remove = mutation({
  args: { id: v.id("eventInstances") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get all unique dates with event counts
export const getDateSummary = query({
  args: {},
  handler: async (ctx) => {
    const instances = await ctx.db.query("eventInstances").collect();
    
    const dateMap = new Map<string, { date: string; count: number; dateObj: number }>();
    
    instances.forEach((instance) => {
      if (dateMap.has(instance.date)) {
        const existing = dateMap.get(instance.date)!;
        existing.count += 1;
      } else {
        dateMap.set(instance.date, {
          date: instance.date,
          count: 1,
          dateObj: instance.dateObj,
        });
      }
    });
    
    return Array.from(dateMap.values()).sort((a, b) => a.dateObj - b.dateObj);
  },
});

