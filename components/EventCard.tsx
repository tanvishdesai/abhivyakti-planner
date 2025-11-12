'use client';

import { Performance } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, MapPin, Clock, Music, Drama, Zap } from "lucide-react";
import { useEventStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Performance;
  isSelected?: boolean;
  onSelect?: (event: Performance) => void;
}

export function EventCard({ event, isSelected, onSelect }: EventCardProps) {
  const toggleEvent = useEventStore((state) => state.toggleEvent);
  const store_isSelected = useEventStore((state) =>
    state.isEventSelected(event.id)
  );

  const finalIsSelected = isSelected !== undefined ? isSelected : store_isSelected;

  const categoryIcon = {
    Dance: <Zap className="w-4 h-4" />,
    Theatre: <Drama className="w-4 h-4" />,
    Music: <Music className="w-4 h-4" />,
  };

  const categoryColor = {
    Dance: "dance",
    Theatre: "theatre",
    Music: "music",
  } as Record<string, "dance" | "theatre" | "music" | "default">;

  const categoryAccent: Record<string, string> = {
    Dance: "bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.35),_transparent_65%)]",
    Theatre: "bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.3),_transparent_65%)]",
    Music: "bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_70%)]",
  };

  const handleToggle = () => {
    toggleEvent({ id: event.id, type: "performance" });
    onSelect?.(event);
  };

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden border-white/10 bg-slate-900/70 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-[0_30px_70px_-35px_rgba(251,191,36,0.65)]",
        finalIsSelected &&
          "border-amber-300/70 ring-2 ring-amber-300/50 shadow-[0_30px_80px_-35px_rgba(251,191,36,0.85)]"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-80",
          categoryAccent[event.category] ?? "bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.2),_transparent_70%)]"
        )}
        aria-hidden="true"
      />

      <CardHeader className="relative z-10 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge
                variant={categoryColor[event.category] || "default"}
                className="rounded-full border-transparent bg-white/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-white/90 shadow-sm"
              >
                <span className="flex items-center gap-1">
                  {categoryIcon[event.category as keyof typeof categoryIcon]}
                  {event.category}
                </span>
              </Badge>
              <Badge variant="secondary" className="rounded-full border-white/10 bg-white/10 text-slate-100/90">
                {event.subCategory}
              </Badge>
            </div>

            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold leading-tight text-slate-50">
                {event.eventName}
              </CardTitle>
              <CardDescription className="text-sm text-slate-300">
                {event.artist}
              </CardDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            aria-pressed={finalIsSelected}
            className={cn(
              "relative z-10 h-10 w-10 rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-amber-300/50 hover:text-amber-200",
              finalIsSelected && "border-amber-300/70 text-amber-200"
            )}
            title={finalIsSelected ? "Remove from schedule" : "Add to schedule"}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-colors",
                finalIsSelected && "fill-amber-300/70 text-amber-200"
              )}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 mt-6 flex flex-1 flex-col space-y-4">
        <div className="flex flex-wrap gap-3 text-sm text-slate-200">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Clock className="w-4 h-4 text-amber-200/80" />
            <span className="font-medium">{event.time}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <MapPin className="w-4 h-4 text-sky-200/80" />
            <span className="font-medium">{event.mainVenue}</span>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-inner shadow-black/10">
          <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span>Stage</span>
            <span>Date</span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3 text-base font-medium text-slate-100">
            <span>{event.specificVenue}</span>
            <span className="rounded-full border border-amber-200/40 bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-100">
              {event.date}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

