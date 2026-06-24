"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  User,
  Clock,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

import { MathRenderer } from "./math-renderer";

interface StudentDoubtCardProps {
  doubt: {
    id: string;
    type: "ACADEMIC" | "NON_ACADEMIC";
    title: string;
    description: string;
    status: "UNASSIGNED" | "CLAIMED" | "RESOLVED";
    createdAt: string;
    updatedAt: string;
    subject?: { name: string } | null;
    assignedTeacher?: { fullName: string } | null;
  };
}

export function StudentDoubtCard({ doubt }: StudentDoubtCardProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "CLAIMED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    }
  };

  return (
    <Link
      href={`/dashboard/student/doubts/${doubt.id}`}
      className="block group border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-all duration-200 rounded-xl p-5 shadow-xs hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left side info block */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row with badges and date */}
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold tracking-wide uppercase select-none text-muted-foreground">
            <span className="px-2 py-0.5 rounded bg-muted border border-border text-slate-600 dark:text-slate-400">
              {doubt.type}
            </span>
            {doubt.subject && (
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[120px]">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{doubt.subject.name}</span>
              </span>
            )}
            <span className="flex items-center gap-1 font-medium text-slate-400 shrink-0">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {new Date(doubt.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </span>
          </div>

          {/* Doubt title (with ellipsis) */}
          <MathRenderer
            text={doubt.title}
            className="font-extrabold text-slate-800 dark:text-slate-100 text-sm group-hover:text-primary transition-colors truncate max-w-full"
          />

          {/* Doubt brief description (with ellipsis) */}
          <MathRenderer
            text={doubt.description}
            className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed max-w-full font-mono"
          />

          {/* Footer stats row */}
          <div className="flex items-center gap-3 pt-2 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/40 select-none">
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">
                {doubt.assignedTeacher?.fullName || "Unassigned"}
              </span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                {new Date(doubt.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </span>
          </div>
        </div>

        {/* Right side status badge and arrow */}
        <div className="flex items-center gap-3 shrink-0 select-none">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(
              doubt.status
            )}`}
          >
            {doubt.status === "UNASSIGNED" ? "open" : doubt.status === "CLAIMED" ? "claimed" : "resolved"}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
