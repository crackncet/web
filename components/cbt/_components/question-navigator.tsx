"use client";

import React from "react";
import { Star, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PracticeQuestion, PracticeSection } from "@/app/dashboard/student/my-courses/[courseId]/subjects/[courseSubjectId]/topics/[topicId]/practice/_api/practice.api";

interface QuestionNavigatorProps {
  questions: PracticeQuestion[];
  sections: PracticeSection[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  // Local state responses in attempt mode
  responses?: Record<
    string,
    {
      selectedOptionIds: string[];
      numericAnswer: string | null;
      status: "ANSWERED" | "NOT_ANSWERED" | "MARKED_FOR_REVIEW" | "ANSWERED_AND_MARKED" | "NOT_VISITED";
    }
  >;
  isReportMode?: boolean;
  // Evaluated responses from the API response
  evaluatedResponses?: Array<{
    questionId: string;
    isCorrect: boolean | null;
    isPartiallyCorrect: boolean;
    status: string;
  }>;
  className?: string;
  onCloseMobileSheet?: () => void;
}

export function QuestionNavigator({
  questions,
  sections,
  currentIndex,
  onSelectIndex,
  responses = {},
  isReportMode = false,
  evaluatedResponses = [],
  className,
  onCloseMobileSheet,
}: QuestionNavigatorProps) {
  // Helper to determine status for each question
  const getQuestionStatus = (questionId: string, index: number) => {
    if (isReportMode) {
      const evalResp = evaluatedResponses.find((r) => r.questionId === questionId);
      if (!evalResp) {
        return {
          bgClass: "bg-background border-border text-muted-foreground",
          label: "Not Answered",
          icon: null,
        };
      }

      const isMarked = evalResp.status === "MARKED_FOR_REVIEW" || evalResp.status === "ANSWERED_AND_MARKED";

      if (evalResp.isCorrect) {
        return {
          bgClass: "bg-emerald-500 text-white border-emerald-500",
          label: "Fully Correct",
          icon: isMarked ? <Star className="h-3 w-3 fill-amber-300 text-amber-300 absolute -top-1 -right-1" /> : null,
        };
      } else if (evalResp.isPartiallyCorrect) {
        return {
          bgClass: "bg-blue-500 text-white border-blue-500",
          label: "Partially Correct",
          icon: isMarked ? <Star className="h-3 w-3 fill-amber-300 text-amber-300 absolute -top-1 -right-1" /> : null,
        };
      } else if (evalResp.isCorrect === false) {
        return {
          bgClass: "bg-rose-500 text-white border-rose-500",
          label: "Wrong Response",
          icon: isMarked ? <Star className="h-3 w-3 fill-amber-300 text-amber-300 absolute -top-1 -right-1" /> : null,
        };
      } else {
        return {
          bgClass: "bg-background border-border text-muted-foreground",
          label: "Not Answered",
          icon: isMarked ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : null,
        };
      }
    } else {
      // Attempt mode local state
      const local = responses[questionId];
      if (!local) {
        return {
          bgClass: "bg-background border-border text-muted-foreground",
          label: "Not Visited",
          icon: null,
        };
      }

      switch (local.status) {
        case "ANSWERED":
          return {
            bgClass: "bg-emerald-600 text-white border-emerald-600",
            label: "Answered",
            icon: null,
          };
        case "MARKED_FOR_REVIEW":
          return {
            bgClass: "bg-background border-amber-500 text-amber-600",
            label: "Marked for Review",
            icon: <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />,
          };
        case "ANSWERED_AND_MARKED":
          return {
            bgClass: "bg-emerald-600 text-white border-emerald-600",
            label: "Answered & Marked",
            icon: <Star className="h-3 w-3 fill-amber-400 text-amber-400 absolute -top-1 -right-1" />,
          };
        case "NOT_ANSWERED":
          return {
            bgClass: "bg-background border-red-400 text-red-500",
            label: "Not Answered",
            icon: null,
          };
        default:
          return {
            bgClass: "bg-background border-border text-muted-foreground",
            label: "Not Visited",
            icon: null,
          };
      }
    }
  };

  // Group questions by section
  const questionsBySection = sections.reduce<Record<string, typeof questions>>((acc, sec) => {
    acc[sec.id] = questions.filter((q) => q.sectionId === sec.id);
    return acc;
  }, {});

  // For questions with no section
  const unsortedQuestions = questions.filter((q) => !q.sectionId || !questionsBySection[q.sectionId]);

  const handleSelectQuestion = (qId: string) => {
    const idx = questions.findIndex((q) => q.id === qId);
    if (idx !== -1) {
      onSelectIndex(idx);
      onCloseMobileSheet?.();
    }
  };

  const renderGrid = (qs: typeof questions) => {
    return (
      <div className="flex flex-wrap gap-2">
        {qs.map((q) => {
          const overallIndex = questions.findIndex((item) => item.id === q.id);
          const isSelected = overallIndex === currentIndex;
          const status = getQuestionStatus(q.id, overallIndex);

          return (
            <button
              key={q.id}
              onClick={() => handleSelectQuestion(q.id)}
              className={cn(
                "relative h-9 w-9 shrink-0 flex items-center justify-center rounded-full border text-xs font-bold transition-all focus:outline-none cursor-pointer hover:scale-105 active:scale-95",
                status.bgClass,
                isSelected && "ring-2 ring-primary ring-offset-2 scale-105"
              )}
            >
              {status.icon && status.icon.props.className?.includes("absolute") ? (
                <>
                  <span>{overallIndex + 1}</span>
                  {status.icon}
                </>
              ) : status.icon ? (
                status.icon
              ) : (
                <span>{overallIndex + 1}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full bg-card text-foreground", className)}>
      <div className="flex-1 overflow-y-auto space-y-5 pl-2.5 pr-1 py-2">
        {/* Sections grouped */}
        {sections.map((sec) => {
          const secQuestions = questionsBySection[sec.id] || [];
          if (secQuestions.length === 0) return null;
          return (
            <div key={sec.id} className="space-y-2.5">
              <h4 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider select-none border-b border-border/60 pb-1.5">
                {sec.title}
              </h4>
              {renderGrid(secQuestions)}
            </div>
          );
        })}

        {/* Unsorted questions if any */}
        {unsortedQuestions.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider select-none border-b border-border/60 pb-1.5">
              Questions
            </h4>
            {renderGrid(unsortedQuestions)}
          </div>
        )}
      </div>

      {/* Legends Panel */}
      <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-xs select-none">
        <div className="grid grid-cols-2 gap-2">
          {isReportMode ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-md bg-emerald-500 border border-emerald-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span className="text-muted-foreground font-semibold text-[10px]">Fully Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-md bg-blue-500 border border-blue-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                  +1
                </span>
                <span className="text-muted-foreground font-semibold text-[10px]">Partially Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-md bg-rose-500 border border-rose-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                  <X className="h-2.5 w-2.5" />
                </span>
                <span className="text-muted-foreground font-semibold text-[10px]">Wrong Response</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-md bg-background border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0">
                  0
                </span>
                <span className="text-muted-foreground font-semibold text-[10px]">Not Answered</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-md bg-emerald-600 border border-emerald-600 shrink-0" />
                <span className="text-muted-foreground font-semibold text-[10px]">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-md bg-background border border-amber-500 flex items-center justify-center shrink-0">
                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                </span>
                <span className="text-muted-foreground font-semibold text-[10px]">Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-md bg-emerald-600 border border-emerald-600 flex items-center justify-center relative shrink-0">
                  <Star className="h-2 w-2 fill-amber-400 text-amber-400 absolute -top-0.5 -right-0.5" />
                </span>
                <span className="text-muted-foreground font-semibold text-[10px]">Ans & Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-md bg-background border border-border shrink-0" />
                <span className="text-muted-foreground font-semibold text-[10px]">Not Visited</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
