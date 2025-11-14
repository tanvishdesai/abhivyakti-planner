'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, Wand2, Sparkles, Calendar, MapPin, Layers, CheckCircle2, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated?: () => void; // callback after a plan is generated or saved
}

export function PlannerModal({ isOpen, onClose, onPlanGenerated }: PlannerModalProps) {
  const [step, setStep] = useState<'preferences' | 'generating' | 'results'>('preferences');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [maxEventsPerDay, setMaxEventsPerDay] = useState<number>(4);
  const [allowVenueSwitches, setAllowVenueSwitches] = useState<boolean>(true);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  // Convex handlers
  const allInstances = useQuery(api.eventInstances.list) || [];
  const generatePreview = useMutation(api.planner.generateSchedulePreview);
  const saveSchedule = useMutation(api.planner.saveSchedule);

  const uniqueCategories = useMemo(() => {
    return [...new Set(allInstances.map((i) => i.category))].sort();
  }, [allInstances]);

  const uniqueDates = useMemo(() => {
    const dates = [...new Set(allInstances.map((i) => i.date))];
    // sort by dateObj if available
    return dates.sort((a, b) => {
      const ia = allInstances.find((i) => i.date === a);
      const ib = allInstances.find((i) => i.date === b);
      return (ia?.dateObj || 0) - (ib?.dateObj || 0);
    });
  }, [allInstances]);

  const uniqueVenues = useMemo(() => {
    return [...new Set(allInstances.map((i) => i.venue))].sort();
  }, [allInstances]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const toggleVenue = (venue: string) => {
    setSelectedVenues((prev) =>
      prev.includes(venue) ? prev.filter((v) => v !== venue) : [...prev, venue]
    );
  };

  const handleGenerate = async () => {
    if (selectedCategories.length === 0 || selectedDates.length === 0) {
      alert('Please select at least one category and one date');
      return;
    }

    console.log('Starting plan generation with:', {
      categories: selectedCategories,
      dates: selectedDates,
      venues: selectedVenues,
      allInstancesCount: allInstances.length,
    });

    setStep('generating');

    try {
      const result = await generatePreview({
        preferredCategories: selectedCategories,
        availableDates: selectedDates,
        maxEventsPerDay,
        venuePreferences: selectedVenues.length > 0 ? selectedVenues : undefined,
        allowVenueSwitches,
        generateAlternatives: true,
      });

      console.log('✅ Plan generated successfully!');
      console.log('📊 Optimized schedule count:', result.optimizedSchedule?.length || 0);
      console.log('📊 Alternatives count:', result.alternatives?.length || 0);
      
      if (result.optimizedSchedule?.length > 0) {
        console.log('🎭 First event:', result.optimizedSchedule[0]);
      }

      if (!result.optimizedSchedule || result.optimizedSchedule.length === 0) {
        console.warn('⚠️ WARNING: No events selected in optimized schedule');
        console.log('Full result:', result);
      }

      setGeneratedPlan(result);
      setStep('results');
      onPlanGenerated?.();
    } catch (error) {
      console.error('Error generating plan:', error);
      alert(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep('preferences');
    }
  };

  // Save a given plan (optimized or one of the alternatives)
  const handleSavePlan = async (planEvents: any[], planName?: string) => {
    if (!planEvents || planEvents.length === 0) {
      alert('Nothing to save for this plan.');
      return;
    }

    const ids = planEvents.map((e) => e._id);
    const name = planName || 'My Saved Plan';

    try {
      setSavingPlanId(name);
      await saveSchedule({ name, eventInstanceIds: ids });
      alert('Plan saved successfully!');
      // Reset state
      setStep('preferences');
      setGeneratedPlan(null);
      setSelectedCategories([]);
      setSelectedDates([]);
      setSelectedVenues([]);
      // Call the callback to notify parent (this will trigger query refresh on plans page)
      onPlanGenerated?.();
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save plan. Make sure you are logged in.');
    } finally {
      setSavingPlanId(null);
    }
  };

  const handleClose = () => {
    setStep('preferences');
    setGeneratedPlan(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden border-white/10 bg-slate-900/95 backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-amber-600/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-500/20">
                <Wand2 className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-50">AI Planner</h2>
                <p className="text-sm text-slate-400">
                  Preview a generated plan and save only what you like
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-amber-300/40 hover:text-amber-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="mt-6 flex items-center gap-3">
            <StepIndicator active={step === 'preferences'} completed={step !== 'preferences'}>
              1
            </StepIndicator>
            <div className="h-0.5 flex-1 bg-white/10" />
            <StepIndicator active={step === 'generating'} completed={step === 'results'}>
              2
            </StepIndicator>
            <div className="h-0.5 flex-1 bg-white/10" />
            <StepIndicator active={step === 'results'}>3</StepIndicator>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {step === 'preferences' && (
            <div className="space-y-6">
              {/* Requirements/Needs Section */}
              <div className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-100">
                  <CheckCircle2 className="h-5 w-5" />
                  What You Need
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      selectedCategories.length > 0 ? "bg-green-400" : "bg-red-400"
                    )} />
                    <span className={selectedCategories.length > 0 ? "text-green-200" : "text-red-200"}>
                      {selectedCategories.length > 0 
                        ? `Selected ${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'}`
                        : "Select at least one category"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      selectedDates.length > 0 ? "bg-green-400" : "bg-red-400"
                    )} />
                    <span className={selectedDates.length > 0 ? "text-green-200" : "text-red-200"}>
                      {selectedDates.length > 0 
                        ? `Selected ${selectedDates.length} date${selectedDates.length === 1 ? '' : 's'}`
                        : "Select at least one date"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-amber-200">
                      Venue selection is optional
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-amber-300" />
                  <h3 className="text-lg font-semibold text-slate-50">
                    Preferred Categories
                  </h3>
                </div>
                <p className="text-sm text-slate-400">
                  Select the types of performances you're most interested in
                </p>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={cn(
                        'rounded-xl border px-4 py-2 text-sm font-semibold transition',
                        selectedCategories.includes(category)
                          ? 'border-amber-300/60 bg-amber-400/15 text-amber-100'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-200/50'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-300" />
                  <h3 className="text-lg font-semibold text-slate-50">Available Dates</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Choose which days you can attend the festival
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {uniqueDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => toggleDate(date)}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                        selectedDates.includes(date)
                          ? 'border-amber-300/60 bg-amber-400/15 text-amber-100'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-200/50'
                      )}
                    >
                      {date.split('-').slice(1).join('-')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Venues */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-300" />
                  <h3 className="text-lg font-semibold text-slate-50">
                    Venue Preferences (Optional)
                  </h3>
                </div>
                <p className="text-sm text-slate-400">
                  Select preferred venues, or leave empty for all venues
                </p>
                <div className="flex flex-wrap gap-2">
                  {uniqueVenues.map((venue) => (
                    <button
                      key={venue}
                      onClick={() => toggleVenue(venue)}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                        selectedVenues.includes(venue)
                          ? 'border-amber-300/60 bg-amber-400/15 text-amber-100'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-200/50'
                      )}
                    >
                      {venue}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-semibold text-slate-50">Advanced Options</h3>

                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Max events per day</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={maxEventsPerDay}
                      onChange={(e) => setMaxEventsPerDay(parseInt(e.target.value) || 1)}
                      className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-center text-sm text-slate-100"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Allow venue switches</span>
                    <button
                      onClick={() => setAllowVenueSwitches(!allowVenueSwitches)}
                      className={cn(
                        'relative h-6 w-11 rounded-full transition',
                        allowVenueSwitches ? 'bg-amber-500' : 'bg-slate-600'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-1 h-4 w-4 rounded-full bg-white transition',
                          allowVenueSwitches ? 'left-6' : 'left-1'
                        )}
                      />
                    </button>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-16 w-16 animate-spin text-amber-400" />
              <h3 className="mt-6 text-xl font-semibold text-slate-50">
                Crafting Your Perfect Schedule
              </h3>
              <p className="mt-2 text-center text-slate-400">
                Analyzing {allInstances.length} events to create your optimal plan...
              </p>
            </div>
          )}

          {step === 'results' && generatedPlan && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-amber-300" />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-50">
                      Your Plans Are Ready!
                    </h3>
                    <p className="text-sm text-slate-400">
                      We've generated {1 + (generatedPlan.alternatives?.length || 0)} optimized
                      schedules for you (preview mode)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <PlanCardWithSave
                  title="Optimized Plan"
                  description="Best overall schedule based on your preferences"
                  events={generatedPlan.optimizedSchedule || []}
                  onSave={() => handleSavePlan(generatedPlan.optimizedSchedule, 'Optimized Plan')}
                  savingName={savingPlanId}
                  type="primary"
                />

                {(generatedPlan.alternatives || []).map((alt: any, index: number) => (
                  <PlanCardWithSave
                    key={index}
                    title={`Alternative ${index + 1}`}
                    description="Different approach with similar quality"
                    events={alt}
                    onSave={() => handleSavePlan(alt, `Alternative ${index + 1}`)}
                    savingName={savingPlanId}
                    type="alternative"
                  />
                ))}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">
                  💡 <strong>Tip:</strong> Preview plans first — only saved plans are persisted to your account.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-slate-900/90 p-6">
          {step === 'preferences' && (
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleClose}
                variant="ghost"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-slate-300 hover:border-amber-300/40 hover:text-amber-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                className="gap-2 rounded-xl border border-amber-300/40 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2 font-semibold text-white hover:from-amber-600 hover:to-amber-700"
              >
                <Sparkles className="h-4 w-4" />
                Generate Plans
              </Button>
            </div>
          )}

          {step === 'results' && (
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleClose}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-slate-300 hover:border-amber-300/40 hover:text-amber-100"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StepIndicator({
  active,
  completed,
  children,
}: {
  active: boolean;
  completed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition',
        active && !completed && 'border-amber-400 bg-amber-500/20 text-amber-100',
        completed && 'border-green-400 bg-green-500/20 text-green-100',
        !active && !completed && 'border-white/20 bg-white/5 text-slate-400'
      )}
    >
      {completed ? <CheckCircle2 className="h-5 w-5" /> : children}
    </div>
  );
}

function PlanCardWithSave({
  title,
  description,
  events,
  onSave,
  savingName,
  type,
}: {
  title: string;
  description: string;
  events: any[];
  onSave: () => void;
  savingName: string | null;
  type: 'primary' | 'alternative';
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 transition',
        type === 'primary'
          ? 'border-amber-300/40 bg-gradient-to-r from-amber-500/10 to-amber-600/10'
          : 'border-white/10 bg-white/5'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-slate-50">{title}</h4>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-right">
            <p className="text-2xl font-bold text-amber-100">{events.length}</p>
            <p className="text-xs text-slate-400">events</p>
          </div>
          <Button
            onClick={onSave}
            className="flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-600 px-4 py-2 text-sm text-white"
          >
            {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      {/* Show brief list of events */}
      <div className="mt-4 grid gap-2">
        {events.map((e: any) => (
          <div key={e._id} className="flex items-start justify-between rounded-lg border border-white/6 bg-white/2 p-3">
            <div>
              <div className="text-sm font-semibold text-slate-50">{e.title}</div>
              <div className="text-xs text-slate-400">{e.artist} • {e.category}</div>
              <div className="text-xs text-slate-400">{e.date} • {e.startTime} - {e.endTime} • {e.venue}</div>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="text-sm text-slate-400">No events selected in this plan.</div>}
      </div>
    </div>
  );
}
