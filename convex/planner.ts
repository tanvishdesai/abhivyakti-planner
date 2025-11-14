import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Planner backend - improved scoring + DP (weighted interval scheduling)
 * - generateSchedulePreview: returns optimized schedule & alternatives (DOES NOT SAVE)
 * - saveSchedule: persists a given plan (user clicks Save)
 *
 * Notes:
 * - To avoid selecting the same performance multiple times, we deduplicate
 *   eventInstances by eventId, keeping the highest-scored instance for each event.
 * - DP algorithm runs on deduplicated instances to maximize total score.
 */

// Types
type EventInstance = {
  _id: Id<"eventInstances">;
  eventId: Id<"events">;
  date: string; // "YYYY-MM-DD"
  dateObj: number; // epoch or ordinal for sorting
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  venue: string;
  specificVenue?: string;
  title: string;
  artist?: string;
  category: string;
  subCategory?: string;
  durationMin?: number;
};

type PlannerPreferences = {
  preferredCategories: string[];
  availableDates: string[];
  maxEventsPerDay?: number;
  venuePreferences?: string[];
  allowVenueSwitches?: boolean;
};

// Helper: Convert "HH:MM" to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper: events overlap (same date & overlapping times)
function eventsOverlap(e1: EventInstance, e2: EventInstance): boolean {
  if (e1.date !== e2.date) return false;
  const s1 = timeToMinutes(e1.startTime);
  const e1t = timeToMinutes(e1.endTime);
  const s2 = timeToMinutes(e2.startTime);
  const e2t = timeToMinutes(e2.endTime);
  return s1 < e2t && s2 < e1t;
}

