import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to parse time and calculate end time
function calculateEndTime(startTime: string, duration: number = 75): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

// Helper function to parse date string to timestamp
function parseDateToTimestamp(dateStr: string): number {
  // DD-MMM-YYYY format
  const months: { [key: string]: number } = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  
  const [day, month, year] = dateStr.split("-");
  const monthIndex = months[month];
  return new Date(parseInt(year), monthIndex, parseInt(day)).getTime();
}

// Seed events from performance data
export const seedEvents = mutation({
  args: {
    performances: v.array(
      v.object({
        id: v.string(),
        eventName: v.string(),
        artist: v.string(),
        category: v.string(),
        subCategory: v.string(),
        date: v.string(),
        time: v.string(),
        mainVenue: v.string(),
        specificVenue: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Group performances by unique event (same title, artist, venue, time)
    const eventMap = new Map<
      string,
      {
        title: string;
        artist: string;
        category: string;
        subCategory: string;
        venue: string;
        specificVenue: string;
        timeSlot: string;
        dates: string[];
      }
    >();

    args.performances.forEach((perf) => {
      const key = `${perf.eventName}|${perf.artist}|${perf.mainVenue}|${perf.time}`;
      
      if (eventMap.has(key)) {
        const existing = eventMap.get(key)!;
        if (!existing.dates.includes(perf.date)) {
          existing.dates.push(perf.date);
        }
      } else {
        eventMap.set(key, {
          title: perf.eventName,
          artist: perf.artist,
          category: perf.category,
          subCategory: perf.subCategory,
          venue: perf.mainVenue,
          specificVenue: perf.specificVenue,
          timeSlot: perf.time,
          dates: [perf.date],
        });
      }
    });

    const eventIds: string[] = [];

    // Insert events and create event instances
    for (const [key, event] of eventMap.entries()) {
      // Create the event
      const eventId = await ctx.db.insert("events", {
        title: event.title,
        artist: event.artist,
        category: event.category,
        subCategory: event.subCategory,
        venue: event.venue,
        specificVenue: event.specificVenue,
        dates: event.dates,
        timeSlot: event.timeSlot,
        duration: 75,
      });

      // Create event instances for each date
      for (const date of event.dates) {
        const endTime = calculateEndTime(event.timeSlot, 75);
        const dateObj = parseDateToTimestamp(date);

        await ctx.db.insert("eventInstances", {
          eventId,
          date,
          dateObj,
          startTime: event.timeSlot,
          endTime,
          venue: event.venue,
          specificVenue: event.specificVenue,
          title: event.title,
          artist: event.artist,
          category: event.category,
          subCategory: event.subCategory,
        });
      }

      eventIds.push(eventId);
    }

    return {
      eventsCreated: eventIds.length,
      totalPerformances: args.performances.length,
    };
  },
});

// Clear all data (for re-seeding)
export const clearAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all event instances
    const instances = await ctx.db.query("eventInstances").collect();
    for (const instance of instances) {
      await ctx.db.delete(instance._id);
    }

    // Delete all events
    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    // Delete all schedules
    const schedules = await ctx.db.query("schedules").collect();
    for (const schedule of schedules) {
      await ctx.db.delete(schedule._id);
    }

    return {
      eventsDeleted: events.length,
      instancesDeleted: instances.length,
      schedulesDeleted: schedules.length,
    };
  },
});

// Get seeding status
export const getSeedStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    const instances = await ctx.db.query("eventInstances").collect();
    const schedules = await ctx.db.query("schedules").collect();

    return {
      eventsCount: events.length,
      instancesCount: instances.length,
      schedulesCount: schedules.length,
      isSeeded: events.length > 0,
    };
  },
});

