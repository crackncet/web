import React from "react";
import { X } from "lucide-react";
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
  const hasActiveFilters = searchQuery || selectedExams.length > 0 || selectedStreams.length > 0;

  return (
    <div className={cn("space-y-6", !isMobile && "w-full")}>
      {!isMobile && (
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-3 border-b border-slate-100 dark:border-slate-800">
            Filters
          </h3>
        </div>
      )}

      {/* Applied Filters Badges */}
      {hasActiveFilters && (
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Applied Filters
            </span>
            <button 
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-violet-600 hover:text-violet-750 hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 animate-in fade-in duration-200">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                Query: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="cursor-pointer">
                  <X className="h-3 w-3 hover:text-red-500" />
                </button>
              </span>
            )}
            {selectedExams.map((exam) => (
              <span key={exam} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {exam}
                <button onClick={() => toggleExam(exam)} className="cursor-pointer">
                  <X className="h-3 w-3 hover:text-red-500" />
                </button>
              </span>
            ))}
            {selectedStreams.map((stream) => (
              <span key={stream} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {stream}
                <button onClick={() => toggleStream(stream)} className="cursor-pointer">
                  <X className="h-3 w-3 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Target Streams Checkbox list */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
          Select Streams
        </label>
        <div className="flex flex-col gap-2 mt-1">
          {streamsList.map((stream) => (
            <label key={stream} className="flex items-center gap-2.5 cursor-pointer group select-none py-0.5">
              <input
                type="checkbox"
                checked={selectedStreams.includes(stream)}
                onChange={() => toggleStream(stream)}
                className="sr-only"
              />
              <div 
                className={cn(
                  "w-4 h-4 border border-slate-300 dark:border-slate-700 rounded flex items-center justify-center transition-all",
                  selectedStreams.includes(stream) 
                    ? "bg-violet-600 border-violet-600 text-white" 
                    : "bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500"
                )}
              >
                {selectedStreams.includes(stream) && (
                  <svg className="w-2.5 h-2.5 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {stream}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Target Exams Checkbox list */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
          Select Exam
        </label>
        <div className="flex flex-col gap-2 mt-1">
          {examsList.map((exam) => (
            <label key={exam} className="flex items-center gap-2.5 cursor-pointer group select-none py-0.5">
              <input
                type="checkbox"
                checked={selectedExams.includes(exam)}
                onChange={() => toggleExam(exam)}
                className="sr-only"
              />
              <div 
                className={cn(
                  "w-4 h-4 border border-slate-300 dark:border-slate-700 rounded flex items-center justify-center transition-all",
                  selectedExams.includes(exam) 
                    ? "bg-violet-600 border-violet-600 text-white" 
                    : "bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500"
                )}
              >
                {selectedExams.includes(exam) && (
                  <svg className="w-2.5 h-2.5 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {exam}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full h-9 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none cursor-pointer mt-1"
        >
          <option value="date-asc" className="dark:bg-slate-950">Start Date: Earliest first</option>
          <option value="date-desc" className="dark:bg-slate-950">Start Date: Latest first</option>
          <option value="price-asc" className="dark:bg-slate-950">Price: Low to High</option>
          <option value="price-desc" className="dark:bg-slate-950">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
