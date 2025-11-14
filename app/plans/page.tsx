'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Calendar,
  Trash2,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function PlansPage() {
  const { user, isSignedIn } = useUser();
  const [selectedPlans, setSelectedPlans] = useState<Id<'savedPlans'>[]>([]);
  const [expandedPlan, setExpandedPlan] = useState<Id<'savedPlans'> | null>(null);

  const savedPlans = useQuery(api.planner.getSavedPlans) || [];
  const deletePlan = useMutation(api.planner.deletePlan);

  const expandedPlanData = useQuery(
    api.planner.getPlanWithEvents,
    expandedPlan ? { planId: expandedPlan } : 'skip'
  );

  const handleDeletePlan = async (planId: Id<'savedPlans'>) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        await deletePlan({ planId });
        // Query will automatically refresh due to Convex reactivity
      } catch (error) {
        console.error('Failed to delete plan:', error);
        alert('Failed to delete plan. Please try again.');
      }
    }
  };

  const togglePlanSelection = (planId: Id<'savedPlans'>) => {
    setSelectedPlans((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(251,191,36,0.1),transparent_55%),radial-gradient(1200px_circle_at_80%_0%,rgba(56,189,248,0.1),transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.98))]">
        <Card className="border-white/10 bg-white/5 p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-6 text-2xl font-semibold text-slate-50">
            Sign In Required
          </h1>
          <p className="mt-2 text-slate-400">
            You need to sign in to view your saved plans
          </p>
          <Link href="/">
            <Button className="mt-6 gap-2 rounded-xl border border-amber-300/40 bg-amber-500/20 px-6 py-2 font-semibold text-amber-100 hover:bg-amber-500/30">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </Link>
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
            <Link href="/">
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-amber-300/40 hover:text-amber-100">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-100 sm:text-2xl">
                My Plans
              </h1>
              <p className="text-sm text-slate-400">
                Compare and manage your generated schedules
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {savedPlans.length === 0 ? (
          <Card className="border-white/10 bg-white/5 p-12 text-center">
            <Sparkles className="mx-auto h-16 w-16 text-slate-400" />
            <h2 className="mt-6 text-2xl font-semibold text-slate-50">
              No Plans Yet
            </h2>
            <p className="mt-2 text-slate-400">
              Use the AI Planner to generate your perfect festival schedule
            </p>
            <Link href="/">
              <Button className="mt-6 gap-2 rounded-xl border border-amber-300/40 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2 font-semibold text-white hover:from-amber-600 hover:to-amber-700">
                <Sparkles className="h-4 w-4" />
                Create Plan
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <Card className="border-white/10 bg-white/5 p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Total Plans
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-50">
                        {savedPlans.length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-amber-300" />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Selected
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-50">
                        {selectedPlans.length}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-300" />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Best Score
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-50">
                        {Math.max(...savedPlans.map((p) => p.score || 0))}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-300" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Plans Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedPlans.map((plan) => {
                const isSelected = selectedPlans.includes(plan._id);
                const isExpanded = expandedPlan === plan._id;

                return (
                  <Card
                    key={plan._id}
                    className={cn(
                      'border-white/10 bg-slate-900/70 p-6 transition-all',
                      isSelected && 'ring-2 ring-amber-300/50',
                      isExpanded && 'md:col-span-2 lg:col-span-3'
                    )}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-slate-50">
                              {plan.name}
                            </h3>
                            {plan.planType === 'optimized' && (
                              <span className="rounded-full border border-amber-300/40 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">
                                Optimized
                              </span>
                            )}
                          </div>
                          {plan.description && (
                            <p className="mt-1 text-sm text-slate-400">
                              {plan.description}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => togglePlanSelection(plan._id)}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg border transition',
                            isSelected
                              ? 'border-amber-300/60 bg-amber-400/20 text-amber-100'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:border-amber-300/40'
                          )}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="h-4 w-4 text-amber-300" />
                          <span className="font-semibold">
                            {plan.schedule?.selectedEventInstances.length || 0}
                          </span>
                          <span className="text-slate-400">events</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <TrendingUp className="h-4 w-4 text-green-300" />
                          <span className="font-semibold">{plan.score || 0}</span>
                          <span className="text-slate-400">score</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            setExpandedPlan(isExpanded ? null : plan._id)
                          }
                          variant="ghost"
                          className="flex-1 gap-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:border-amber-300/40 hover:text-amber-100"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {isExpanded ? 'Collapse' : 'View Details'}
                        </Button>
                        <Button
                          onClick={() => handleDeletePlan(plan._id)}
                          variant="ghost"
                          className="gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 text-red-300 hover:border-red-400/40 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && expandedPlanData && (
                        <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                          <h4 className="font-semibold text-slate-200">Events</h4>
                          <div className="space-y-2">
                            {expandedPlanData.events.map((event: any) => (
                              <div
                                key={event._id}
                                className="rounded-lg border border-white/10 bg-white/5 p-3"
                              >
                                <p className="font-semibold text-slate-100">
                                  {event.title}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {event.date} • {event.startTime} - {event.endTime}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Comparison View */}
            {selectedPlans.length >= 2 && (
              <Card className="border-amber-300/40 bg-gradient-to-r from-amber-500/10 to-amber-600/10 p-6">
                <h3 className="text-xl font-semibold text-slate-50">
                  Plan Comparison
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Comparing {selectedPlans.length} plans side by side
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {selectedPlans.map((planId) => {
                    const plan = savedPlans.find((p) => p._id === planId);
                    if (!plan) return null;

                    return (
                      <div
                        key={planId}
                        className="rounded-xl border border-white/10 bg-slate-900/70 p-4"
                      >
                        <h4 className="font-semibold text-slate-100">
                          {plan.name}
                        </h4>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Events:</span>
                            <span className="font-semibold text-slate-100">
                              {plan.schedule?.selectedEventInstances.length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Score:</span>
                            <span className="font-semibold text-slate-100">
                              {plan.score || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Type:</span>
                            <span className="text-xs uppercase tracking-wider text-amber-200">
                              {plan.planType.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

