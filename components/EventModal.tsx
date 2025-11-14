'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Clock, MapPin, Calendar, Heart, Music, Drama, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

interface EventModalProps {
  event: EventInstance | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected?: boolean;
  onToggle?: () => void;
}

export function EventModal({
  event,
  isOpen,
  onClose,
  isSelected = false,
  onToggle,
}: EventModalProps) {
  const categoryIcon = {
    Dance: <Zap className="h-5 w-5" />,
    Theatre: <Drama className="h-5 w-5" />,
    Music: <Music className="h-5 w-5" />,
  };

  const categoryGradient = {
    Dance: 'bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.4),_transparent_70%)]',
    Theatre: 'bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.35),_transparent_70%)]',
    Music: 'bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.3),_transparent_75%)]',
  };

  return (
    <AnimatePresence>
      {isOpen && event && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="relative w-full overflow-hidden border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
          {/* Background Gradient */}
          <div
            className={cn(
              'pointer-events-none absolute inset-0 opacity-60',
              categoryGradient[event.category as keyof typeof categoryGradient] ||
                'bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_75%)]'
            )}
            aria-hidden="true"
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-slate-300 backdrop-blur-sm transition hover:border-amber-300/50 hover:text-amber-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="relative z-10 p-8">
            <div className="space-y-6">
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-semibold uppercase tracking-wider',
                    event.category === 'Dance' &&
                      'border-purple-400/40 bg-purple-500/20 text-purple-200',
                    event.category === 'Theatre' &&
                      'border-amber-400/40 bg-amber-500/20 text-amber-200',
                    event.category === 'Music' &&
                      'border-sky-400/40 bg-sky-500/20 text-sky-200'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {categoryIcon[event.category as keyof typeof categoryIcon]}
                    {event.category}
                  </span>
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full border-white/10 bg-white/10 text-slate-100"
                >
                  {event.subCategory}
                </Badge>
              </div>

              {/* Title & Artist */}
              <div>
                <h2 className="text-3xl font-bold leading-tight text-slate-50">
                  {event.title}
                </h2>
                <p className="mt-2 text-lg text-slate-300">{event.artist}</p>
              </div>

              {/* Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Calendar className="h-5 w-5 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Date
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-100">
                        {event.date}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Clock className="h-5 w-5 text-sky-300" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Time
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-100">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/10 sm:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <MapPin className="h-5 w-5 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Venue
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-100">
                        {event.venue}
                      </p>
                      {event.specificVenue && (
                        <p className="mt-0.5 text-sm text-slate-400">
                          🏛️ {event.specificVenue}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {onToggle && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={onToggle}
                    className={cn(
                      'flex-1 gap-2 text-base font-semibold transition-all',
                      isSelected
                        ? 'border-red-400/40 bg-red-500/20 text-red-100 hover:bg-red-500/30'
                        : 'border-amber-400/40 bg-amber-500 text-slate-900 hover:bg-amber-400'
                    )}
                  >
                    <Heart
                      className={cn(
                        'h-5 w-5',
                        isSelected && 'fill-red-300 text-red-100'
                      )}
                    />
                    {isSelected ? 'Remove from Schedule' : 'Add to Schedule'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  }

