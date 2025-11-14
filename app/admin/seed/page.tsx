'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadPerformances } from '@/lib/data';
import { Performance } from '@/lib/types';
import { Sparkles, Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function SeedPage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const seedEvents = useMutation(api.seed.seedEvents);
  const getSeedStatus = useMutation(api.seed.getSeedStatus);

  useEffect(() => {
    const loadData = async () => {
      try {
        const perfs = await loadPerformances();
        setPerformances(perfs);
      } catch (error) {
        console.error('Error loading performances:', error);
      }
    };
    loadData();
  }, []);

  const handleSeed = async () => {
    setLoading(true);
    setStatus({ type: 'loading', message: 'Importing data...' });

    try {
      const result = await seedEvents({
        performances: performances.map((p) => ({
          id: p.id,
          eventName: p.eventName,
          artist: p.artist,
          category: p.category,
          subCategory: p.subCategory,
          date: p.date,
          time: p.time,
          mainVenue: p.mainVenue,
          specificVenue: p.specificVenue,
        })),
      });

      setStatus({
        type: 'success',
        message: `Successfully created ${result.eventsCreated} events from ${result.totalPerformances} performances!`,
      });
    } catch (error) {
      console.error('Error seeding data:', error);
      setStatus({
        type: 'error',
        message: `Failed to seed data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const result = await getSeedStatus();
      const statusText = `Database contains: ${result.eventsCount} events, ${result.instancesCount} instances, ${result.schedulesCount} schedules`;
      setStatus({
        type: result.isSeeded ? 'success' : 'idle',
        message: statusText,
      });
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(251,191,36,0.1),transparent_55%),radial-gradient(1200px_circle_at_80%_0%,rgba(56,189,248,0.1),transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.98))]">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner shadow-black/20">
              <Database className="h-8 w-8 text-amber-300" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-50">Data Seeding</h1>
          <p className="mt-2 text-slate-400">
            Import event data from CSV files into Convex database
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-300" />
                Import Status
              </CardTitle>
              <CardDescription>
                Loaded {performances.length} performances from CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">CSV Performances:</span>
                    <span className="font-semibold text-slate-100">
                      {performances.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unique Categories:</span>
                    <span className="font-semibold text-slate-100">
                      {new Set(performances.map((p) => p.category)).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unique Venues:</span>
                    <span className="font-semibold text-slate-100">
                      {new Set(performances.map((p) => p.mainVenue)).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Festival Dates:</span>
                    <span className="font-semibold text-slate-100">
                      {new Set(performances.map((p) => p.date)).size}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSeed}
                  disabled={loading || performances.length === 0}
                  className="flex-1 gap-2 bg-amber-500 text-slate-900 hover:bg-amber-400"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      Seed Database
                    </>
                  )}
                </Button>
                <Button
                  onClick={checkStatus}
                  variant="outline"
                  className="gap-2 border-white/10 bg-white/5 text-slate-100 hover:border-amber-300/40"
                >
                  Check Status
                </Button>
              </div>
            </CardContent>
          </Card>

          {status.message && (
            <Card
              className={`border-white/10 ${
                status.type === 'success'
                  ? 'bg-green-500/10'
                  : status.type === 'error'
                    ? 'bg-red-500/10'
                    : 'bg-white/5'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {status.type === 'success' && (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-400" />
                  )}
                  {status.type === 'error' && (
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                  )}
                  {status.type === 'loading' && (
                    <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-amber-400" />
                  )}
                  <p className="text-sm text-slate-200">{status.message}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <ol className="list-inside list-decimal space-y-2">
                <li>Make sure you have run <code className="rounded bg-white/10 px-2 py-0.5 text-amber-300">npx convex dev</code></li>
                <li>Your CSV data is loaded from <code className="rounded bg-white/10 px-2 py-0.5 text-sky-300">public/data/performances.csv</code></li>
                <li>Click Check Status to see current database state</li>
                <li>Click Seed Database to import all events</li>
                <li>Events will be deduplicated by title, artist, venue, and time</li>
                <li>Event instances will be created for each date</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = '/')}
            className="gap-2 text-slate-400 hover:text-slate-100"
          >
            ← Back to App
          </Button>
        </div>
      </div>
    </div>
  );
}

