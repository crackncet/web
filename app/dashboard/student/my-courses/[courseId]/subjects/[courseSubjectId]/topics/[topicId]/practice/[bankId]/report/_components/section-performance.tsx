"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionItem {
  id: string;
  title: string;
  sequence: number;
}

interface QuestionItem {
  id: string;
  sectionId: string | null;
  correctMarks: string;
}

interface ResponseItem {
  questionId: string;
  selectedOptionIds: string[];
  numericAnswer: string | null;
  isCorrect: boolean | null;
  isPartiallyCorrect: boolean;
  marksAwarded: string;
  timeSpentSeconds: number;
}

interface SectionPerformanceProps {
  sections: SectionItem[];
  questions: QuestionItem[];
  responses: ResponseItem[];
  className?: string;
}

export function SectionPerformance({
  sections,
  questions,
  responses,
  className,
}: SectionPerformanceProps) {
  // Group questions by section
  const questionsBySection = React.useMemo(() => {
    const map: Record<string, QuestionItem[]> = {};
    questions.forEach((q) => {
      if (q.sectionId) {
        if (!map[q.sectionId]) map[q.sectionId] = [];
        map[q.sectionId].push(q);
      }
    });
    return map;
  }, [questions]);

  // Compute metrics per section
  const sectionData = React.useMemo(() => {
    return sections
      .map((sec) => {
        const secQuestions = questionsBySection[sec.id] || [];
        if (secQuestions.length === 0) return null;

        const secQuestionIds = new Set(secQuestions.map((q) => q.id));
        const secResponses = responses.filter((r) => secQuestionIds.has(r.questionId));

        const totalQuestions = secQuestions.length;
        const totalAttempted = secResponses.length;
        const totalCorrect = secResponses.filter((r) => r.isCorrect).length;

        // Sum up score
        const totalScore = secResponses.reduce((sum, r) => sum + parseFloat(r.marksAwarded || "0"), 0);
        const maxScore = secQuestions.reduce((sum, q) => sum + parseFloat(q.correctMarks || "4"), 0);

        // Accuracy
        const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

        // Total Time
        const totalTime = secResponses.reduce((sum, r) => sum + (r.timeSpentSeconds || 0), 0);

        return {
          id: sec.id,
          title: sec.title,
          totalQuestions,
          totalScore,
          maxScore,
          accuracy,
          totalTime,
        };
      })
      .filter(Boolean) as {
      id: string;
      title: string;
      totalQuestions: number;
      totalScore: number;
      maxScore: number;
      accuracy: number;
      totalTime: number;
    }[];
  }, [sections, questionsBySection, responses]);

  if (sectionData.length === 0) return null;

  // Find max time to scale visual progress bars relative to worst performing section
  const maxSectionTime = Math.max(...sectionData.map((s) => s.totalTime), 1);

  return (
    <Card className={cn("rounded-2xl border-border/80 shadow-sm overflow-hidden bg-card select-none", className)}>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Performance by Section
          </h3>
          <p className="text-[10px] text-muted-foreground font-semibold">
            Granular evaluation across question categories
          </p>
        </div>

        {/* List Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[320px]">
            <thead>
              <tr className="border-b border-border/50 text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">
                <th className="py-2.5 pb-2">Section</th>
                <th className="py-2.5 pb-2 text-center">Score</th>
                <th className="py-2.5 pb-2 text-center">Accuracy</th>
                <th className="py-2.5 pb-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {sectionData.map((sec) => {
                // Determine accuracy rating style
                const accColor =
                  sec.accuracy >= 75
                    ? "text-emerald-500"
                    : sec.accuracy >= 45
                    ? "text-blue-500"
                    : "text-rose-500";

                // Score styling (if score is negative, render in red)
                const isNegative = sec.totalScore < 0;

                return (
                  <tr key={sec.id} className="text-xs font-semibold group hover:bg-muted/10 transition-colors">
                    <td className="py-4 pr-3">
                      <div className="text-foreground font-bold">{sec.title}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">
                        {sec.totalQuestions} {sec.totalQuestions === 1 ? "Question" : "Questions"}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={cn("font-black", isNegative ? "text-rose-600" : "text-foreground")}>
                        {sec.totalScore}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-normal"> / {sec.maxScore}</span>
                    </td>
                    <td className={cn("py-4 text-center font-black", accColor)}>
                      {sec.accuracy.toFixed(0)}%
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-foreground">{sec.totalTime}s</span>
                        {/* Custom horizontal time bar */}
                        <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              sec.totalTime / sec.totalQuestions > 40
                                ? "bg-rose-500"
                                : sec.totalTime / sec.totalQuestions > 20
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            )}
                            style={{ width: `${(sec.totalTime / maxSectionTime) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
