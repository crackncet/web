"use client";

import React, { useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CbtLayout } from "@/components/cbt/_components/cbt-layout";
import { QuestionCard } from "@/components/cbt/_components/question-card";
import { usePracticeReportQuery } from "../../_queries/practice.queries";
import { getOrStartPracticeAttempt } from "../../_api/practice.api";
import { useQueryClient } from "@tanstack/react-query";
import { PRACTICE_QUERY_KEYS } from "../../_queries/practice.queries";
import { useStudentCourseDetailQuery } from "../../../../../../../_queries/course-detail.queries";

function PracticeReportContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const courseId = params.courseId as string;
  const courseSubjectId = params.courseSubjectId as string;
  const topicId = params.topicId as string;
  const bankId = params.bankId as string;

  const attemptId = searchParams.get("attemptId") || undefined;
  const attemptNumberStr = searchParams.get("attemptNumber");
  const attemptNumber = attemptNumberStr ? parseInt(attemptNumberStr, 10) : undefined;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(true);
  const [startingFresh, setStartingFresh] = useState(false);

  // Fetch report details
  const { data: response, isLoading, isError, error } = usePracticeReportQuery(bankId, {
    attemptId,
    attemptNumber,
  });
  const payload = response?.data;
  const attempt = payload?.attempt;
  const questions = payload?.questions || [];
  const sections = payload?.sections || [];

  // Fetch syllabus details for subjectName lookup
  const { data: syllabusResponse } = useStudentCourseDetailQuery(courseId);
  const syllabus = syllabusResponse?.data;
  const subject = syllabus?.subjects.find((sub) => sub.courseSubjectId === courseSubjectId);
  const subjectName = subject?.subjectName || "Practice";

  const handleClose = () => {
    router.push(`/dashboard/student/my-courses/${courseId}/subjects/${courseSubjectId}/topics/${topicId}`);
  };

  const handleStartFresh = async () => {
    setStartingFresh(true);
    try {
      await getOrStartPracticeAttempt(bankId, true);
      // Invalidate keys to refetch
      queryClient.invalidateQueries({
        queryKey: PRACTICE_QUERY_KEYS.attempt(bankId),
      });
      // Redirect to active attempt page
      router.push(
        `/dashboard/student/my-courses/${courseId}/subjects/${courseSubjectId}/topics/${topicId}/practice/${bankId}/attempt`
      );
    } catch (err) {
      console.error("Failed to start fresh attempt", err);
      setStartingFresh(false);
    }
  };

  if (isLoading || startingFresh) {
    return (
      <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-sm font-semibold text-muted-foreground select-none">
          Generating diagnostic dashboard...
        </span>
      </div>
    );
  }

  if (isError || !attempt) {
    return (
      <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center p-6 text-center select-none">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-bold text-foreground">Failed to Load Report</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-2 mb-6">
          {error instanceof Error ? error.message : "The diagnostic data is only available for completed practice attempts."}
        </p>
        <Button onClick={handleClose} className="min-h-[44px] px-6 rounded-xl">
          Back to Topic Resources
        </Button>
      </div>
    );
  }

  // Format time spent helper
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  const evaluatedResponses = attempt.responses?.questions || [];

  // Group questions by section for grid
  const questionsBySection = sections.reduce<Record<string, typeof questions>>((acc, sec) => {
    acc[sec.id] = questions.filter((q) => q.sectionId === sec.id);
    return acc;
  }, {});
  const unsortedQuestions = questions.filter(
    (q) => !q.sectionId || !questionsBySection[q.sectionId]
  );

  const getQuestionResultIcon = (questionId: string) => {
    const resp = evaluatedResponses.find((r) => r.questionId === questionId);
    if (!resp) return "border-border text-muted-foreground";
    if (resp.isCorrect) return "bg-emerald-500 border-emerald-500 text-white";
    if (resp.isPartiallyCorrect) return "bg-blue-500 border-blue-500 text-white";
    if (resp.isCorrect === false) return "bg-rose-500 border-rose-500 text-white";
    return "border-border text-muted-foreground";
  };

  const activeQuestion = questions[currentIndex];
  const activeResponse = evaluatedResponses.find((r) => r.questionId === activeQuestion?.id);

  if (!showSummary) {
    return (
      <CbtLayout
        mode="REPORT"
        title={attempt.source === "DPP" ? "DPP Solutions Review" : "Practice Set Solutions Review"}
        subjectName={subjectName}
        questions={questions}
        sections={sections}
        currentIndex={currentIndex}
        onSelectIndex={setCurrentIndex}
        evaluatedResponses={evaluatedResponses as any[]}
        onClose={() => setShowSummary(true)}
      >
        {activeQuestion && (
          <QuestionCard
            question={activeQuestion}
            questionNumber={currentIndex + 1}
            isReportMode={true}
            selectedOptionIds={activeResponse?.selectedOptionIds || []}
            numericAnswer={activeResponse?.numericAnswer || ""}
            evaluatedResponse={activeResponse as any}
          />
        )}
      </CbtLayout>
    );
  }

  return (
    <div className="space-y-6 pb-16 select-none max-w-4xl mx-auto">
      {/* 1. Header Hero Panel */}
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8 border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
              Attempt #{attempt.attemptNumber}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              Completed on {new Date(attempt.completedAt!).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-foreground">
            {attempt.source === "DPP" ? "DPP Performance Report" : "Practice Set Performance Report"}
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            {subjectName} • Detailed diagnostic analysis and solution keys
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setShowSummary(false);
            }}
            className="flex-1 md:flex-none min-h-[44px] rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 px-5 cursor-pointer"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>Review Solutions</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleStartFresh}
            className="flex-1 md:flex-none min-h-[44px] rounded-xl font-bold border-border bg-card hover:bg-muted/40 gap-1.5 px-5 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span>Re-Attempt Fresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Diagnostic Score Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score widget */}
        <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground/85 uppercase tracking-wide">
                Total Score
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-black text-foreground">{parseFloat(attempt.totalScore)}</span>
                <span className="text-[10px] font-bold text-muted-foreground">/ {parseFloat(attempt.maxPossibleScore)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accuracy widget */}
        <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-600 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground/85 uppercase tracking-wide">
                Accuracy
              </span>
              <div className="text-lg font-black text-foreground">
                {parseFloat(attempt.accuracy).toFixed(0)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time spent widget */}
        <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground/85 uppercase tracking-wide">
                Time Taken
              </span>
              <div className="text-lg font-black text-foreground">
                {formatTime(attempt.totalTimeSeconds)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions answered widget */}
        <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground/85 uppercase tracking-wide">
                Correct Qs
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-black text-foreground">{attempt.totalCorrect}</span>
                <span className="text-[10px] font-bold text-muted-foreground">/ {attempt.totalQuestions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Detailed Stats Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column: Score analysis chart card */}
        <Card className="rounded-2xl border-border/80 shadow-sm md:col-span-1">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Response Breakdown
            </h3>

            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Correct</span>
                </span>
                <span className="text-foreground">{attempt.totalCorrect}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>Partially Correct</span>
                </span>
                <span className="text-foreground">{attempt.totalPartialCorrect}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>Incorrect</span>
                </span>
                <span className="text-foreground">{attempt.totalIncorrect}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Unattempted</span>
                </span>
                <span className="text-foreground">
                  {attempt.totalQuestions - attempt.totalAttempted}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Interactive Navigator Board */}
        <Card className="rounded-2xl border-border/80 shadow-sm md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Navigator Board (Tap to view solutions)
            </h3>

            <div className="space-y-6">
              {sections.map((sec) => {
                const secQuestions = questionsBySection[sec.id] || [];
                if (secQuestions.length === 0) return null;
                return (
                  <div key={sec.id} className="space-y-2">
                    <h4 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide border-b border-border/60 pb-1">
                      {sec.title}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {secQuestions.map((q) => {
                        const overallIndex = questions.findIndex((item) => item.id === q.id);
                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              setCurrentIndex(overallIndex);
                              setShowSummary(false);
                            }}
                            className={`h-9 w-9 border rounded-lg flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${getQuestionResultIcon(
                              q.id
                            )}`}
                          >
                            {overallIndex + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {unsortedQuestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide border-b border-border/60 pb-1">
                    Questions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {unsortedQuestions.map((q) => {
                      const overallIndex = questions.findIndex((item) => item.id === q.id);
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentIndex(overallIndex);
                            setShowSummary(false);
                          }}
                          className={`h-9 w-9 border rounded-lg flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${getQuestionResultIcon(
                            q.id
                          )}`}
                        >
                          {overallIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick legend */}
            <div className="flex flex-wrap gap-3 pt-5 mt-5 border-t border-border/50 text-[10px] font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-blue-500" />
                <span>Partially Correct</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-500" />
                <span>Wrong</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border border-border rounded" />
                <span>Unattempted</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={handleClose}
          className="min-h-[44px] px-8 rounded-xl font-bold border-border bg-card hover:bg-muted/40 cursor-pointer"
        >
          Return to Subject
        </Button>
      </div>
    </div>
  );
}

export default function PracticeReportPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <span className="text-sm font-semibold text-muted-foreground select-none">
            Loading report data...
          </span>
        </div>
      }
    >
      <PracticeReportContent />
    </Suspense>
  );
}
