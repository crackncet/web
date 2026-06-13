import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Tag, ArrowRight, Sparkles } from "lucide-react";
import { PublicTestSeriesListItem } from "../_api/test-series.api";
import { cn } from "@/lib/utils";

interface TestSeriesCardProps {
  testSeries: PublicTestSeriesListItem;
  layout?: "grid" | "list";
}

export function TestSeriesCard({ testSeries, layout = "grid" }: TestSeriesCardProps) {
  const formattedPrice = parseFloat(testSeries.price).toLocaleString("en-IN");
  const dateStr = testSeries.startDate
    ? new Date(testSeries.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Flexible";

  const isUpcoming = testSeries.status === "UPCOMING";

  if (layout === "list") {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col md:flex-row gap-6 select-none w-full">
        {/* Banner container */}
        <div className="relative aspect-video w-full md:w-64 overflow-hidden bg-slate-50 dark:bg-slate-800/40 rounded-2xl shrink-0">
          {testSeries.banner ? (
            <Image
              src={testSeries.banner}
              alt={testSeries.name}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-550 group-hover:scale-103"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/5 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-violet-600/20" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-white/95 dark:bg-slate-900/90 text-slate-850 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800">
              {testSeries.examName}
            </span>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <span
              className={cn(
                "inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded text-white shadow-sm",
                isUpcoming ? "bg-amber-500" : "bg-emerald-600"
              )}
            >
              {testSeries.status}
            </span>
          </div>
        </div>

        {/* Content details */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-2.5">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-55 group-hover:text-violet-600 transition-colors">
              {testSeries.name}
            </h3>
            
            {testSeries.description && (
              <p className="text-[11px] text-slate-450 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {testSeries.description}
              </p>
            )}

            {/* Stream Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {testSeries.streamName?.map((stream: string) => (
                <span
                  key={stream}
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-slate-50 dark:bg-slate-855 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-805"
                >
                  {stream}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-450 font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                Starts: {dateStr}
              </span>
              <span className="inline-flex items-center gap-1 font-black text-slate-900 dark:text-slate-50 text-sm">
                ₹{formattedPrice}
              </span>
            </div>

            <div className="w-full sm:w-auto">
              {testSeries.isEnrollmentOpen ? (
                <Link href={`/test-series/${testSeries.id}`} className="block w-full sm:inline-block">
                  <button 
                    className="w-full sm:w-auto h-9 px-5 text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-755 text-white flex items-center justify-center gap-1.5 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
                  >
                    <span>Explore Series</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              ) : (
                <button 
                  disabled
                  className="w-full sm:w-auto h-9 px-5 text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-not-allowed"
                >
                  <span>Closed</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl flex flex-col h-full p-5 shadow-xs hover:shadow-md transition-all duration-300 group select-none">
      {/* Image Banner Inset */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
        {testSeries.banner ? (
          <Image
            src={testSeries.banner}
            alt={testSeries.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-550 group-hover:scale-103"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/5 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-violet-600/20" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800">
            {testSeries.examName}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span
            className={cn(
              "inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded text-white shadow-sm",
              isUpcoming ? "bg-amber-500" : "bg-emerald-600"
            )}
          >
            {testSeries.status}
          </span>
        </div>
      </div>

      {/* Content details Left-Aligned */}
      <div className="flex-1 flex flex-col justify-between mt-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-55 group-hover:text-violet-600 transition-colors truncate">
            {testSeries.name}
          </h3>
          {testSeries.description && (
            <p className="text-[11px] text-slate-450 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[32px] mt-2">
              {testSeries.description}
            </p>
          )}

          {/* Stream Badges Left-Aligned */}
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {testSeries.streamName?.map((stream: string) => (
              <span
                key={stream}
                className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800"
              >
                {stream}
              </span>
            ))}
          </div>
        </div>

        {/* Separator and Bottom Row */}
        <div>
          <div className="border-t border-slate-100 dark:border-slate-800/80 my-4" />
          
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-450 font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Starts: {dateStr}
            </span>
            <span className="inline-flex items-center gap-0.5 font-black text-slate-900 dark:text-slate-50 text-sm">
              ₹{formattedPrice}
            </span>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            {testSeries.isEnrollmentOpen ? (
              <Link href={`/test-series/${testSeries.id}`} className="block w-full">
                <button 
                  className="w-full h-10 text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-750 text-white flex items-center justify-center gap-1.5 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  <span>Explore Series</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            ) : (
              <button 
                disabled
                className="w-full h-10 text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-not-allowed"
              >
                <span>Closed</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
