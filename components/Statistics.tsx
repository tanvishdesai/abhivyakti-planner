'use client';

import { Performance } from "@/lib/types";
import { Card, CardContent,  CardHeader, CardTitle } from "./ui/card";
import { useMemo } from "react";
import { Badge } from "./ui/badge";
import { Music, Drama, Zap, MapPin, Calendar } from "lucide-react";

interface StatisticsProps {
  performances: Performance[];
  selectedPerformances?: Performance[];
}

export function Statistics({
  performances,
  selectedPerformances = [],
}: StatisticsProps) {
  const stats = useMemo(() => {
    const categoryCount = new Map<string, number>();
    const venueCount = new Map<string, number>();
    const dateCount = new Map<string, number>();
    const totalEvents = performances.length;

    performances.forEach((p) => {
      categoryCount.set(p.category, (categoryCount.get(p.category) || 0) + 1);
      venueCount.set(p.mainVenue, (venueCount.get(p.mainVenue) || 0) + 1);
      dateCount.set(p.date, (dateCount.get(p.date) || 0) + 1);
    });

    return {
      categories: Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1]),
      venues: Array.from(venueCount.entries()).sort((a, b) => b[1] - a[1]),
      dates: Array.from(dateCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
      totalEvents,
      uniqueArtists: new Set(performances.map((p) => p.artist)).size,
      selectedCount: selectedPerformances.length,
    };
  }, [performances, selectedPerformances]);

  const categoryIcon: Record<string, React.ReactNode> = {
    Dance: <Zap className="w-4 h-4" />,
    Theatre: <Drama className="w-4 h-4" />,
    Music: <Music className="w-4 h-4" />,
  };

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Total Events</p>
              <p className="text-3xl font-semibold text-slate-50">{stats.totalEvents}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Selected</p>
              <p className="text-3xl font-semibold text-amber-200">
                {stats.selectedCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Artists</p>
              <p className="text-3xl font-semibold text-slate-50">{stats.uniqueArtists}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Venues</p>
              <p className="text-3xl font-semibold text-slate-50">{stats.venues.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Events by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.categories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {categoryIcon[category]}
                  <span>{category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{
                        width: `${(count / stats.totalEvents) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-right w-12">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Venues */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Events by Venue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.venues.map(([venue, count]) => (
              <div key={venue} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm text-slate-200">{venue}</span>
                </div>
                <Badge variant="secondary" className="border-white/10 bg-white/10 text-slate-100">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Busiest Days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Days by Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.dates.map(([date, count]) => (
              <div key={date} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm text-slate-200">{date}</span>
                </div>
                <Badge variant="secondary" className="border-white/10 bg-white/10 text-slate-100">
                  {count} events
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

