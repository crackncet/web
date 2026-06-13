"use client";

import { BarChart3, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export function CourseAnalyticsPlaceholder() {
  // Stat cards data
  const stats = [
    {
      label: "Study Time",
      value: "14.8 hrs",
      icon: Clock,
      color: "text-blue-500 bg-blue-500/10",
      change: "+2.3 hrs this week",
    },
    {
      label: "Topics Completed",
      value: "12 / 48",
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-500/10",
      change: "25% syllabus done",
    },
    {
      label: "Average DPP Score",
      value: "82%",
      icon: TrendingUp,
      color: "text-purple-500 bg-purple-500/10",
      change: "Top 15% in class",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
        <BarChart3 className="h-4 w-4 text-primary" />
        <span>Performance Analytics</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </span>
              <div className={`p-1.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xl font-bold text-foreground">{stat.value}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Syllabus Progress Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <span>Overall Course Progress</span>
          <span className="text-primary">25%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: "25%" }}
          />
        </div>
      </div>
    </div>
  );
}
