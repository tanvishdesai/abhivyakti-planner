import { create } from "zustand";
import { SelectedEvent, Performance } from "./types";

interface EventStore {
  selectedEvents: SelectedEvent[];
  performances: Performance[];
  selectedPerformances: Performance[];
  selectedDate: string | null;
  selectedCategory: string | null;
  selectedVenue: string | null;
  searchQuery: string;
  
  // Actions
  toggleEvent: (event: SelectedEvent) => void;
  setPerformances: (performances: Performance[]) => void;
  setSelectedPerformances: (performances: Performance[]) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedVenue: (venue: string | null) => void;
  setSearchQuery: (query: string) => void;
  isEventSelected: (eventId: string) => boolean;
  clearSelections: () => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  selectedEvents: [],
  performances: [],
  selectedPerformances: [],
  selectedDate: null,
  selectedCategory: null,
  selectedVenue: null,
  searchQuery: "",

  toggleEvent: (event: SelectedEvent) => {
    set((state) => {
      const isSelected = state.selectedEvents.some((e) => e.id === event.id);
      if (isSelected) {
        return {
          selectedEvents: state.selectedEvents.filter((e) => e.id !== event.id),
        };
      } else {
        return {
          selectedEvents: [...state.selectedEvents, event],
        };
      }
    });
  },

  setPerformances: (performances: Performance[]) => {
    set({ performances });
  },

  setSelectedPerformances: (performances: Performance[]) => {
    set({ selectedPerformances: performances });
  },

  setSelectedDate: (date: string | null) => {
    set({ selectedDate: date });
  },

  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
  },

  setSelectedVenue: (venue: string | null) => {
    set({ selectedVenue: venue });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  isEventSelected: (eventId: string) => {
    return get().selectedEvents.some((e) => e.id === eventId);
  },

  clearSelections: () => {
    set({
      selectedEvents: [],
      selectedPerformances: [],
      selectedDate: null,
      selectedCategory: null,
      selectedVenue: null,
      searchQuery: "",
    });
  },
}));

