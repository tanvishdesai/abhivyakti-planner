'use client';

import { Performance } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useEventStore } from "@/lib/store";
import { Trash2, Download } from "lucide-react";
import { useMemo } from "react";

interface MyScheduleProps {
  allPerformances: Performance[];
}

export function MySchedule({ allPerformances }: MyScheduleProps) {
  const selectedEvents = useEventStore((state) => state.selectedEvents);
  const toggleEvent = useEventStore((state) => state.toggleEvent);

  const selectedPerformances = useMemo(() => {
    return allPerformances.filter((p) =>
      selectedEvents.some((e) => e.id === p.id && e.type === "performance")
    );
  }, [selectedEvents, allPerformances]);

  const groupedByDate = useMemo(() => {
    const grouped = new Map<string, Performance[]>();
    selectedPerformances.forEach((p) => {
      if (!grouped.has(p.date)) {
        grouped.set(p.date, []);
      }
      grouped.get(p.date)!.push(p);
    });
    return new Map(
      Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    );
  }, [selectedPerformances]);

  const exportSchedule = () => {
    const csv = [
      ["Event", "Artist", "Date", "Time", "Venue", "Category"].join(","),
      ...selectedPerformances.map((p) =>
        [
          `"${p.eventName}"`,
          `"${p.artist}"`,
          p.date,
          p.time,
          `"${p.mainVenue}"`,
          p.category,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-schedule.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (selectedPerformances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📋 My Schedule</CardTitle>
          <CardDescription>Your selected events</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">
            No events selected yet. Add events by clicking the heart icon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>📋 My Schedule</CardTitle>
              <CardDescription>
                {selectedPerformances.length} event{selectedPerformances.length > 1 ? "s" : ""} selected
              </CardDescription>
            </div>
            {selectedPerformances.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportSchedule}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {Array.from(groupedByDate.entries()).map(([date, events]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="text-lg">{date}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/10"
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className="font-semibold">{event.eventName}</h4>
                        <p className="text-sm text-slate-300">{event.artist}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={
                            event.category === "Dance"
                              ? "dance"
                              : event.category === "Theatre"
                                ? "theatre"
                                : "music"
                          }
                          className="text-xs"
                        >
                          {event.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {event.time}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-300">
                        📍 {event.mainVenue}
                        <br />
                        🏛️ {event.specificVenue}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        toggleEvent({ id: event.id, type: "performance" })
                      }
                      className="flex-shrink-0 rounded-full border border-transparent text-red-300 transition hover:border-red-300/40 hover:text-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

