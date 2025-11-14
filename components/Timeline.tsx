'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Heart, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// EventInstance type matching Convex schema
type EventInstance = {
  _id: string;
  _creationTime: number;
  eventId: string;
  date: string;
  dateObj: number;
  startTime: string;
  endTime: string;
  venue: string;
  specificVenue: string;
  title: string;
  artist: string;
  category: string;
  subCategory: string;
};

interface TimelineProps {
  events: EventInstance[];
  selectedEventIds?: string[];
  onToggleEvent?: (eventId: string) => void;
  onEventClick?: (event: EventInstance) => void;
  readOnly?: boolean;
}

export function Timeline({
  events,
  selectedEventIds = [],
  onToggleEvent,
  onEventClick,
  readOnly = false,
}: TimelineProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, EventInstance[]>();
    
    events.forEach((event) => {
      if (!grouped.has(event.date)) {
        grouped.set(event.date, []);
      }
      grouped.get(event.date)!.push(event);
    });

    // Sort events within each date by time
    grouped.forEach((dateEvents) => {
      dateEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    // Convert to array and sort by date
    return Array.from(grouped.entries()).sort((a, b) => {
      const dateA = events.find((e) => e.date === a[0])?.dateObj || 0;
      const dateB = events.find((e) => e.date === b[0])?.dateObj || 0;
      return dateA - dateB;
    });
  }, [events]);

  const dates = eventsByDate.map(([date]) => date);
  const currentDateIndex = selectedDate
    ? dates.indexOf(selectedDate)
    : dates.length > 0
      ? 0
      : -1;

  const currentDate = currentDateIndex >= 0 ? dates[currentDateIndex] : null;
  const currentEvents = currentDate
    ? eventsByDate.find(([date]) => date === currentDate)?.[1] || []
    : [];

  const goToPrevDate = () => {
    if (currentDateIndex > 0) {
      setSelectedDate(dates[currentDateIndex - 1]);
    }
  };

  const goToNextDate = () => {
    if (currentDateIndex < dates.length - 1) {
      setSelectedDate(dates[currentDateIndex + 1]);
    }
  };

  if (events.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 p-12 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-200">No Events Found</h3>
        <p className="mt-2 text-slate-400">
          Try adjusting your filters to see more events
        </p>
      </Card>
    );
  }

  const categoryColor = {
    Dance: 'bg-purple-500/20 border-purple-400/40 text-purple-200',
    Theatre: 'bg-amber-500/20 border-amber-400/40 text-amber-200',
    Music: 'bg-sky-500/20 border-sky-400/40 text-sky-200',
  } as Record<string, string>;

  return (
    <div className="space-y-6">
      {/* Date Navigator */}
      <Card className="border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevDate}
            disabled={currentDateIndex === 0}
            className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:border-amber-300/40 hover:text-amber-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 text-center">
            <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Festival Day
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-50">
              {currentDate || 'Select a date'}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              {currentEvents.length} events
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextDate}
            disabled={currentDateIndex === dates.length - 1}
            className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:border-amber-300/40 hover:text-amber-100 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Date Pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                date === currentDate
                  ? 'border-amber-300/60 bg-amber-400/15 text-amber-100 shadow-[0_10px_30px_-20px_rgba(251,191,36,0.75)]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-200/50 hover:text-amber-100'
              )}
            >
              {date.split('-').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Timeline Grid */}
      <div className="space-y-4">
        {currentEvents.length === 0 ? (
          <Card className="border-white/10 bg-white/5 p-8 text-center">
            <p className="text-slate-400">No events on this date</p>
          </Card>
        ) : (
          currentEvents.map((event) => {
            const isSelected = selectedEventIds.includes(event._id);

            return (
              <Card
                key={event._id}
                className={cn(
                  'group relative overflow-hidden border-white/10 bg-slate-900/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/40 hover:shadow-[0_20px_50px_-25px_rgba(251,191,36,0.55)]',
                  isSelected &&
                    'border-amber-300/70 ring-2 ring-amber-300/50 shadow-[0_20px_60px_-25px_rgba(251,191,36,0.75)]'
                )}
              >
                <div className="relative z-10 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Event Info */}
                    <div
                      className="flex-1 space-y-3 cursor-pointer"
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider',
                            categoryColor[event.category] ||
                              'bg-slate-500/20 border-slate-400/40 text-slate-200'
                          )}
                        >
                          {event.category}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="rounded-full border-white/10 bg-white/10 text-slate-100"
                        >
                          {event.subCategory}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-slate-50">
                          {event.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-300">{event.artist}</p>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <Clock className="h-4 w-4 text-amber-200/80" />
                          <span className="font-medium text-slate-200">
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <MapPin className="h-4 w-4 text-sky-200/80" />
                          <span className="font-medium text-slate-200">
                            {event.venue}
                          </span>
                        </div>
                      </div>

                      {event.specificVenue && (
                        <div className="text-xs text-slate-400">
                          🏛️ {event.specificVenue}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {onToggleEvent && !readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleEvent(event._id);
                        }}
                        className={cn(
                          'h-12 w-12 flex-shrink-0 rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-amber-300/50 hover:text-amber-200',
                          isSelected && 'border-amber-300/70 text-amber-200'
                        )}
                        title={isSelected ? 'Remove from schedule' : 'Add to schedule'}
                      >
                        <Heart
                          className={cn(
                            'h-6 w-6 transition-colors',
                            isSelected && 'fill-amber-300/70 text-amber-200'
                          )}
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

