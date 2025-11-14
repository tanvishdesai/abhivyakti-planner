import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query all events
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

// Query events with filters
export const listFiltered = query({
  args: {
    category: v.optional(v.string()),
    venue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("events");

    if (args.category) {
      const results = await ctx.db
        .query("events")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
      return results;
    }
    if (args.venue) {
      const results = await ctx.db
        .query("events")
        .withIndex("by_venue", (q) => q.eq("venue", args.venue!))
        .collect();
      return results;
    }

    return await query.collect();
  },
});

// Search events by title or artist
export const search = query({
  args: {
    searchTerm: v.string(),
    category: v.optional(v.string()),
    venue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Search by title
    const titleResults = await ctx.db
      .query("events")
      .withSearchIndex("search_title", (q) => {
        let search = q.search("title", args.searchTerm);
        if (args.category) search = search.eq("category", args.category);
        if (args.venue) search = search.eq("venue", args.venue);
        return search;
      })
      .take(20);

    // Search by artist
    const artistResults = await ctx.db
      .query("events")
      .withSearchIndex("search_artist", (q) => {
        let search = q.search("artist", args.searchTerm);
        if (args.category) search = search.eq("category", args.category);
        if (args.venue) search = search.eq("venue", args.venue);
        return search;
      })
      .take(20);

    // Combine and deduplicate results
    const allResults = [...titleResults, ...artistResults];
    const uniqueResults = Array.from(
      new Map(allResults.map((item) => [item._id, item])).values()
    );

    return uniqueResults;
  },
});

// Get single event by ID
export const get = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new event
export const create = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    category: v.string(),
    subCategory: v.string(),
    venue: v.string(),
    specificVenue: v.string(),
    dates: v.array(v.string()),
    timeSlot: v.string(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      ...args,
      duration: args.duration ?? 75,
    });
  },
});

// Update an event
export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    artist: v.optional(v.string()),
    category: v.optional(v.string()),
    subCategory: v.optional(v.string()),
    venue: v.optional(v.string()),
    specificVenue: v.optional(v.string()),
    dates: v.optional(v.array(v.string())),
    timeSlot: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete an event
export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
