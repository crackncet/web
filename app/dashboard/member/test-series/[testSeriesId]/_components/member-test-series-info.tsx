"use client";

import React from "react";
import { TestSeriesDetail } from "../../_api/test-series.api";
import { Calendar, Tag, Sparkles, Shield } from "lucide-react";
import Image from "next/image";

interface MemberTestSeriesInfoProps {
  detail: TestSeriesDetail;
}

export function getTestSeriesStatus(
  isActive: boolean,
  isPublished: boolean,
  startDateStr: string | null,
  endDateStr: string | null
): "UPCOMING" | "ONGOING" | "COMPLETED" | "UNPUBLISHED" {
  const now = new Date();
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate = endDateStr ? new Date(endDateStr) : null;

  if (endDate && endDate <= now) return "COMPLETED";
  if (!isPublished) return "UNPUBLISHED";
  if (isActive && startDate && startDate > now) return "UPCOMING";
  if (isActive) return "ONGOING";
  return "UNPUBLISHED";
}

export function MemberTestSeriesInfo({ detail }: MemberTestSeriesInfoProps) {
  const calculatedStatus = getTestSeriesStatus(
    detail.isActive,
    detail.isPublished,
    detail.startDate,
    detail.endDate
  );

  const dateStr = detail.startDate
    ? `${new Date(detail.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} - ${new Date(detail.endDate || "").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
    : "Flexible Dates";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-6 p-6">
      {/* Banner Area */}
      <div className="relative aspect-video w-full md:w-[40%] shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 shadow-xs">
        {detail.banner ? (
          <Image
            src={detail.banner}
            alt={detail.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/5 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary/30 animate-pulse" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1">
          <span className="inline-flex px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-white/95 text-slate-800 shadow-xs border border-slate-200/40 backdrop-blur-xs select-none">
            {detail.examName || "Exam"}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold rounded bg-slate-950/85 text-white backdrop-blur-xs select-none uppercase tracking-wider shadow-xs">
            {calculatedStatus}
          </span>
        </div>
      </div>

      {/* Info Details Area */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${detail.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 tracking-tight leading-snug">
                  {detail.name}
                </h2>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  detail.isActive 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}>
                  {detail.isActive ? "Active" : "Inactive"}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  detail.isPublished 
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {detail.isPublished ? "Published" : "Unpublished"}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            {detail.description || "No description provided for this test series workspace."}
          </p>
        </div>

        {/* Tags / Info Grid */}
        <div className="flex flex-wrap gap-y-3 gap-x-6 text-[11px] text-muted-foreground pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
            {dateStr}
          </span>
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
            <Tag className="h-4 w-4 text-primary/70 shrink-0" />
            ₹{Number(detail.price).toLocaleString("en-IN")}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Shield className="h-4 w-4 text-primary/70 shrink-0" />
            Visibility: {detail.isPublished ? "Public" : "Admin Only"}
          </span>
        </div>
      </div>
    </div>
  );
}
