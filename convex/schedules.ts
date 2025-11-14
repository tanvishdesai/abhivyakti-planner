import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user's schedule (by userId or sessionId)
export const get = query({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      const schedule = await ctx.db
        .query("schedules")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();
      return schedule;
    }

    if (args.sessionId) {
      const schedule = await ctx.db
        .query("schedules")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();
      return schedule;
    }

    return null;
  },
});

// Get schedule with full event details
export const getWithEvents = query({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let schedule;

    if (args.userId) {
      schedule = await ctx.db
        .query("schedules")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();
    } else if (args.sessionId) {
      schedule = await ctx.db
        .query("schedules")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();
    }

    if (!schedule) {
      return { schedule: null, events: [] };
    }

    // Fetch all event instances
    const events = await Promise.all(
      schedule.selectedEventInstances.map((id) => ctx.db.get(id))
    );

    return {
      schedule,
      events: events.filter((e) => e !== null),
    };
  },
});

// Create a new schedule
export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    selectedEventInstances: v.optional(v.array(v.id("eventInstances"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("schedules", {
      userId: args.userId,
      sessionId: args.sessionId,
      selectedEventInstances: args.selectedEventInstances ?? [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Add event to schedule
export const addEvent = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    eventInstanceId: v.id("eventInstances"),
  },
  handler: async (ctx, args) => {
    // Find or create schedule
    let schedule;

    if (args.userId) {
      schedule = await ctx.db
        .query("schedules")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();
    } else if (args.sessionId) {
      schedule = await ctx.db
        .query("schedules")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();
    }

    if (!schedule) {
      // Create new schedule
      const now = Date.now();
      const scheduleId = await ctx.db.insert("schedules", {
        userId: args.userId,
        sessionId: args.sessionId,
        selectedEventInstances: [args.eventInstanceId],
        createdAt: now,
        updatedAt: now,
      });
      return scheduleId;
    }

    // Check if event already in schedule
    if (schedule.selectedEventInstances.includes(args.eventInstanceId)) {
      return schedule._id;
    }

    // Add event to schedule
    await ctx.db.patch(schedule._id, {
      selectedEventInstances: [
        ...schedule.selectedEventInstances,
        args.eventInstanceId,
      ],
      updatedAt: Date.now(),
    });

    return schedule._id;
  },
});

// Remove event from schedule
export const removeEvent = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    eventInstanceId: v.id("eventInstances"),
  },
  handler: async (ctx, args) => {
    let schedule;

    if (args.userId) {
      schedule = await ctx.db
        .query("schedules")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();
    } else if (args.sessionId) {
      schedule = await ctx.db
        .query("schedules")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();
    }

    if (!schedule) {
      return null;
    }

    await ctx.db.patch(schedule._id, {
      selectedEventInstances: schedule.selectedEventInstances.filter(
        (id) => id !== args.eventInstanceId
      ),
      updatedAt: Date.now(),
    });

    return schedule._id;
  },
});

// Toggle event in schedule
export const toggleEvent = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    eventInstanceId: v.id("eventInstances"),
  },
  handler: async (ctx, args) => {
    let schedule;

    if (args.userId) {
      schedule = await ctx.db
        .query("schedules")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();
    } else if (args.sessionId) {
      schedule = await ctx.db
        .query("schedules")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();
    }

    if (!schedule) {
      // Create new schedule with this event
      const now = Date.now();
      return await ctx.db.insert("schedules", {
        userId: args.userId,
        sessionId: args.sessionId,
        selectedEventInstances: [args.eventInstanceId],
        createdAt: now,
        updatedAt: now,
      });
    }

    // Toggle event
    const isSelected = schedule.selectedEventInstances.includes(
      args.eventInstanceId
    );

    if (isSelected) {
      await ctx.db.patch(schedule._id, {
        selectedEventInstances: schedule.selectedEventInstances.filter(
          (id) => id !== args.eventInstanceId
        ),
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(schedule._id, {
        selectedEventInstances: [
          ...schedule.selectedEventInstances,
          args.eventInstanceId,
        ],
        updatedAt: Date.now(),
      });
    }

    return schedule._id;
  },
});

// Clear schedule
export const clear = mutation({
  args: {
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let schedule;

    if (args.userId) {
      schedule = await ctx.db
        .query("schedules")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();
    } else if (args.sessionId) {
      schedule = await ctx.db
        .query("schedules")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();
    }

    if (!schedule) {
      return null;
    }

    await ctx.db.patch(schedule._id, {
      selectedEventInstances: [],
      updatedAt: Date.now(),
    });

    return schedule._id;
  },
});

// Generate share token and make schedule public
export const shareSchedule = mutation({
  args: {
    scheduleId: v.id("schedules"),
    scheduleName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== identity.subject) {
      throw new Error("Schedule not found or unauthorized");
    }

    // Generate unique share token
    const shareToken = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await ctx.db.patch(args.scheduleId, {
      isPublic: true,
      shareToken,
      name: args.scheduleName || schedule.name || "My Festival Schedule",
      updatedAt: Date.now(),
    });

    return shareToken;
  },
});

// Get schedule by share token
export const getByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const schedule = await ctx.db
      .query("schedules")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .first();

    if (!schedule || !schedule.isPublic) {
      return null;
    }

    const events = await Promise.all(
      schedule.selectedEventInstances.map((id) => ctx.db.get(id))
    );

    return {
      schedule,
      events: events.filter((e) => e !== null),
    };
  },
});

// Unshare schedule (make private)
export const unshareSchedule = mutation({
  args: { scheduleId: v.id("schedules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== identity.subject) {
      throw new Error("Schedule not found or unauthorized");
    }

    await ctx.db.patch(args.scheduleId, {
      isPublic: false,
      shareToken: undefined,
      updatedAt: Date.now(),
    });
  },
});

