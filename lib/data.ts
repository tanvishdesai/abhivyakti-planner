import { Performance, Exhibition } from "./types";

export async function loadPerformances(): Promise<Performance[]> {
  try {
    const response = await fetch("/data/performances.csv");
    const csv = await response.text();
    const lines = csv.trim().split("\n");

    const performances: Performance[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parse CSV - handle quoted fields
      const fields = parseCSVLine(line);

      // New CSV format:
      // 0: Event_ID, 1: Category, 2: Sub_Category, 3: Event_Name,
      // 4: Venue, 5: City, 6: Date, 7: Time, 8: Duration_Minutes, 9: Description

      const { artist, eventName } = parseEventName(fields[3]);
      const { mainVenue, specificVenue } = parseVenue(fields[4]);

      const performance: Performance = {
        id: `perf-${fields[0]}`, // Use Event_ID from CSV
        eventName: eventName,
        artist: artist,
        category: fields[1],
        subCategory: fields[2],
        date: formatDate(fields[6]), // Convert YYYY-MM-DD to DD-MMM-YYYY
        time: fields[7],
        mainVenue: mainVenue,
        specificVenue: specificVenue,
      };

      performances.push(performance);
    }

    return performances;
  } catch (error) {
    console.error("Error loading performances:", error);
    return [];
  }
}

export async function loadExhibitions(): Promise<Exhibition[]> {
  try {
    const response = await fetch("/data/exhibition.csv");
    const csv = await response.text();
    const lines = csv.trim().split("\n");
    
    const exhibitions: Exhibition[] = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const fields = parseCSVLine(line);
      
      const exhibition: Exhibition = {
        id: `exh-${i}`,
        category: fields[0],
        mainVenue: fields[1],
        startTime: fields[2],
        featuredArtists: fields[3],
      };
      
      exhibitions.push(exhibition);
    }
    
    return exhibitions;
  } catch (error) {
    console.error("Error loading exhibitions:", error);
    return [];
  }
}

function parseEventName(eventName: string): { artist: string; eventName: string } {
  // Event names are in format: "Artist Name - Performance Title"
  const parts = eventName.split(" - ");
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      eventName: parts.slice(1).join(" - ").trim()
    };
  }
  // Fallback if format doesn't match
  return {
    artist: "Unknown Artist",
    eventName: eventName
  };
}

function parseVenue(venue: string): { mainVenue: string; specificVenue: string } {
  // Venues are in format: "Specific Venue, Main Venue" or just "Main Venue"
  const parts = venue.split(", ");
  if (parts.length >= 2) {
    return {
      mainVenue: parts[parts.length - 1].trim(), // Last part is main venue
      specificVenue: parts.slice(0, -1).join(", ").trim() // Everything before is specific
    };
  }
  // Fallback for venues without comma separation
  return {
    mainVenue: venue,
    specificVenue: ""
  };
}

function formatDate(dateStr: string): string {
  // Convert DD-MM-YYYY to DD-MMM-YYYY format
  const [day, month, year] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1; // Convert month number to 0-based index
  const monthName = months[monthIndex];
  return `${day}-${monthName}-${year}`;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current.trim());
  return fields;
}

