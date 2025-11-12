'use client';

import { Performance } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useMemo } from "react";
import { Heart } from "lucide-react";
import { useEventStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ComboFinderProps {
  performances: Performance[];
}

export function ComboFinder({ performances }: ComboFinderProps) {
  const toggleEvent = useEventStore((state) => state.toggleEvent);
  const isEventSelected = useEventStore((state) => state.isEventSelected);

  const comboDays = useMemo(() => {
    const grouped = new Map<string, Performance[][]>();

    const byDate = new Map<string, Performance[]>();
    performances.forEach((perf) => {
      if (!byDate.has(perf.date)) {
        byDate.set(perf.date, []);
      }
      byDate.get(perf.date)!.push(perf);
    });

    byDate.forEach((perfs, date) => {
      const valid: Performance[][] = [];
      for (let i = 0; i < perfs.length; i++) {
        for (let j = i + 1; j < perfs.length; j++) {
          if (canAttendBoth(perfs[i], perfs[j])) {
            valid.push([perfs[i], perfs[j]]);
          }
        }
      }
      if (valid.length > 0) {
        grouped.set(date, valid);
      }
    });

    return grouped;
  }, [performances]);

  const comboCounts = useMemo(() => {
    let total = 0;
    comboDays.forEach((combos) => {
      total += combos.length;
    });
    return total;
  }, [comboDays]);

  if (comboCounts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎪 Combo Days Finder</CardTitle>
          <CardDescription>
            Find dates where you can attend 2 events in one day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">
            No combo possibilities found. Try different filters!
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🎪 Combo Days Finder</CardTitle>
          <CardDescription>
            {comboCounts} combo possibilities available
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {Array.from(comboDays.entries()).map(([date, combos]) => (
          <Card key={date}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{date}</CardTitle>
                  <CardDescription>{combos.length} combo options</CardDescription>
                </div>
                <Badge variant="secondary">{combos.length} combos</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {combos.map((combo, idx) => {
                  const [event1, event2] = combo;
                  const travelTime = calculateTravelTime(
                    event1.mainVenue,
                    event2.mainVenue
                  );

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 shadow-inner shadow-black/10"
                    >
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {/* Event 1 */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">
                                {event1.eventName}
                              </h4>
                              <p className="text-xs text-slate-400 truncate">
                                {event1.artist}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                toggleEvent({
                                  id: event1.id,
                                  type: "performance",
                                })
                              }
                              className={cn(
                                "flex-shrink-0",
                                isEventSelected(event1.id) && "text-amber-500"
                              )}
                            >
                              <Heart
                                className={cn(
                                  "w-4 h-4",
                                  isEventSelected(event1.id) && "fill-amber-500"
                                )}
                              />
                            </Button>
                          </div>
                          <div className="flex gap-2 text-xs text-slate-300">
                            <span>⏰ {event1.time}</span>
                            <span>📍 {event1.mainVenue}</span>
                          </div>
                        </div>

                        {/* Arrow + Travel Time */}
                        <div className="flex items-center justify-center gap-2 py-2 md:py-0">
                          <div className="flex-1 h-px bg-white/10"></div>
                          <div className="whitespace-nowrap text-xs text-slate-300">
                            {travelTime}m
                          </div>
                          <div className="flex-1 h-px bg-white/10"></div>
                        </div>

                        {/* Event 2 */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">
                                {event2.eventName}
                              </h4>
                              <p className="text-xs text-slate-400 truncate">
                                {event2.artist}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                toggleEvent({
                                  id: event2.id,
                                  type: "performance",
                                })
                              }
                              className={cn(
                                "flex-shrink-0",
                                isEventSelected(event2.id) && "text-amber-500"
                              )}
                            >
                              <Heart
                                className={cn(
                                  "w-4 h-4",
                                  isEventSelected(event2.id) && "fill-amber-500"
                                )}
                              />
                            </Button>
                          </div>
                          <div className="flex gap-2 text-xs text-slate-300">
                            <span>⏰ {event2.time}</span>
                            <span>📍 {event2.mainVenue}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-white/10 pt-3 text-xs text-slate-300">
                        <Badge variant="dance" className="text-xs">
                          {event1.category}
                        </Badge>
                        <Badge variant="theatre" className="text-xs">
                          {event2.category}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


const VENUE_CLUSTERS: Record<string, string> = {
  "Gujarat University": "university",
  "ATIRA": "cultural-mile",
  "Shreyas Foundation": "foundation",
};

function calculateTravelTime(from: string, to: string) {
  if (from === to) {
    return 5;
  }

  const fromCluster = VENUE_CLUSTERS[from] ?? "other";
  const toCluster = VENUE_CLUSTERS[to] ?? "other";

  if (fromCluster === toCluster) {
    return 12;
  }

  if (
    (fromCluster === "university" && toCluster === "cultural-mile") ||
    (toCluster === "university" && fromCluster === "cultural-mile")
  ) {
    return 15;
  }

  return 20;
}

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function canAttendBoth(first: Performance, second: Performance) {
  const events = [first, second].sort(
    (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
  );

  const travelBuffer = calculateTravelTime(events[0].mainVenue, events[1].mainVenue);
  const assumedDuration = 75; // minutes per performance
  const decompression = 15;
  const gap = parseTimeToMinutes(events[1].time) - parseTimeToMinutes(events[0].time);

  return gap >= assumedDuration + decompression + travelBuffer;
}

