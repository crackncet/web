"use client";

import React, { useState, useMemo } from "react";
import { usePublicTestSeriesQuery, usePublicExamsQuery, usePublicStreamsQuery } from "./_queries/test-series.queries";
import { Button } from "@/components/ui/button";
import { AlertCircle, SlidersHorizontal } from "lucide-react";
import { SearchBar } from "../courses/_components/SearchBar";
import { FilterSidebar } from "../courses/_components/FilterSidebar";
import { TestSeriesCard } from "./_components/TestSeriesCard";

export default function TestSeriesPage() {
  const { data, isLoading } = usePublicTestSeriesQuery({ limit: 100 });
  const testSeriesList = data?.data || [];

  const { data: examsData } = usePublicExamsQuery();
  const { data: streamsData } = usePublicStreamsQuery();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("date-asc");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const examsList = useMemo(() => {
    return (examsData || []).map((e) => e.name);
  }, [examsData]);

  const streamsList = useMemo(() => {
    return (streamsData || []).map((s) => s.name);
  }, [streamsData]);

  const toggleExam = (examName: string) => {
    setSelectedExams((prev) =>
      prev.includes(examName) ? prev.filter((e) => e !== examName) : [...prev, examName]
    );
  };

  const toggleStream = (streamName: string) => {
    setSelectedStreams((prev) =>
      prev.includes(streamName) ? prev.filter((s) => s !== streamName) : [...prev, streamName]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedExams([]);
    setSelectedStreams([]);
    setSortBy("date-asc");
  };

  // Process filtering and sorting
  const processedTestSeries = useMemo(() => {
    let result = [...testSeriesList];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ts) =>
          ts.name.toLowerCase().includes(q) ||
          (ts.description && ts.description.toLowerCase().includes(q))
      );
    }

    // Exam filter
    if (selectedExams.length > 0) {
      result = result.filter((ts) => ts.examName && selectedExams.includes(ts.examName));
    }

    // Stream filter
    if (selectedStreams.length > 0) {
      result = result.filter((ts) => ts.streamName?.some((s) => selectedStreams.includes(s)));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-asc") {
        const da = a.startDate ? new Date(a.startDate).getTime() : Infinity;
        const db = b.startDate ? new Date(b.startDate).getTime() : Infinity;
        return da - db;
      }
      if (sortBy === "date-desc") {
        const da = a.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b.startDate ? new Date(b.startDate).getTime() : 0;
        return db - da;
      }
      if (sortBy === "price-asc") {
        return parseFloat(a.price) - parseFloat(b.price);
      }
      if (sortBy === "price-desc") {
        return parseFloat(b.price) - parseFloat(a.price);
      }
      return 0;
    });

    return result;
  }, [testSeriesList, searchQuery, selectedExams, selectedStreams, sortBy]);

  // Loading Skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/20 dark:bg-slate-950/5 flex flex-col lg:flex-row">
        {/* Skeleton Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-6 animate-pulse">
          <div className="h-4 bg-muted w-24 rounded" />
          <div className="space-y-4">
            <div className="h-3 bg-muted w-16 rounded" />
            <div className="h-4 bg-muted w-32 rounded" />
            <div className="h-4 bg-muted w-24 rounded" />
          </div>
        </aside>

        {/* Skeleton Grid */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 space-y-6">
          <div className="h-10 bg-muted w-2/3 rounded mb-4" />
          <div className="h-8 bg-muted w-48 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 animate-pulse flex flex-col h-full justify-between">
                <div>
                  <div className="aspect-video bg-muted rounded-xl mb-4" />
                  <div className="h-5 bg-muted rounded w-3/4 mx-auto mb-3" />
                  <div className="h-3 bg-muted rounded w-full mx-auto mb-2" />
                </div>
                <div className="h-9 bg-muted rounded-xl w-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/20 dark:bg-slate-950/5 pt-8">
      <div className="flex flex-col lg:flex-row items-start min-h-screen">
        
        {/* Left Sidebar (Amazon Style) */}
        <aside className="hidden lg:block w-72 shrink-0 bg-white dark:bg-slate-950 px-6 sticky top-16 h-[calc(100vh-6rem)] overflow-y-auto self-start">
          <FilterSidebar
            examsList={examsList}
            streamsList={streamsList}
            selectedExams={selectedExams}
            selectedStreams={selectedStreams}
            toggleExam={toggleExam}
            toggleStream={toggleStream}
            sortBy={sortBy}
            setSortBy={setSortBy}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleResetFilters={handleResetFilters}
          />
        </aside>

        {/* Mobile Filter Toggle & Search */}
        <div className="w-full lg:hidden flex gap-3 px-4 pt-6">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="h-10 w-10 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="lg:hidden w-[calc(100%-2rem)] mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mt-4 space-y-5 shadow-lg animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm uppercase text-slate-800 dark:text-slate-200">Filters</h4>
              <button onClick={handleResetFilters} className="text-xs font-bold text-violet-600 cursor-pointer">Clear All</button>
            </div>

            <FilterSidebar
              examsList={examsList}
              streamsList={streamsList}
              selectedExams={selectedExams}
              selectedStreams={selectedStreams}
              toggleExam={toggleExam}
              toggleStream={toggleStream}
              sortBy={sortBy}
              setSortBy={setSortBy}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleResetFilters={handleResetFilters}
              isMobile={true}
            />

            <Button onClick={() => setShowMobileFilters(false)} className="w-full h-10 font-bold bg-violet-600 hover:bg-violet-750 text-white border-none cursor-pointer">
              Apply Filters
            </Button>
          </div>
        )}

        {/* Right Column: Search + Title + Grid */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 space-y-6 w-full">
          {/* Top Search Bar (Desktop only, as mobile has it above) */}
          <div className="hidden lg:block w-full ">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="select-none mb-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Test Series
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Practice with high-yield subject tests tailored for NCET exams.
            </p>
          </div>

          {processedTestSeries.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-full mb-4 border border-slate-150 dark:border-slate-800">
                <AlertCircle className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-slate-50 mb-1">No Test Series Found</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                No active or upcoming test series match your criteria. Try adjusting your query or resetting filters.
              </p>
              <Button onClick={handleResetFilters} variant="outline" className="font-semibold shadow-xs cursor-pointer border-slate-200">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {processedTestSeries.map((ts) => (
                <TestSeriesCard key={ts.id} testSeries={ts} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}