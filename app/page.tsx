'use client';

import { useEffect, useState, useMemo } from 'react';
import { loadPerformances } from '@/lib/data';
import { Performance } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import { EventFilters } from '@/components/EventFilters';
import { ComboFinder } from '@/components/ComboFinder';
import { MySchedule } from '@/components/MySchedule';
import { Statistics } from '@/components/Statistics';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import { Card } from '@/components/ui/card';
import { useEventStore } from '@/lib/store';
import {
  Music,
  Theater,
  Sparkles,
  BarChart3,
  Heart,
  Menu,
  X,
  CalendarDays,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [filteredPerformances, setFilteredPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedEvents = useEventStore((state) => state.selectedEvents);

  const selectedPerformances = useMemo(() => {
    return performances.filter((p) =>
      selectedEvents.some((e) => e.id === p.id && e.type === 'performance')
    );
  }, [selectedEvents, performances]);

  const heroMetrics = useMemo(() => {
    const uniqueVenues = new Set(performances.map((p) => p.mainVenue)).size;
    const festivalNights = new Set(performances.map((p) => p.date)).size;

    return [
      {
        label: 'Performances',
        value: performances.length,
        icon: Music,
      },
      {
        label: 'Venues',
        value: uniqueVenues,
        icon: MapPin,
      },
      {
        label: 'Festival Nights',
        value: festivalNights,
        icon: CalendarDays,
      },
      {
        label: 'In Your Schedule',
        value: selectedPerformances.length,
        icon: Heart,
      },
    ];
  }, [performances, selectedPerformances]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const perfs = await loadPerformances();
        setPerformances(perfs);
        setFilteredPerformances(perfs);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(251,191,36,0.1),transparent_55%),radial-gradient(1200px_circle_at_80%_0%,rgba(56,189,248,0.1),transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.98))]">
        <Card className="border-white/10 bg-white/5 p-8 text-slate-200">
          <div className="flex flex-col items-center gap-4">
            <Sparkles className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm text-slate-300">Loading your Mauj planner…</p>
          </div>
        </Card>
      </div>
    );
  }

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
                {selectedPerformances.length}
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
                      <p className="mt-2 text-2xl font-semibold text-slate-50">
                        {value}
                      </p>
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

        <div className="relative mt-10 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          {/* Sidebar */}
          <aside
            className={cn(
              'space-y-4 lg:sticky lg:top-32 lg:h-fit',
              sidebarOpen ? 'block' : 'hidden lg:block'
            )}
          >
            <EventFilters
              performances={performances}
              onFiltered={setFilteredPerformances}
            />
            <Card className="border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-200" />
                <h3 className="text-base font-semibold text-slate-100">
                  Curator’s Tip
                </h3>
              </div>
              <p className="mt-3 text-sm">
                Anchor yourself at a single venue per night for smooth transitions, then use the
                combo tab to stack complementary performances.
              </p>
            </Card>
          </aside>

          {/* Main Content Area */}
          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Discover
                </p>
                <h3 className="text-2xl font-semibold text-slate-50">
                  Explore the festival universe
                </h3>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 shadow-inner shadow-black/10">
                <Sparkles className="h-4 w-4 text-amber-200" />
                <span className="font-medium text-slate-100">
                  {filteredPerformances.length} events in view
                </span>
              </div>
            </div>

            <Tabs defaultValue="browse" className="space-y-6">
              <TabsList className="flex-1 flex-wrap justify-start gap-2 sm:flex-nowrap">
                <TabsTrigger
                  value="browse"
                  className="flex-1 gap-2 text-xs font-semibold sm:min-w-[150px] sm:gap-3 sm:text-sm"
                >
                  <Music className="h-4 w-4" />
                  Browse
                </TabsTrigger>
                <TabsTrigger
                  value="combos"
                  className="flex-1 gap-2 text-xs font-semibold sm:min-w-[150px] sm:gap-3 sm:text-sm"
                >
                  <Theater className="h-4 w-4" />
                  Combos
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  className="flex-1 gap-2 text-xs font-semibold sm:min-w-[150px] sm:gap-3 sm:text-sm"
                >
                  <Heart className="h-4 w-4" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="flex-1 gap-2 text-xs font-semibold sm:min-w-[150px] sm:gap-3 sm:text-sm"
                >
                  <BarChart3 className="h-4 w-4" />
                  Stats
                </TabsTrigger>
              </TabsList>

              {/* Browse Tab */}
              <TabsContent value="browse" className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredPerformances.length > 0 ? (
                    filteredPerformances.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))
                  ) : (
                    <Card className="col-span-full p-10 text-center text-slate-300">
                      <div className="flex flex-col items-center gap-3">
                        <Sparkles className="h-6 w-6 text-amber-200" />
                        <p>No events found matching your current filters.</p>
                        <p className="text-sm text-slate-500">
                          Reset categories or widen your date range to uncover more performances.
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Combos Tab */}
              <TabsContent value="combos">
                <ComboFinder performances={filteredPerformances} />
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule">
                <MySchedule allPerformances={performances} />
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats">
                <Statistics
                  performances={filteredPerformances}
                  selectedPerformances={selectedPerformances}
                />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

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
