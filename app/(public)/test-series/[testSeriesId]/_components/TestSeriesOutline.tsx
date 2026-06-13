import React from "react";
import { Tag, Sparkles, AlertCircle, Calendar, ListTodo, Trophy } from "lucide-react";
import { usePublicTestSeriesOutlineQuery } from "../_queries/test-series-detail.queries";

interface TestSeriesOutlineProps {
  testSeriesId: string;
}

function formatTestDate(dateStr: string | null): string {
  if (!dateStr) return "To be scheduled";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "To be scheduled";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TestSeriesOutline({ testSeriesId }: TestSeriesOutlineProps) {
  const { data: outline, isLoading, error } = usePublicTestSeriesOutlineQuery(testSeriesId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-55 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600" />
          Test Series Structure
        </h3>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          All India Mock papers to test your preparedness.
        </p>
      </div>

      <div className="space-y-6">
        {/* Tests List */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-12 bg-muted rounded-xl" />
            <div className="h-12 bg-muted rounded-xl" />
            <div className="h-12 bg-muted rounded-xl" />
          </div>
        ) : error || !outline ? (
          <div className="py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400">
            <AlertCircle className="h-8 w-8 text-slate-350 mb-2" />
            <p className="text-xs font-semibold">Failed to load test series outline details.</p>
          </div>
        ) : !outline.tests || outline.tests.length === 0 ? (
          <div className="py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
            <ListTodo className="h-8 w-8 text-slate-350 mb-2" />
            <p className="text-xs font-semibold">No tests scheduled for this series yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
              Test Schedule ({outline.tests.length} Papers)
            </span>

            <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
              {outline.tests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-violet-50 dark:bg-violet-950/35 border border-violet-100/40 dark:border-violet-900/25 flex items-center justify-center shrink-0">
                      <Trophy className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {test.name}
                      </p>
                      <p className="text-[10px] font-medium text-slate-450 dark:text-slate-500 mt-0.5">
                        Paper #{index + 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-slate-600 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-505" />
                    <span className="text-[11px] font-semibold">
                      {formatTestDate(test.scheduledAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
