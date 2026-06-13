import React, { useState } from "react";
import { X, RotateCcw, ChevronDown, ChevronUp, Zap, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  examsList: string[];
  streamsList: string[];
  selectedExams: string[];
  selectedStreams: string[];
  toggleExam: (name: string) => void;
  toggleStream: (name: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  handleResetFilters: () => void;
  isMobile?: boolean;
}

export function FilterSidebar({
  examsList,
  streamsList,
  selectedExams,
  selectedStreams,
  toggleExam,
  toggleStream,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  handleResetFilters,
  isMobile = false,
}: FilterSidebarProps) {
  const [streamsOpen, setStreamsOpen] = useState(true);
  const [examsOpen, setExamsOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(true);

  const hasActiveFilters = searchQuery || selectedExams.length > 0 || selectedStreams.length > 0;

  return (
    <div className={cn("space-y-6 select-none", !isMobile && "w-full")}>
      
      {/* Sidebar Header (desktop only, or mobile if inside drawer) */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50/50 dark:bg-violet-955/20 border border-violet-100/30 dark:border-violet-900/30 rounded-xl text-violet-755 dark:text-violet-400 font-extrabold text-[10px] uppercase tracking-wider">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
        </div>
        <button 
          onClick={handleResetFilters}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>

      

      {/* Accordion 1: Select Streams */}
      <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setStreamsOpen(!streamsOpen)}
          className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <span>Select Streams</span>
          {streamsOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {streamsOpen && (
          <div className="flex flex-col gap-2.5 mt-2.5 animate-in slide-in-from-top-1 duration-150">
            {streamsList.map((stream) => {
              const isChecked = selectedStreams.includes(stream);
              return (
                <label key={stream} className="flex items-center gap-2.5 cursor-pointer group select-none py-0.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleStream(stream)}
                    className="sr-only"
                  />
                  <div 
                    className={cn(
                      "w-4 h-4 border border-slate-300 dark:border-slate-700 rounded flex items-center justify-center transition-all",
                      isChecked 
                        ? "bg-violet-600 border-violet-600 text-white" 
                        : "bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500"
                    )}
                  >
                    {isChecked && (
                      <svg className="w-2.5 h-2.5 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-350 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {stream}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Accordion 2: Select Exam */}
      <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setExamsOpen(!examsOpen)}
          className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <span>Select Exam</span>
          {examsOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {examsOpen && (
          <div className="flex flex-col gap-2.5 mt-2.5 animate-in slide-in-from-top-1 duration-150">
            {examsList.map((exam) => {
              const isChecked = selectedExams.includes(exam);
              return (
                <label key={exam} className="flex items-center gap-2.5 cursor-pointer group select-none py-0.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleExam(exam)}
                    className="sr-only"
                  />
                  <div 
                    className={cn(
                      "w-4 h-4 border border-slate-300 dark:border-slate-700 rounded flex items-center justify-center transition-all",
                      isChecked 
                        ? "bg-violet-600 border-violet-600 text-white" 
                        : "bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500"
                    )}
                  >
                    {isChecked && (
                      <svg className="w-2.5 h-2.5 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-350 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {exam}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Accordion 3: Sort By */}
      <div className="space-y-2 pb-4">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <span>Sort By</span>
          {sortOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {sortOpen && (
          <div className="mt-2.5 animate-in slide-in-from-top-1 duration-150">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-9 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              <option value="date-asc" className="dark:bg-slate-955">Start Date: Earliest first</option>
              <option value="date-desc" className="dark:bg-slate-955">Start Date: Latest first</option>
              <option value="price-asc" className="dark:bg-slate-955">Price: Low to High</option>
              <option value="price-desc" className="dark:bg-slate-955">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Quick Tip Widget */}
      {!isMobile && (
        <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-955/10 border border-violet-100/40 dark:border-violet-900/20 text-xs flex gap-2.5 items-start">
          <div className="h-6 w-6 rounded-lg bg-violet-100 dark:bg-violet-950/40 border border-violet-200/50 dark:border-violet-900/30 flex items-center justify-center shrink-0">
            <Zap className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 fill-current" />
          </div>
          <div className="space-y-0.5">
            <span className="font-extrabold text-[10px] text-violet-755 dark:text-violet-400 uppercase tracking-wide block">
              Quick Tip
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">
              Use filters to find the prep programs that best match your exam board and stream.
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
