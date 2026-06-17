"use client";

import React, { useState, Suspense, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, BookOpen, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CbtLayout } from "@/components/cbt/_components/cbt-layout";
import { QuestionCard } from "@/components/cbt/_components/question-card";
import { useCbtReportQuery } from "../../../../_queries/cbt.queries";

// Modular report components
import { MetricsGrid } from "./_components/metrics-grid";
import { DonutChart } from "./_components/donut-chart";
import { ScoreTrendChart } from "./_components/score-trend-chart";
import { SectionPerformance } from "./_components/section-performance";

function CbtReportContent() {
  const params = useParams();
  const router = useRouter();

  const testSeriesId = params.testSeriesId as string;
  const testId = params.testId as string;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(true);

  // Fetch report details
  const { data: response, isLoading, isError, error } = useCbtReportQuery(testId);
  
  const payload = response?.data;
  const attempt = payload?.attempt;
  const allAttempts = payload?.allAttempts || [];
  const questions = useMemo(() => payload?.questions || [], [payload?.questions]);
  const sections = useMemo(() => payload?.sections || [], [payload?.sections]);

  const handleClose = () => {
    router.push(`/dashboard/student/my-test-series/${testSeriesId}`);
  };

  // Helper for parsing evaluation status from attempt responses
  const evaluatedResponses = useMemo(() => attempt?.responses?.questions || [], [attempt]);

  // Response breakdown calculation for donut chart
  const responseChartData = useMemo(() => {
    if (!attempt) return [];
    const total = attempt.totalQuestions || 1;
    const unattempted = attempt.totalQuestions - attempt.totalAttempted;

    return [
      {
        label: "Correct",
        value: attempt.totalCorrect,
        color: "#10b981", // emerald-500
        percentage: (attempt.totalCorrect / total) * 100,
      },
      {
        label: "Partially Correct",
        value: attempt.totalPartialCorrect,
        color: "#3b82f6", // blue-500
        percentage: (attempt.totalPartialCorrect / total) * 100,
      },
      {
        label: "Incorrect",
        value: attempt.totalIncorrect,
        color: "#f43f5e", // rose-500
        percentage: (attempt.totalIncorrect / total) * 100,
      },
      {
        label: "Unattempted",
        value: unattempted,
        color: "#64748b", // slate-500
        percentage: (unattempted / total) * 100,
      },
    ];
  }, [attempt]);

  // Group questions by section for index navigator mapping
  const questionsBySection = useMemo(() => {
    return sections.reduce<Record<string, typeof questions>>((acc, sec) => {
      acc[sec.id] = questions.filter((q) => q.sectionId === sec.id);
      return acc;
    }, {});
  }, [sections, questions]);

  const unsortedQuestions = useMemo(() => {
    return questions.filter((q) => !q.sectionId || !questionsBySection[q.sectionId]);
  }, [questions, questionsBySection]);

  const getQuestionResultIcon = (questionId: string) => {
    const resp = evaluatedResponses.find((r) => r.questionId === questionId);
    if (!resp) return "border-border text-muted-foreground";
    if (resp.isCorrect) return "bg-emerald-500 border-emerald-500 text-white";
    if (resp.isPartiallyCorrect) return "bg-blue-500 border-blue-500 text-white";
    if (resp.isCorrect === false) return "bg-rose-500 border-rose-500 text-white";
    return "border-border text-muted-foreground";
  };

  const handleSelectAttempt = (id: string, attemptNumber: number) => {
    // For CBT mock tests we view that specific attempt details
    router.push(
      `/dashboard/student/my-test-series/${testSeriesId}/tests/${testId}/report?attemptId=${id}`
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-sm font-semibold text-muted-foreground select-none">
          Generating exam diagnostic dashboard...
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
          {error instanceof Error ? error.message : "The diagnostic data is only available for fully evaluated exam attempts."}
        </p>
        <Button onClick={handleClose} className="min-h-[44px] px-6 rounded-xl">
          Back to Test Series
        </Button>
      </div>
    );
  }

  const activeQuestion = questions[currentIndex];
  const activeResponse = evaluatedResponses.find((r) => r.questionId === activeQuestion?.id);

  if (!showSummary) {
    return (
      <CbtLayout
        mode="REPORT"
        title="Official Exam Solutions"
        subjectName="Mock Examination"
        questions={questions}
        sections={sections}
        currentIndex={currentIndex}
        onSelectIndex={setCurrentIndex}
        evaluatedResponses={evaluatedResponses as React.ComponentProps<typeof CbtLayout>["evaluatedResponses"]}
        onClose={() => setShowSummary(true)}
      >
        {activeQuestion && (
          <QuestionCard
            question={activeQuestion}
            questionNumber={currentIndex + 1}
            isReportMode={true}
            selectedOptionIds={activeResponse?.selectedOptionIds || []}
            numericAnswer={activeResponse?.numericAnswer || ""}
            evaluatedResponse={activeResponse as React.ComponentProps<typeof QuestionCard>["evaluatedResponse"]}
          />
        )}
      </CbtLayout>
    );
  }

  return (
    <div className="space-y-6 pb-16 select-none max-w-7xl mx-auto px-4 md:px-0">
      {/* 1. Header Hero Panel */}
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8 border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2.5">
          <div className="flex items-center flex-wrap gap-2.5">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
              Attempt #{attempt.attemptNumber}
            </span>
            {attempt.evaluatedAt && (
              <span className="text-xs text-muted-foreground font-semibold">
                Evaluated on {new Date(attempt.evaluatedAt).toLocaleString()}
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-foreground">
            CBT Mock Test Performance Report
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Detailed diagnostic breakdown, subject analytics, and solution keys
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
            <span>Review Solution Key</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 md:flex-none min-h-[44px] rounded-xl font-bold border-border bg-card hover:bg-muted/40 gap-1.5 px-5 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span>Back to Series</span>
          </Button>
        </div>
      </div>

      {/* 2. Diagnostic Score Cards Grid */}
      <MetricsGrid
        totalScore={attempt.totalScore}
        maxPossibleScore={attempt.maxPossibleScore}
        accuracy={attempt.accuracy}
        totalTimeSeconds={attempt.totalTimeSeconds}
        totalQuestions={attempt.totalQuestions}
        totalCorrect={attempt.totalCorrect}
      />

      {/* 3. Graphical Score Trend (Full Width) */}
      <div className="w-full">
        {allAttempts.length > 0 ? (
          <ScoreTrendChart
            allAttempts={allAttempts}
            activeAttemptNumber={attempt.attemptNumber}
            maxPossibleScore={parseFloat(attempt.maxPossibleScore)}
            onSelectAttempt={handleSelectAttempt}
            className="w-full"
          />
        ) : (
          <Card className="rounded-2xl border-border/80 p-6 flex flex-col items-center justify-center text-center w-full">
            <span className="text-xs text-muted-foreground font-semibold">
              Mock tests trend will unlock as you complete more exams.
            </span>
          </Card>
        )}
      </div>

      {/* 4. Section Performance & Performance Overview Donut Grid */}
      <div className="grid lg:grid-cols-3 gap-6 items-stretch">
        {/* Left/Middle: Section Performance progress breakdown */}
        <div className="lg:col-span-2 flex flex-col justify-stretch">
          {sections.length > 0 ? (
            <SectionPerformance
              sections={sections}
              questions={questions}
              responses={evaluatedResponses}
            />
          ) : (
            <Card className="rounded-2xl border-border/80 p-6 flex flex-col items-center justify-center text-center h-full">
              <span className="text-xs text-muted-foreground font-semibold">
                No section details configured for this mock paper.
              </span>
            </Card>
          )}
        </div>

        {/* Right Side: Response Breakdown Donut Chart */}
        <DonutChart
          title="Performance Overview"
          data={responseChartData}
          totalLabel="Total Questions"
          totalValue={attempt.totalQuestions}
          className="h-full"
        />
      </div>

      {/* 5. Navigator Board */}
      <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
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
                          className={`h-9 w-9 border rounded-full flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${getQuestionResultIcon(
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
                        className={`h-9 w-9 border rounded-full flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${getQuestionResultIcon(
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

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-5 mt-5 border-t border-border/50 text-[10px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500" />
              <span>Partially Correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
              <span>Wrong</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border border-border rounded-full" />
              <span>Unattempted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CbtReportPage() {
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
      <CbtReportContent />
    </Suspense>
  );
}
