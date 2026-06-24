"use client";

import React from "react";
import { Filter } from "lucide-react";
import { GetStudentDoubtsFilters } from "../_api/doubts.api";

interface DoubtFiltersProps {
  filters: GetStudentDoubtsFilters;
  onChangeFilters: React.Dispatch<React.SetStateAction<GetStudentDoubtsFilters>>;
  eligibleSubjects: { id: string; name: string }[];
}

export function DoubtFilters({
  filters,
  onChangeFilters,
  eligibleSubjects,
}: DoubtFiltersProps) {
  return (
    <div className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4 shadow-2xs select-none">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
        <Filter className="h-4 w-4 text-slate-400" />
        <span>Filters</span>
      </div>

      {/* Status filter */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          Resolution status
        </label>
        <select
          value={filters.status || ""}
          onChange={(e) =>
            onChangeFilters((prev) => ({
              ...prev,
              status: e.target.value ? (e.target.value as any) : undefined,
              page: 1,
            }))
          }
          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="UNASSIGNED">Open Pool</option>
          <option value="CLAIMED">Claimed / In-Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Subject filter */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          Enrolled subjects
        </label>
        <select
          value={filters.subjectId || ""}
          onChange={(e) =>
            onChangeFilters((prev) => ({
              ...prev,
              subjectId: e.target.value || undefined,
              page: 1,
            }))
          }
          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold focus:outline-none"
        >
          <option value="">All Subjects</option>
          {eligibleSubjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
