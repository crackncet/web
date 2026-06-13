"use client";

import React, { useState, useMemo } from "react";
import { usePublicTestSeriesQuery, usePublicExamsQuery, usePublicStreamsQuery } from "./_queries/test-series.queries";
import { Button } from "@/components/ui/button";
import { AlertCircle, SlidersHorizontal, LayoutGrid, List, Search, Trash2, X } from "lucide-react";
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
  const [activeView, setActiveView] = useState<"grid" | "list">("grid");

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
      <div className="min-h-screen bg-slate-50/20 dark:bg-slate-950/5 flex flex-col lg:flex-row pt-16">
        <aside className="hidden lg:block w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 p-6 space-y-6 animate-pulse">
          <div className="h-4 bg-muted w-24 rounded" />
          <div className="space-y-4">
            <div className="h-3 bg-muted w-16 rounded" />
            <div className="h-4 bg-muted w-32 rounded" />
            <div className="h-4 bg-muted w-24 rounded" />
          </div>
        </aside>

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

  const hasActiveFilters = searchQuery || selectedExams.length > 0 || selectedStreams.length > 0;

  return (
    <div className="min-h-screen bg-slate-50/20 dark:bg-slate-955/5">
      
      {/* Premium Header Banner Section */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-white via-violet-50/40 to-violet-100/50 dark:from-slate-950 dark:via-violet-955/10 dark:to-violet-900/10 py-16 md:py-20 select-none animate-in fade-in duration-300">
        
        {/* Centered Content Container */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 w-full flex flex-col items-center text-center space-y-6">
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Test Series
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold max-w-xl mx-auto">
              Practice with high-yield subject tests tailored for NCET exams.
            </p>
          </div>

          {/* Centered Search Input & Popular Searches */}
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 shadow-sm rounded-2xl p-1.5 flex items-center w-full gap-2">
              <Search className="h-5 w-5 text-slate-450 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search for test series, exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none pl-1"
              />
              <button 
                onClick={() => setSearchQuery(searchQuery)}
                className="h-10 md:h-11 px-6 bg-violet-600 hover:bg-violet-755 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Evolving Elegant SVG Curve */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none translate-y-[1px]">
          <svg className="relative block w-full h-8 md:h-12 text-slate-50/20 dark:text-slate-950/5" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,0 Q300,120 600,30 T1200,60 V120 H0 Z" opacity="0.4" />
            <path d="M0,40 Q300,80 600,0 T1200,20 V120 H0 Z" opacity="0.6" />
            <path d="M985.66,92.83C906.67,72,823.78,31,741.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86C245,69.66,165.63,40.65,82.1,22.81,53.05,16.63,24.9,8.75,0,0V120H1200V95.8C1132.19,118.9,1055.71,111.31,985.66,92.83Z" className="text-slate-50/50 dark:text-slate-955/20" />
          </svg>
        </div>
      </section>

      {/* Main split-screen container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start min-h-screen">
        
        {/* Left Sidebar (Desktop Filters Card) */}
        <aside className="hidden lg:block w-72 shrink-0 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-3xl p-6 shadow-xs sticky top-24 self-start">
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

        {/* Mobile Filter Toggle Button */}
        <div className="w-full lg:hidden flex gap-3 pb-2">
          <Button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 h-11 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-805 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-violet-600" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="lg:hidden w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-5 mb-4 space-y-5 shadow-lg animate-in slide-in-from-top duration-200">
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

            <Button onClick={() => setShowMobileFilters(false)} className="w-full h-11 font-bold bg-violet-600 hover:bg-violet-755 text-white border-none cursor-pointer rounded-xl">
              Apply Filters
            </Button>
          </div>
        )}

        {/* Right Column: Active Filters, Layout Mode & Grid */}
        <main className="flex-1 w-full space-y-6">
          
          {/* Active Filters row */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-150/40 dark:border-slate-800/80 rounded-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">
                  Active Filters:
                </span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-violet-50 dark:bg-violet-955/20 border border-violet-100/50 dark:border-violet-900/30 text-violet-755 dark:text-violet-400">
                    Query: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="cursor-pointer">
                      <X className="h-3 w-3 hover:text-red-500" />
                    </button>
                  </span>
                )}
                {selectedExams.map((exam) => (
                  <span key={exam} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-violet-50 dark:bg-violet-955/20 border border-violet-100/50 dark:border-violet-900/30 text-violet-755 dark:text-violet-400">
                    {exam}
                    <button onClick={() => toggleExam(exam)} className="cursor-pointer">
                      <X className="h-3 w-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
                {selectedStreams.map((stream) => (
                  <span key={stream} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-violet-50 dark:bg-violet-955/20 border border-violet-100/50 dark:border-violet-900/30 text-violet-755 dark:text-violet-400">
                    {stream}
                    <button onClick={() => toggleStream(stream)} className="cursor-pointer">
                      <X className="h-3 w-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>

              <button 
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-755 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear all</span>
              </button>
            </div>
          )}

          {/* Counts & View Switcher Row */}
          <div className="flex items-center justify-between select-none">
            <span className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {processedTestSeries.length} {processedTestSeries.length === 1 ? "Test Series" : "Test Series"} Found
            </span>

            {/* Segment control Grid/List switcher */}
            <div className="flex items-center bg-slate-100/80 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-0.5 rounded-xl">
              <button
                onClick={() => setActiveView("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === "grid"
                    ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-2xs"
                    : "text-slate-455 hover:text-slate-700 dark:hover:text-slate-350"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setActiveView("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === "list"
                    ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-2xs"
                    : "text-slate-455 hover:text-slate-700 dark:hover:text-slate-350"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Core Results container */}
          {processedTestSeries.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-full mb-4 border border-slate-150 dark:border-slate-805">
                <AlertCircle className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-955 dark:text-slate-50 mb-1">No Test Series Found</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                No active or upcoming test series match your criteria. Try adjusting your query or resetting filters.
              </p>
              <Button onClick={handleResetFilters} variant="outline" className="font-semibold shadow-xs cursor-pointer border-slate-200 rounded-xl">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className={activeView === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
              {processedTestSeries.map((ts) => (
                <TestSeriesCard key={ts.id} testSeries={ts} layout={activeView} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}