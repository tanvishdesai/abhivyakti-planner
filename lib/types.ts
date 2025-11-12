export interface Performance {
  id: string;
  eventName: string;
  artist: string;
  category: string;
  subCategory: string;
  date: string; // DD-MMM-YYYY format
  time: string;
  mainVenue: string;
  specificVenue: string;
  dateObj?: Date;
}

export interface Exhibition {
  id: string;
  category: string;
  mainVenue: string;
  startTime: string;
  featuredArtists: string;
}

export interface SelectedEvent {
  id: string;
  type: 'performance' | 'exhibition';
}

export interface ComboDay {
  date: string;
  events: Performance[];
  venue: string;
  travelTime?: number;
}