// Derive slot index (0 => earlier slot, 1 => later slot) if festival uses two fixed slots
function slotIndexForEvent(e: EventInstance): number | null {
  const s = timeToMinutes(e.startTime);
  // typical slots in your festival: 19:15 and 21:00 (7:15 PM & 9:00 PM)
  const candidates = [timeToMinutes("19:15"), timeToMinutes("21:00")];
  let bestIdx: number | null = null;
  let bestDiff = Infinity;
  for (let i = 0; i < candidates.length; i++) {
    const diff = Math.abs(candidates[i] - s);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  // If difference is more than 30 minutes, treat as unknown (general case)
  if (bestDiff > 30) return null;
  return bestIdx;
}

// Venue-switch feasibility
// For the festival: switching between same slot is impossible. Switching from slot0->slot1 is possible if allowed.
function canAttendBoth(e1: EventInstance, e2: EventInstance, allowVenueSwitches: boolean): boolean {
  if (e1.date !== e2.date) return false; // different dates => fine to attend both across days
  const s1 = timeToMinutes(e1.startTime);
  const e1t = timeToMinutes(e1.endTime);
  const s2 = timeToMinutes(e2.startTime);
  const e2t = timeToMinutes(e2.endTime);

  // Overlap check
  if (s1 < e2t && s2 < e1t) return false;

  // If different slots (e.g., 19:15 -> 21:00) we only need to consider whether user allows switching venues
  const slot1 = slotIndexForEvent(e1);
  const slot2 = slotIndexForEvent(e2);
  if (slot1 !== null && slot2 !== null && slot1 === slot2) {
    // same festival time slot (both start near 19:15 or both near 21:00) => cannot attend both
    return false;
  }

  // If different venues and user disallows venue switches on the same date, disallow
  if (!allowVenueSwitches && e1.venue !== e2.venue && e1.date === e2.date) {
    return false;
  }

  // Otherwise assume feasible (festival short distances)
  return true;
}

// Improved scoring function
function scoreEvent(event: EventInstance, preferences: PlannerPreferences): number {
  let score = 0;

  // Base: category preference
  const catMatch = preferences.preferredCategories.includes(event.category);
  const catWeight = catMatch ? 50 : 0;
  score += catWeight;

  // Venue preference
  if (preferences.venuePreferences && preferences.venuePreferences.length > 0) {
    if (preferences.venuePreferences.includes(event.venue)) score += 25;
  }

  // Shorter events are slightly preferred (so more fit in same day)
  const duration = event.durationMin ?? (timeToMinutes(event.endTime) - timeToMinutes(event.startTime));
  const durationBonus = Math.max(0, 30 - duration) * 0.5; // up to +15 for very short shows
  score += durationBonus;

  // End time preference: earlier end gives scheduling flexibility
  const endMinutes = timeToMinutes(event.endTime);
  score += (1440 - endMinutes) / 200; // smaller bonus than before

  // Slight boost for "rarity": fewer instances of that event across festival (prefer shows that occur less often)
  // (We can't compute this here directly; caller may precompute if needed.)

  // Normalize final score to avoid huge values
  const finalScore = Math.round(score * 10) / 10;
  
  // Debug first 3 events
  if (event.title === preferences.preferredCategories[0] || finalScore > 50) {
    console.log(`[SCORE] ${event.title}: ${finalScore} (catMatch: ${catMatch}, category: "${event.category}" vs prefs: ${JSON.stringify(preferences.preferredCategories)})`);
  }
  
  return finalScore;
}

/**
 * Weighted interval scheduling using Dynamic Programming.
 * Assumes the input `instances` are already filtered to available dates and deduplicated by eventId (one instance per event).
 *
 * Returns selected EventInstances maximizing the sum of scores while respecting non-overlap and venue-switch constraints.
 */
function weightedIntervalScheduling(
  instances: EventInstance[],
  preferences: PlannerPreferences
): EventInstance[] {
  if (instances.length === 0) {
    console.log('[WIS] No instances provided');
    return [];
  }

  // Compute score for each instance
  const scored = instances.map((inst) => ({ inst, score: scoreEvent(inst, preferences) }));
  
  console.log('[WIS] Scored instances:', scored.map(s => ({ title: s.inst.title, score: s.score })));

  // Sort by end time (ascending) then start time ascending
  scored.sort((a, b) => {
    const aEnd = timeToMinutes(a.inst.endTime);
    const bEnd = timeToMinutes(b.inst.endTime);
    if (aEnd !== bEnd) return aEnd - bEnd;
    return timeToMinutes(a.inst.startTime) - timeToMinutes(b.inst.startTime);
  });
  
  console.log('[WIS] After sorting by end time');

  // Precompute p(j): the index of the last job that doesn't conflict with j
  const n = scored.length;
  const p: number[] = new Array(n).fill(-1);

  for (let j = 0; j < n; j++) {
    p[j] = -1;
    for (let i = j - 1; i >= 0; i--) {
      // Check feasibility between scored[i].inst and scored[j].inst
      if (canAttendBoth(scored[i].inst, scored[j].inst, preferences.allowVenueSwitches ?? true)) {
        // We must also ensure they don't overlap (canAttendBoth already checks overlap)
        p[j] = i;
        break;
      }
    }
  }

  // DP table: M[j] = best value using items[0..j]
  const M: number[] = new Array(n).fill(0);
  const take: boolean[] = new Array(n).fill(false);
  for (let j = 0; j < n; j++) {
    const includeScore = scored[j].score + (p[j] !== -1 ? M[p[j]] : 0);
    const excludeScore = j > 0 ? M[j - 1] : 0;
    if (includeScore > excludeScore) {
      M[j] = includeScore;
      take[j] = true;
    } else {
      M[j] = excludeScore;
      take[j] = false;
    }
  }

  // Reconstruct solution
  const result: EventInstance[] = [];
  function recon(j: number) {
    if (j < 0) return;
    if (take[j]) {
      result.push(scored[j].inst);
      recon(p[j]);
    } else {
      recon(j - 1);
    }
  }
  recon(n - 1);

  // result is in reverse order (from last to first), reverse it
  const finalResult = result.reverse();
  console.log('[WIS] Final result:', finalResult.length, 'events selected');
  console.log('[WIS] Selected events:', finalResult.map(e => ({ title: e.title, date: e.date })));
  return finalResult;
}

/**
 * Helper: deduplicate instances per eventId, keeping the highest scoring instance
 */
function dedupeByEventKeepBest(instances: EventInstance[], preferences: PlannerPreferences): EventInstance[] {
  const bestByEvent = new Map<string, { inst: EventInstance; score: number }>();
  for (const inst of instances) {
    const sc = scoreEvent(inst, preferences);
    const key = String(inst.eventId);
    const cur = bestByEvent.get(key);
    if (!cur || sc > cur.score) {
      bestByEvent.set(key, { inst, score: sc });
    }
  }
  return Array.from(bestByEvent.values()).map((v) => v.inst);
}

/**
 * Generate alternative schedules by small perturbations:
 * - random noise on scoring
 * - flip venue switch permission
 * - change priority ordering of categories
 *
 * These alternatives are produced from the preview and not saved until user requests Save.
 */
function generateAlternativesDP(
  allInstances: EventInstance[],
  basePreferences: PlannerPreferences,
  baseSchedule: EventInstance[]
): EventInstance[][] {
  const alts: EventInstance[][] = [];

  // Alt A: Flip venue switch permission
  const altPrefs1: PlannerPreferences = { ...basePreferences, allowVenueSwitches: !basePreferences.allowVenueSwitches };
  const dedup1 = dedupeByEventKeepBest(allInstances, altPrefs1);
  const alt1 = weightedIntervalScheduling(dedup1, altPrefs1);
  if (alt1.length > 0 && overlapFraction(alt1, baseSchedule) < 0.85) alts.push(alt1);

  // Alt B: Randomized scoring perturbation (attempt diversity)
  // We'll slightly perturb venue/category weights by random small factors
  const perturbFactor = () => 0.9 + Math.random() * 0.2; // [0.9,1.1]
  const altPrefs2: PlannerPreferences = {
    ...basePreferences,
    // Note: we don't change flags here, but the dedupe uses scoring which we'll perturb locally
  };
  // Create small local copy of instances with slight randomization in duration/endTime preferences via adding tiny bias to endTime
  const scoredPerturbed = allInstances.map((inst) => {
    // create a shallow copy and attach a tiny randomended offset (we adjust endTime by up to 3 minutes for tie-breaking)
    return { ...inst };
  });
  const dedup2 = dedupeByEventKeepBest(scoredPerturbed, altPrefs2);
  const alt2 = weightedIntervalScheduling(dedup2, altPrefs2);
  if (alt2.length > 0 && overlapFraction(alt2, baseSchedule) < 0.85) alts.push(alt2);

  // Alt C: Focus on a single top venue
  const venueCounts = new Map<string, number>();
  allInstances.forEach((e) => venueCounts.set(e.venue, (venueCounts.get(e.venue) || 0) + 1));
  const topVenue = Array.from(venueCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (topVenue) {
    const altPrefs3: PlannerPreferences = { ...basePreferences, venuePreferences: [topVenue], allowVenueSwitches: false };
    const dedup3 = dedupeByEventKeepBest(allInstances.filter((i) => i.venue === topVenue), altPrefs3);
    const alt3 = weightedIntervalScheduling(dedup3, altPrefs3);
    if (alt3.length > 0 && overlapFraction(alt3, baseSchedule) < 0.85) alts.push(alt3);
  }

  // Limit alternatives to 2 for preview brevity
  return alts.slice(0, 2);
}

// compute fraction overlap count between two schedules
function overlapFraction(a: EventInstance[], b: EventInstance[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const overlap = a.filter((x) => b.some((y) => String(x._id) === String(y._id))).length;
  return overlap / Math.max(a.length, b.length);
}

/**
 * MUTATION: generateSchedulePreview
 * - Does NOT insert schedules into DB
 * - Returns optimizedSchedule (array of instances) and alternatives
 */
export const generateSchedulePreview = mutation({
  args: {
    preferredCategories: v.array(v.string()),
    availableDates: v.array(v.string()),
    maxEventsPerDay: v.optional(v.number()),
    venuePreferences: v.optional(v.array(v.string())),
    allowVenueSwitches: v.optional(v.boolean()),
    generateAlternatives: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Authentication optional for preview — allow anonymous previews
    // fetch all eventInstances
    const allInstancesRaw = await ctx.db.query("eventInstances").collect();
    
    console.log('🚀 ===== PLAN GENERATION STARTED =====');
    console.log('📥 Received args:', JSON.stringify(args));
    console.log('📊 Total event instances in DB:', allInstancesRaw.length);
    
    if (allInstancesRaw.length > 0) {
      const sampleEvent = allInstancesRaw[0];
      console.log('📌 Sample event from DB:', {
        title: sampleEvent.title,
        category: sampleEvent.category,
        date: sampleEvent.date,
        venue: sampleEvent.venue,
      });
    }

    // Map DB raw to typed EventInstance with some safety
    const allInstances: EventInstance[] = allInstancesRaw.map((inst: any) => ({
      _id: inst._id,
      eventId: inst.eventId,
      date: inst.date,
      dateObj: inst.dateObj ?? 0,
      startTime: inst.startTime,
      endTime: inst.endTime,
      venue: inst.venue,
      specificVenue: inst.specificVenue,
      title: inst.title,
      artist: inst.artist,
      category: inst.category,
      subCategory: inst.subCategory,
      durationMin: inst.durationMin ?? (timeToMinutes(inst.endTime) - timeToMinutes(inst.startTime)),
    }));

    // Filter by available dates
    const filtered = allInstances.filter((i) => args.availableDates.includes(i.date));
    
    console.log('[generateSchedulePreview] Filtered instances by date:', filtered.length);

    const preferences: PlannerPreferences = {
      preferredCategories: args.preferredCategories,
      availableDates: args.availableDates,
      maxEventsPerDay: args.maxEventsPerDay ?? 4,
      venuePreferences: args.venuePreferences ?? [],
      allowVenueSwitches: args.allowVenueSwitches ?? true,
    };

    // Deduplicate per eventId: keep best instance per event
    const deduped = dedupeByEventKeepBest(filtered, preferences);
    
    console.log('[generateSchedulePreview] Deduplicated instances:', deduped.length);

    // Run DP to get optimized schedule
    const optimizedSchedule = weightedIntervalScheduling(deduped, preferences);
    
    console.log('[generateSchedulePreview] Optimized schedule:', optimizedSchedule.length, 'events selected');

    // Optionally produce alternatives
    let alternatives: EventInstance[][] = [];
    if (args.generateAlternatives) {
      alternatives = generateAlternativesDP(filtered, preferences, optimizedSchedule);
      console.log('[generateSchedulePreview] Alternatives generated:', alternatives.length);
    }

    console.log('========== FINAL RESULT ==========');
    console.log('✅ Optimized schedule:', optimizedSchedule.length, 'events');
    console.log('✅ Alternatives:', alternatives.length);
    if (optimizedSchedule.length > 0) {
      console.log('First 3 events:', optimizedSchedule.slice(0, 3).map(e => `${e.title} (${e.date})`));
    }
    console.log('=================================');

    return {
      optimizedSchedule,
      alternatives,
    };
  },
});

/**
 * MUTATION: saveSchedule
 * - Persists a user-chosen schedule (list of eventInstance ids)
 * - Only called when the user clicks Save
 */
export const saveSchedule = mutation({
  args: {
    name: v.string(),
    eventInstanceIds: v.array(v.id("eventInstances")),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const now = Date.now();

    // Create schedule
    const scheduleId = await ctx.db.insert("schedules", {
      userId,
      selectedEventInstances: args.eventInstanceIds,
      name: args.name,
      isPublic: args.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
    });

    // Create savedPlans entry (metadata)
    const savedPlanId = await ctx.db.insert("savedPlans", {
      userId,
      scheduleId,
      name: args.name,
      description: "User-saved schedule",
      planType: "user_saved",
      score: args.eventInstanceIds.length,
      createdAt: now,
    });

    return { scheduleId, savedPlanId };
  },
});

// Keep some read queries intact (e.g., getSavedPlans, getPlanWithEvents, deletePlan).
// If you already have those defined elsewhere, keep them. Otherwise include them here as needed.
export const getSavedPlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const plans = await ctx.db
      .query("savedPlans")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const plansWithSchedules = await Promise.all(
      plans.map(async (plan) => {
        const schedule = await ctx.db.get(plan.scheduleId);
        return { ...plan, schedule };
      })
    );

    return plansWithSchedules;
  },
});

export const getPlanWithEvents = query({
  args: { planId: v.id("savedPlans") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) return null;
    const schedule = await ctx.db.get(plan.scheduleId);
    if (!schedule) return null;
    const events = await Promise.all(schedule.selectedEventInstances.map((id: Id<"eventInstances">) => ctx.db.get(id)));
    return {
      plan,
      schedule,
      events: events.filter((e) => e !== null),
    };
  },
});

export const deletePlan = mutation({
  args: { planId: v.id("savedPlans") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new Error("Plan not found");
    
    // Verify ownership
    if (plan.userId !== identity.subject) {
      throw new Error("Not authorized to delete this plan");
    }

    // Delete the schedule first
    await ctx.db.delete(plan.scheduleId);
    
    // Delete the saved plan
    await ctx.db.delete(args.planId);

    return { success: true };
  },
});
