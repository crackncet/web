"use client";

import React from "react";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

import { MathRenderer, getImageUrl } from "./math-renderer";

interface DoubtDetailCardProps {
  doubt: {
    title: string;
    description: string;
    imageUrl?: string | null;
    status: "UNASSIGNED" | "CLAIMED" | "RESOLVED";
    type: "ACADEMIC" | "NON_ACADEMIC";
  };
}

export function DoubtDetailCard({ doubt }: DoubtDetailCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3.5 w-3.5" />
            Resolved
          </span>
        );
      case "CLAIMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Clock className="h-3.5 w-3.5" />
            Claimed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="h-3.5 w-3.5" />
            Open
          </span>
        );
    }
  };

  return (
    <div className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 select-none">
        {getStatusBadge(doubt.status)}
        <span className="px-2 py-0.5 rounded bg-muted border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
          {doubt.type}
        </span>
      </div>
      <MathRenderer
        text={doubt.title}
        className="text-sm font-black text-slate-800 dark:text-slate-100 mt-4 leading-snug break-words"
      />
      <MathRenderer
        text={doubt.description}
        className="text-xs text-slate-755 dark:text-slate-350 mt-2 whitespace-pre-wrap bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800/80 font-mono leading-relaxed break-words"
      />
      {doubt.imageUrl && (
        <div className="mt-4 rounded-lg overflow-hidden border border-slate-150 dark:border-slate-800 bg-slate-50/20 max-h-[300px] flex items-center justify-center">
          <img
            src={getImageUrl(doubt.imageUrl)}
            alt="Doubt attachment screenshot"
            className="max-h-[300px] w-auto object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
}
