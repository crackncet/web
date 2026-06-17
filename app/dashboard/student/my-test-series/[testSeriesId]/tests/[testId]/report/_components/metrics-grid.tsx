"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsGridProps {
  totalScore: string | number;
  maxPossibleScore: string | number;
  accuracy: string | number;
  totalTimeSeconds: number;
  totalQuestions: number;
  totalCorrect: number;
  className?: string;
}

export function MetricsGrid({
  totalScore,
  maxPossibleScore,
  accuracy,
  totalTimeSeconds,
  totalQuestions,
  totalCorrect,
  className,
}: MetricsGridProps) {
  const scoreVal = parseFloat(totalScore as string);
  const maxVal = parseFloat(maxPossibleScore as string);
  const accuracyVal = parseFloat(accuracy as string);

  const getScoreRating = () => {
    if (maxVal <= 0) return { label: "N/A", style: "bg-muted text-muted-foreground" };
    const ratio = scoreVal / maxVal;
    if (ratio >= 0.75) return { label: "Excellent", style: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" };
    if (ratio >= 0.45) return { label: "Average", style: "bg-blue-500/10 text-blue-600 border border-blue-500/20" };
    return { label: "Below Average", style: "bg-rose-500/10 text-rose-600 border border-rose-500/20" };
  };

  const getCorrectQsRating = () => {
    if (totalQuestions <= 0) return { label: "N/A", style: "bg-muted text-muted-foreground" };
    const ratio = totalCorrect / totalQuestions;
    if (ratio >= 0.75) return { label: "Great Job!", style: "text-emerald-500" };
    if (ratio >= 0.45) return { label: "Good Progress", style: "text-blue-500" };
    return { label: "Needs Improvement", style: "text-rose-500" };
  };

  const getAccuracyRating = () => {
    if (accuracyVal >= 75) return "High Accuracy";
    if (accuracyVal >= 45) return "Moderate Accuracy";
    return "Low Accuracy";
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  const avgTimePerQuestion = totalQuestions > 0 ? (totalTimeSeconds / totalQuestions).toFixed(1) : "0";

  const scoreRating = getScoreRating();
  const correctQsRating = getCorrectQsRating();

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden bg-card hover:shadow-md transition-shadow select-none">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide">
              Total Score
            </span>
            <div className="flex items-baseline gap-0.5 leading-none">
              <span className="text-xl font-black text-foreground">{scoreVal}</span>
              <span className="text-[10px] font-bold text-muted-foreground">/ {maxVal}</span>
            </div>
            <div className="pt-1.5">
              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full select-none", scoreRating.style)}>
                {scoreRating.label}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden bg-card hover:shadow-md transition-shadow select-none">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="rounded-xl bg-violet-500/10 p-3 text-violet-600 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide">
              Accuracy
            </span>
            <div className="text-xl font-black text-foreground leading-none">
              {accuracyVal.toFixed(0)}%
            </div>
            <div className="pt-1 text-[9px] font-semibold text-muted-foreground">
              {getAccuracyRating()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden bg-card hover:shadow-md transition-shadow select-none">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide">
              Time Taken
            </span>
            <div className="text-xl font-black text-foreground leading-none">
              {formatTime(totalTimeSeconds)}
            </div>
            <div className="pt-1 text-[9px] font-semibold text-muted-foreground">
              Avg. {avgTimePerQuestion}s per question
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden bg-card hover:shadow-md transition-shadow select-none">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide">
              Correct Qs
            </span>
            <div className="flex items-baseline gap-0.5 leading-none">
              <span className="text-xl font-black text-foreground">{totalCorrect}</span>
              <span className="text-[10px] font-bold text-muted-foreground">/ {totalQuestions}</span>
            </div>
            <div className={cn("pt-1 text-[9px] font-bold", correctQsRating.style)}>
              {correctQsRating.label}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
