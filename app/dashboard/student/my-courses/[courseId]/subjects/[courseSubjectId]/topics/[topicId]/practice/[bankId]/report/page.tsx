"use client";

import React, { useState, Suspense, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CbtLayout } from "@/components/cbt/_components/cbt-layout";
import { QuestionCard } from "@/components/cbt/_components/question-card";
import { usePracticeReportQuery, PRACTICE_QUERY_KEYS } from "../../_queries/practice.queries";
import { getOrStartPracticeAttempt} from "../../_api/practice.api";
import { useQueryClient } from "@tanstack/react-query";
import { useStudentCourseDetailQuery } from "../../../../../../../_queries/course-detail.queries";

// Modular report components
import { MetricsGrid } from "./_components/metrics-grid";
import { DonutChart } from "./_components/donut-chart";
import { ScoreTrendChart } from "./_components/score-trend-chart";
import { SectionPerformance } from "./_components/section-performance";

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
  const allAttempts = payload?.allAttempts || [];
  const questions = useMemo(() => payload?.questions || [], [payload?.questions]);
  const sections = useMemo(() => payload?.sections || [], [payload?.sections]);

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
        `/dashboard/student/my-courses/${courseId}/subjects/${courseSubjectId}/topics/[topicId]/practice/${bankId}/attempt`
      );
    } catch (err) {
      console.error("Failed to start fresh attempt", err);
      setStartingFresh(false);
    }
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

  const handleSelectAttempt = (id: string) => {
    router.push(
      `/dashboard/student/my-courses/${courseId}/subjects/${courseSubjectId}/topics/${topicId}/practice/${bankId}/report?attemptId=${id}`
    );
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
            {allAttempts.length > 1 ? (
              <div className="relative">
                <select
                  value={attempt.id}
                  onChange={(e) => {
                    const selected = allAttempts.find((a: { id: string; attemptNumber: number }) => a.id === e.target.value);
                    if (selected) {
                      handleSelectAttempt(selected.id);
                    }
                  }}
                  className="bg-primary/10 text-primary border-none rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider focus:outline-none cursor-pointer hover:bg-primary/15 transition-colors"
                >
                  {allAttempts.map((a: { id: string; attemptNumber: number }) => (
                    <option key={a.id} value={a.id} className="bg-popover text-foreground">
                      Attempt #{a.attemptNumber}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                Attempt #{attempt.attemptNumber}
              </span>
            )}
            <span className="text-xs text-muted-foreground font-semibold">
              Completed on {new Date(attempt.completedAt!).toLocaleString()}
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
            <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground font-semibold">
              Complete more attempts to unlock history trends.
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
                No section details available for this question bank.
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

      {/* 6. Interactive Navigator Board */}
      <Card className="rounded-2xl border-border/80 shadow-sm md:col-span-2 bg-card">
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

          {/* Quick legend */}
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

      {/* 7. Bottom Call-to-Action */}
      <Card className="rounded-3xl border-border bg-gradient-to-r from-violet-500/10 via-primary/5 to-transparent p-6 flex flex-col md:flex-row justify-between items-center gap-5 select-none">
        <div className="text-center md:text-left space-y-1">
          <h4 className="text-sm font-black text-foreground">Keep practicing!</h4>
          <p className="text-xs text-muted-foreground font-semibold">
            {"Consistent practice is the key to improvement. You're on the right track."}
          </p>
        </div>
        <Button
          onClick={handleStartFresh}
          className="min-h-[44px] rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-6 cursor-pointer text-xs uppercase tracking-wider"
        >
          Start New Practice
        </Button>
      </Card>

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
