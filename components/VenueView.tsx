'use client';

import { Performance } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useMemo } from "react";
import { MapPin } from "lucide-react";

interface VenueViewProps {
  performances: Performance[];
}

export function VenueView({ performances }: VenueViewProps) {
  const venueData = useMemo(() => {
    const venues = new Map<string, Map<string, Performance[]>>();

    performances.forEach((p) => {
      if (!venues.has(p.mainVenue)) {
        venues.set(p.mainVenue, new Map());
      }

      const dateMap = venues.get(p.mainVenue)!;
      if (!dateMap.has(p.date)) {
        dateMap.set(p.date, []);
      }
      dateMap.get(p.date)!.push(p);
    });

    return venues;
  }, [performances]);

  return (
    <div className="space-y-4">
      {Array.from(venueData.entries()).map(([venue, dateMap]) => (
        <Card key={venue}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              <div>
                <CardTitle>{venue}</CardTitle>
                <CardDescription>
                  {Array.from(dateMap.keys()).length} dates •{" "}
                  {Array.from(dateMap.values()).reduce((acc, events) => acc + events.length, 0)}{" "}
                  events
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(dateMap.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([date, events]) => (
                  <div key={date} className="space-y-2">
                    <h4 className="font-semibold text-sm">{date}</h4>
                    <div className="space-y-2">
                      {events
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((event) => (
                          <div
                            key={event.id}
                            className="p-2 bg-slate-900/50 rounded border border-slate-800 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{event.eventName}</p>
                                <p className="text-slate-400 truncate">{event.artist}</p>
                              </div>
                              <span className="text-slate-400 flex-shrink-0">{event.time}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {event.category}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

