"use client";

import React, { useState } from "react";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckSquare,
  HelpCircle,
  Eye,
  X,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { QuestionNavigator } from "./question-navigator";
import { PracticeQuestion, PracticeSection } from "@/app/dashboard/student/my-courses/[courseId]/subjects/[courseSubjectId]/topics/[topicId]/practice/_api/practice.api";

interface CbtLayoutProps {
  mode: "PRACTICE" | "TEST" | "REPORT";
  title: string;
  subjectName: string;
  questions: PracticeQuestion[];
  sections: PracticeSection[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  responses?: Record<
    string,
    {
      selectedOptionIds: string[];
      numericAnswer: string | null;
      status: "ANSWERED" | "NOT_ANSWERED" | "MARKED_FOR_REVIEW" | "ANSWERED_AND_MARKED" | "NOT_VISITED";
    }
  >;
  onSaveResponse?: () => void;
  onMarkForReview?: () => void;
  onClearResponse?: () => void;
  onSubmit?: () => void;
  onClose: () => void;
  evaluatedResponses?: Array<{
    questionId: string;
    isCorrect: boolean | null;
    isPartiallyCorrect: boolean;
    status: string;
  }>;
  children: React.ReactNode;
}

export function CbtLayout({
  mode,
  title,
  subjectName,
  questions,
  sections,
  currentIndex,
  onSelectIndex,
  responses = {},
  onSaveResponse,
  onMarkForReview,
  onClearResponse,
  onSubmit,
  onClose,
  evaluatedResponses = [],
  children,
}: CbtLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const totalQuestions = questions.length;
  const isReportMode = mode === "REPORT";

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      onSelectIndex(currentIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background w-screen h-screen flex flex-col select-none overflow-hidden">
      {/* 1. Header Bar */}
      <header className="h-14 md:h-16 border-b border-border/60 bg-card px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 border-border rounded-xl cursor-pointer hover:bg-muted/80 shrink-0"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </Button>

          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
              {subjectName} • {isReportMode ? "Practice Report" : "Practice Attempt"}
            </span>
            <h1 className="text-xs md:text-sm font-bold text-foreground line-clamp-1 max-w-[150px] sm:max-w-xs md:max-w-md">
              {title}
            </h1>
          </div>
        </div>

        {/* Right side mode & status chips */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-[10px] md:text-xs font-bold text-primary">
            {isReportMode ? "Review Mode" : "Practice Mode"}
          </span>

          {mode === "TEST" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-[10px] md:text-xs font-bold text-red-600">
              <Clock className="h-3.5 w-3.5" />
              <span>02:45:30</span>
            </div>
          )}
        </div>
      </header>

      {/* 2. Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar (Collapsible) */}
        <div
          className={cn(
            "hidden md:flex flex-col border-r border-border/60 bg-card transition-all duration-300 h-full overflow-hidden shrink-0",
            sidebarOpen ? "w-80" : "w-0 border-r-0"
          )}
        >
          {sidebarOpen && (
            <div className="flex-1 flex flex-col p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Question Navigator
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-muted text-muted-foreground">
                  {currentIndex + 1} / {totalQuestions}
                </span>
              </div>

              <div className="flex-1 overflow-hidden">
                <QuestionNavigator
                  questions={questions}
                  sections={sections}
                  currentIndex={currentIndex}
                  onSelectIndex={onSelectIndex}
                  responses={responses}
                  isReportMode={isReportMode}
                  evaluatedResponses={evaluatedResponses}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Toggle Handle for Desktop */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 z-50 h-20 w-4 bg-muted hover:bg-muted/80 border border-y-border border-r-border rounded-r-xl items-center justify-center text-muted-foreground transition-all duration-200"
          style={{
            transform: sidebarOpen ? `translateX(320px) translateY(-50%)` : `translateX(0px) translateY(-50%)`,
          }}
        >
          <span className="text-[10px] font-bold font-mono">
            {sidebarOpen ? "«" : "»"}
          </span>
        </button>

        {/* Main Question Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            <div className="max-w-3xl mx-auto h-full">
              {children}
            </div>
          </main>

          {/* Desktop Footer Actions (Fixed at bottom on desktop, replaced by mobile actions) */}
          <footer className="hidden md:flex h-16 border-t border-border/60 bg-card px-6 items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="h-10 text-xs font-bold rounded-xl border-border px-4 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 mr-1 shrink-0" />
                <span>Previous</span>
              </Button>

              <Button
                variant="outline"
                disabled={currentIndex === totalQuestions - 1}
                onClick={handleNext}
                className="h-10 text-xs font-bold rounded-xl border-border px-4 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {!isReportMode && (
                <>
                  {onMarkForReview && (
                    <Button
                      variant="outline"
                      onClick={onMarkForReview}
                      className="h-10 text-xs font-bold rounded-xl border-amber-500/20 text-amber-600 hover:bg-amber-500/5 px-4 cursor-pointer"
                    >
                      <Star className="h-4 w-4 mr-1 shrink-0" />
                      <span>Mark for Review</span>
                    </Button>
                  )}

                  {onSaveResponse && (
                    <Button
                      onClick={() => {
                        onSaveResponse();
                        handleNext();
                      }}
                      className="h-10 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-5 cursor-pointer"
                    >
                      <span>Save and Next</span>
                    </Button>
                  )}

                  {onSubmit && (
                    <Button
                      variant="destructive"
                      onClick={onSubmit}
                      className="h-10 text-xs font-bold rounded-xl px-5 cursor-pointer"
                    >
                      Submit Paper
                    </Button>
                  )}
                </>
              )}

              {isReportMode && (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="h-10 text-xs font-bold rounded-xl border-border px-5 cursor-pointer"
                >
                  Close Review
                </Button>
              )}
            </div>
          </footer>
        </div>
      </div>

      {/* 3. Mobile Navigation & Tab Actions Bar (<md viewports only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/60 select-none pb-[env(safe-area-inset-bottom)]">
        {/* Simple navigation footer overlay */}
        <div className="flex h-12 px-4 items-center justify-between border-b border-border/30 bg-muted/20">
          <Button
            variant="ghost"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="h-9 text-xs font-semibold px-2.5 text-muted-foreground shrink-0 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5 shrink-0" />
            <span>Prev</span>
          </Button>

          <span className="text-[10px] font-bold text-muted-foreground/80">
            Q. {currentIndex + 1} of {totalQuestions}
          </span>

          <Button
            variant="ghost"
            disabled={currentIndex === totalQuestions - 1}
            onClick={handleNext}
            className="h-9 text-xs font-semibold px-2.5 text-muted-foreground shrink-0 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4 ml-0.5 shrink-0" />
          </Button>
        </div>

        {/* Thumb-Reachable Action Tabs (Min height 56px, 44px touch targets) */}
        <div className="flex h-16 items-center justify-around">
          {/* Review Sheet Button */}
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center flex-1 h-full hover:bg-muted/30 focus:outline-none text-muted-foreground active:text-primary">
                <Menu className="h-5 w-5 shrink-0" />
                <span className="text-[9px] font-bold mt-1">Review</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] p-5">
              <SheetHeader className="text-left pb-4 border-b border-border flex flex-row items-center justify-between">
                <div>
                  <SheetTitle className="text-sm font-bold">Go to Question</SheetTitle>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    Navigate between questions and sections
                  </span>
                </div>
              </SheetHeader>
              <div className="mt-4 overflow-y-auto max-h-[50vh]">
                <QuestionNavigator
                  questions={questions}
                  sections={sections}
                  currentIndex={currentIndex}
                  onSelectIndex={onSelectIndex}
                  responses={responses}
                  isReportMode={isReportMode}
                  evaluatedResponses={evaluatedResponses}
                  onCloseMobileSheet={() => setMobileSheetOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Mark for Review Button */}
          {!isReportMode && onMarkForReview ? (
            <button
              onClick={onMarkForReview}
              className="flex flex-col items-center justify-center flex-1 h-full hover:bg-muted/30 focus:outline-none text-amber-600 active:text-amber-700"
            >
              <Star className="h-5 w-5 shrink-0" />
              <span className="text-[9px] font-bold mt-1">Mark</span>
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {/* Save & Next / Submit Button */}
          {!isReportMode ? (
            onSaveResponse && (
              <button
                onClick={() => {
                  onSaveResponse();
                  if (currentIndex === totalQuestions - 1 && onSubmit) {
                    onSubmit();
                  } else {
                    handleNext();
                  }
                }}
                className="flex flex-col items-center justify-center flex-1 h-full hover:bg-muted/30 focus:outline-none text-emerald-600 active:text-emerald-700"
              >
                <CheckSquare className="h-5 w-5 shrink-0" />
                <span className="text-[9px] font-bold mt-1">
                  {currentIndex === totalQuestions - 1 ? "Submit" : "Save"}
                </span>
              </button>
            )
          ) : (
            <button
              onClick={onClose}
              className="flex flex-col items-center justify-center flex-1 h-full hover:bg-muted/30 focus:outline-none text-muted-foreground active:text-foreground"
            >
              <X className="h-5 w-5 shrink-0" />
              <span className="text-[9px] font-bold mt-1">Close</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
