'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Timeline } from '@/components/Timeline';
import { EventModal } from '@/components/EventModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import { useSession } from '@/lib/use-session';
import {
  Sparkles,
  Heart,
  Menu,
  X,
  CalendarDays,
  MapPin,
  Music,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EventInstance = {
  _id: Id<'eventInstances'>;
  _creationTime: number;
  eventId: Id<'events'>;
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

export default function HomePage() {
  const { sessionId } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventInstance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data from Convex
  const allInstances = useQuery(api.eventInstances.list) || [];
  const scheduleData = useQuery(
    api.schedules.getWithEvents,
    sessionId ? { sessionId } : 'skip'
  );

  const toggleEventMutation = useMutation(api.schedules.toggleEvent);

  // Filter events
  const filteredInstances = useMemo(() => {
    return allInstances.filter((instance) => {
      const matchCategory =
        !selectedCategory || instance.category === selectedCategory;
      const matchVenue = !selectedVenue || instance.venue === selectedVenue;
      const matchDate = !selectedDate || instance.date === selectedDate;
      const matchSearch =
        !searchQuery ||
        instance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instance.artist.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchVenue && matchDate && matchSearch;
    });
  }, [allInstances, selectedCategory, selectedVenue, selectedDate, searchQuery]);

  const selectedEventIds = useMemo(() => {
    return scheduleData?.events?.map((e) => e._id as string) || [];
  }, [scheduleData]);

  // Get unique values for filters
  const uniqueCategories = useMemo(() => {
    return [...new Set(allInstances.map((i) => i.category))].sort();
  }, [allInstances]);

  const uniqueVenues = useMemo(() => {
    return [...new Set(allInstances.map((i) => i.venue))].sort();
  }, [allInstances]);

  const uniqueDates = useMemo(() => {
    const dates = [...new Set(allInstances.map((i) => i.date))];
    return dates.sort((a, b) => {
      const instanceA = allInstances.find((i) => i.date === a);
      const instanceB = allInstances.find((i) => i.date === b);
      return (instanceA?.dateObj || 0) - (instanceB?.dateObj || 0);
    });
  }, [allInstances]);

  const handleToggleEvent = async (eventInstanceId: string) => {
    if (!sessionId) return;
    await toggleEventMutation({
      sessionId,
      eventInstanceId: eventInstanceId as Id<'eventInstances'>,
    });
  };

  const handleEventClick = (event: EventInstance) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedVenue(null);
    setSelectedDate(null);
    setSearchQuery('');
  };

  const hasFilters = selectedCategory || selectedVenue || selectedDate || searchQuery;

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(251,191,36,0.1),transparent_55%),radial-gradient(1200px_circle_at_80%_0%,rgba(56,189,248,0.1),transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.98))]">
        <Card className="border-white/10 bg-white/5 p-8 text-slate-200">
          <Sparkles className="mx-auto h-8 w-8 animate-spin text-amber-500" />
          <p className="mt-4 text-sm">Initializing...</p>
        </Card>
      </div>
    );
  }

  const heroMetrics = [
    {
      label: 'Total Events',
      value: allInstances.length,
      icon: Music,
    },
    {
      label: 'Venues',
      value: uniqueVenues.length,
      icon: MapPin,
    },
    {
      label: 'Festival Days',
      value: uniqueDates.length,
      icon: CalendarDays,
    },
    {
      label: 'In Schedule',
      value: selectedEventIds.length,
      icon: Heart,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(1400px_circle_at_-10%_-10%,rgba(251,191,36,0.12),transparent_55%),radial-gradient(1200px_circle_at_110%_0%,rgba(56,189,248,0.12),transparent_60%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner shadow-black/20">
              <Sparkles className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-100 sm:text-2xl">
                Mauj Planner
              </h1>
              <p className="text-sm text-slate-400">
                Design your cultural crawl with confidence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 sm:flex">
              <Heart className="h-4 w-4 text-amber-300" />
              <span className="font-semibold text-amber-100">
                {selectedEventIds.length}
              </span>
              <span className="text-slate-400">saved</span>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-amber-300/40 hover:text-amber-100 sm:hidden"
              aria-label="Toggle filters"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_100px_-60px_rgba(8,47,73,0.95)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_top,_rgba(255,255,255,0.08),transparent_65%)]"
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-5 lg:max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-200/80">
                Festival Navigator
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl">
                Plan unforgettable nights at Mauj
              </h2>
              <p className="text-base text-slate-300 md:max-w-xl">
                Craft a line-up tailored to your vibe. Combine disciplines, venues, and time
                windows to design a seamless cultural journey.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-lg">
              {heroMetrics.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/60 p-4 shadow-inner shadow-black/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-200">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="relative mt-10 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          {/* Sidebar Filters */}
          <aside
            className={cn(
              'space-y-4 lg:sticky lg:top-32 lg:h-fit',
              sidebarOpen ? 'block' : 'hidden lg:block'
            )}
          >
            <Card className="space-y-6 border-white/10 bg-slate-900/70 p-6 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-300">
                    <SlidersHorizontal className="h-3 w-3 text-amber-200/80" />
                    Refine
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-50">
                      Tailor Your Evening
                    </h3>
                    <p className="text-sm text-slate-400">
                      Layer filters to surface the perfect set of performances.
                    </p>
                  </div>
                </div>
                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-2 rounded-full border border-transparent bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-amber-300/40 hover:text-amber-100"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by artist or performance…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:border-amber-300/60 focus-visible:ring-amber-300/40"
                />
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-200">Discipline</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={!selectedCategory}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </FilterChip>
                  {uniqueCategories.map((cat) => (
                    <FilterChip
                      key={cat}
                      active={selectedCategory === cat}
                      onClick={() =>
                        setSelectedCategory(selectedCategory === cat ? null : cat)
                      }
                    >
                      {cat}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Venue Filter */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-200">Venues</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={!selectedVenue}
                    onClick={() => setSelectedVenue(null)}
                  >
                    All
                  </FilterChip>
                  {uniqueVenues.map((venue) => (
                    <FilterChip
                      key={venue}
                      active={selectedVenue === venue}
                      onClick={() =>
                        setSelectedVenue(selectedVenue === venue ? null : venue)
                      }
                    >
                      <span className="max-w-[12rem] truncate">{venue}</span>
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-200">Festival Dates</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={!selectedDate}
                    onClick={() => setSelectedDate(null)}
                  >
                    All
                  </FilterChip>
                  {uniqueDates.slice(0, 8).map((date) => (
                    <FilterChip
                      key={date}
                      active={selectedDate === date}
                      onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                    >
                      {date.split('-').slice(0, 2).join(' ')}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Filter Count */}
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 shadow-inner shadow-black/10">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-100">
                    {filteredInstances.length} match
                    {filteredInstances.length === 1 ? '' : 'es'}
                  </span>
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    {hasFilters ? 'Filters active' : 'Showing all'}
                  </span>
                </div>
              </div>
            </Card>
          </aside>

          {/* Timeline & Schedule Section */}
          <section className="space-y-6">
            <Tabs defaultValue="timeline" className="space-y-6">
              <TabsList className="flex-1">
                <TabsTrigger value="timeline" className="flex-1 gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex-1 gap-2">
                  <Heart className="h-4 w-4" />
                  My Schedule
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline">
                <Timeline
                  events={filteredInstances as any}
                  selectedEventIds={selectedEventIds}
                  onToggleEvent={(eventId) => handleToggleEvent(eventId)}
                  onEventClick={(event) => handleEventClick(event as any)}
                />
              </TabsContent>

              <TabsContent value="schedule">
                {scheduleData?.events && scheduleData.events.length > 0 ? (
                  <Timeline
                    events={scheduleData.events as any}
                    selectedEventIds={selectedEventIds}
                    onToggleEvent={handleToggleEvent}
                    onEventClick={handleEventClick}
                  />
                ) : (
                  <Card className="border-white/10 bg-white/5 p-12 text-center">
                    <Heart className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                    <h3 className="text-xl font-semibold text-slate-200">
                      No Events in Schedule
                    </h3>
                    <p className="mt-2 text-slate-400">
                      Add events by clicking the heart icon on any event
                    </p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSelected={selectedEvent ? selectedEventIds.includes(selectedEvent._id) : false}
        onToggle={
          selectedEvent ? () => handleToggleEvent(selectedEvent._id) : undefined
        }
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-slate-300">
            <p className="font-medium text-slate-100">🎭 Mauj Planner</p>
            <p className="mt-1 text-xs text-slate-400">
              Curated for {new Date().getFullYear()} • Dark canvas, vibrant experiences
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        active
          ? 'border-amber-300/60 bg-amber-400/15 text-amber-100 shadow-[0_10px_30px_-20px_rgba(251,191,36,0.75)]'
          : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-200/50 hover:text-amber-100'
      )}
    >
      {children}
    </button>
  );
}

