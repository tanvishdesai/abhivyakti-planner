'use client';

import { Performance } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEventStore } from "@/lib/store";
import { useMemo } from "react";
import React from "react";
import { cn } from "@/lib/utils";

interface EventFiltersProps {
  performances: Performance[];
  onFiltered: (performances: Performance[]) => void;
}

export function EventFilters({ performances, onFiltered }: EventFiltersProps) {
  const {
    selectedDate,
    selectedCategory,
    selectedVenue,
    searchQuery,
    setSelectedDate,
    setSelectedCategory,
    setSelectedVenue,
    setSearchQuery,
    clearSelections,
  } = useEventStore();

  const uniqueDates = useMemo(() => {
    return [...new Set(performances.map((p) => p.date))].sort();
  }, [performances]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(performances.map((p) => p.category))].sort();
  }, [performances]);

  const uniqueVenues = useMemo(() => {
    return [...new Set(performances.map((p) => p.mainVenue))].sort();
  }, [performances]);

  const filtered = useMemo(() => {
    return performances.filter((p) => {
      const matchDate = !selectedDate || p.date === selectedDate;
      const matchCategory = !selectedCategory || p.category === selectedCategory;
      const matchVenue = !selectedVenue || p.mainVenue === selectedVenue;
      const matchSearch =
        !searchQuery ||
        p.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.artist.toLowerCase().includes(searchQuery.toLowerCase());

      return matchDate && matchCategory && matchVenue && matchSearch;
    });
  }, [performances, selectedDate, selectedCategory, selectedVenue, searchQuery]);

  React.useEffect(() => {
    onFiltered(filtered);
  }, [filtered]);

  const hasFilters =
    selectedDate || selectedCategory || selectedVenue || searchQuery;

  return (
    <Card className="space-y-6 border-white/10 bg-slate-900/70 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-300">
            <SlidersHorizontal className="h-3 w-3 text-amber-200/80" />
            Refine
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-50">Tailor Your Evening</h3>
            <p className="text-sm text-slate-400">
              Layer filters to surface the perfect set of performances.
            </p>
          </div>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelections}
            className="gap-2 rounded-full border border-transparent bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-amber-300/40 hover:text-amber-100"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by artist, performance, or vibe…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:border-amber-300/60 focus-visible:ring-amber-300/40"
        />
      </div>

      <FilterSection title="Discipline" hint="Pick a primary art form">
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
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          >
            {cat}
          </FilterChip>
        ))}
      </FilterSection>

      <FilterSection title="Anchor Venues" hint="Select where you want to spend the evening">
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
            onClick={() => setSelectedVenue(selectedVenue === venue ? null : venue)}
          >
            <span className="max-w-[12rem] truncate text-start">{venue}</span>
          </FilterChip>
        ))}
      </FilterSection>

      <FilterSection title="Festival Dates" hint="Line up your nights">
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
            {formatDateChip(date)}
          </FilterChip>
        ))}
      </FilterSection>

      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 shadow-inner shadow-black/10">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-slate-100">
            {filtered.length} match{filtered.length === 1 ? "" : "es"}
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {hasFilters ? "Filters active" : "Showing all"}
          </span>
        </div>
      </div>
    </Card>
  );
}

function FilterSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
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
        "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        active
          ? "border-amber-300/60 bg-amber-400/15 text-amber-100 shadow-[0_10px_30px_-20px_rgba(251,191,36,0.75)]"
          : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-200/50 hover:text-amber-100"
      )}
    >
      {children}
    </button>
  );
}

function formatDateChip(value: string) {
  const [day, month] = value.split("-");
  return `${day} ${month}`;
}

