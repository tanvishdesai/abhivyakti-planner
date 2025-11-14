'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Timeline } from '@/components/Timeline';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SharedSchedulePageProps {
  params: {
    token: string;
  };
}

export default function SharedSchedulePage({ params }: SharedSchedulePageProps) {
  const scheduleData = useQuery(api.schedules.getByShareToken, {
    shareToken: params.token,
  });

  if (scheduleData === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(251,191,36,0.1),transparent_55%),radial-gradient(1200px_circle_at_80%_0%,rgba(56,189,248,0.1),transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.98))]">
        <Card className="border-white/10 bg-white/5 p-8 text-slate-200">
          <Sparkles className="mx-auto h-8 w-8 animate-spin text-amber-500" />
          <p className="mt-4 text-sm">Loading schedule...</p>
        </Card>
      </div>
    );
  }

  if (scheduleData === null || !scheduleData.schedule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(251,191,36,0.1),transparent_55%),radial-gradient(1200px_circle_at_80%_0%,rgba(56,189,248,0.1),transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.98))]">
        <Card className="border-white/10 bg-white/5 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10">
            <Heart className="h-8 w-8 text-red-300" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-slate-50">
            Schedule Not Found
          </h1>
          <p className="mt-2 text-slate-400">
            This schedule doesn't exist or is no longer being shared.
          </p>
          <Link href="/">
            <Button className="mt-6 gap-2 rounded-xl border border-amber-300/40 bg-amber-500/20 px-6 py-2 font-semibold text-amber-100 hover:bg-amber-500/30">
              <ExternalLink className="h-4 w-4" />
              Create Your Own
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { schedule, events } = scheduleData;

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
                {schedule.name || 'Shared Festival Schedule'}
              </h1>
              <p className="text-sm text-slate-400">
                {events.length} event{events.length !== 1 ? 's' : ''} • Shared by a festival-goer
              </p>
            </div>
          </div>

          <Link href="/">
            <Button className="gap-2 rounded-xl border border-amber-300/40 bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-500/30">
              <ExternalLink className="h-4 w-4" />
              Create My Own
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_100px_-60px_rgba(8,47,73,0.95)] mb-10">
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">
              <Heart className="h-4 w-4" />
              Shared Schedule
            </div>
            <h2 className="mt-6 text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl">
              Someone's Perfect Festival Plan
            </h2>
            <p className="mt-4 text-base text-slate-300">
              This schedule was carefully crafted and shared with you. Get inspired or create your own!
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section>
          {events.length > 0 ? (
            <div id="shared-schedule-timeline">
              <Timeline
                events={events as any}
                selectedEventIds={[]}
                onToggleEvent={() => {}}
                onEventClick={() => {}}
                readOnly
              />
            </div>
          ) : (
            <Card className="border-white/10 bg-white/5 p-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <h3 className="text-xl font-semibold text-slate-200">
                No Events in This Schedule
              </h3>
              <p className="mt-2 text-slate-400">
                This schedule appears to be empty.
              </p>
            </Card>
          )}
        </section>
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

