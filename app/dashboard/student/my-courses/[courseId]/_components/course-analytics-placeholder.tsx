"use client";

import { BarChart3, Video, HelpCircle, BookOpen } from "lucide-react";

interface CourseAnalyticsPlaceholderProps {
  overallProgressPercentage?: number;
  stats?: {
    videos: { total: number; completed: number };
    dpps: { total: number; completed: number };
    chapterPractices: { total: number; completed: number };
  };
}

export function CourseAnalyticsPlaceholder({
  overallProgressPercentage = 0,
  stats = {
    videos: { total: 0, completed: 0 },
    dpps: { total: 0, completed: 0 },
    chapterPractices: { total: 0, completed: 0 },
  },
}: CourseAnalyticsPlaceholderProps) {
  // Safe computation of item percentages
  const videoPct = stats.videos.total > 0
    ? Math.round((stats.videos.completed / stats.videos.total) * 100)
    : 0;

  const dppPct = stats.dpps.total > 0
    ? Math.round((stats.dpps.completed / stats.dpps.total) * 100)
    : 0;

  const practicePct = stats.chapterPractices.total > 0
    ? Math.round((stats.chapterPractices.completed / stats.chapterPractices.total) * 100)
    : 0;

  const cards = [
    {
      label: "Videos Watched",
      value: `${stats.videos.completed} / ${stats.videos.total}`,
      icon: Video,
      color: "text-blue-500 bg-blue-500/10",
      change: `${videoPct}% video lectures done`,
    },
    {
      label: "DPPs Completed",
      value: `${stats.dpps.completed} / ${stats.dpps.total}`,
      icon: HelpCircle,
      color: "text-emerald-500 bg-emerald-500/10",
      change: `${dppPct}% DPPs attempted`,
    },
    {
      label: "Chapter Practices",
      value: `${stats.chapterPractices.completed} / ${stats.chapterPractices.total}`,
      icon: BookOpen,
      color: "text-purple-500 bg-purple-500/10",
      change: `${practicePct}% practice sets completed`,
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
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xl font-bold text-foreground">{card.value}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {card.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Syllabus Progress Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <span>Overall Course Progress</span>
          <span className="text-primary font-bold">{overallProgressPercentage}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${overallProgressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
