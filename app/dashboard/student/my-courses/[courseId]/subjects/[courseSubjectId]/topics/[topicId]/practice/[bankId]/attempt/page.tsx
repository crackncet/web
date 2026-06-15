"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CbtLayout } from "@/components/cbt/_components/cbt-layout";
import { QuestionCard } from "@/components/cbt/_components/question-card";
import { usePracticeAttemptQuery } from "../../_queries/practice.queries";
import { getOrStartPracticeAttempt } from "../../_api/practice.api";
import { useSubmitPracticeAttemptMutation } from "../../_queries/practice.queries";
import {
  getLocalAttemptState,
  saveLocalAttemptState,
  deleteLocalAttemptState,
  LocalAttemptState,
  LocalQuestionResponse,
} from "../../_store/practice-local";
import { useQueryClient } from "@tanstack/react-query";
import { PRACTICE_QUERY_KEYS } from "../../_queries/practice.queries";
import { useStudentCourseDetailQuery } from "../../../../../../../_queries/course-detail.queries";

export default function PracticeAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const courseId = params.courseId as string;
  const courseSubjectId = params.courseSubjectId as string;
  const topicId = params.topicId as string;
  const bankId = params.bankId as string;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [localState, setLocalState] = useState<LocalAttemptState | null>(null);
  const [startingFresh, setStartingFresh] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Fetch subject name from course syllabus details
  const { data: syllabusResponse } = useStudentCourseDetailQuery(courseId);
  const syllabus = syllabusResponse?.data;
  const subject = syllabus?.subjects.find((sub) => sub.courseSubjectId === courseSubjectId);
  const subjectName = subject?.subjectName || "Practice";

  // Fetch active practice attempt
  const { data: response, isLoading, isError, error, refetch } = usePracticeAttemptQuery(bankId);
  const payload = response?.data;
  const attempt = payload?.attempt;
  const questions = payload?.questions || [];
  const sections = payload?.sections || [];

  // Active question ID
  const activeQuestion = questions[currentIndex];

  // Ref to track elapsed time per question
  const timeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Submit mutation
  const submitMutation = useSubmitPracticeAttemptMutation(bankId);

  // 1. Load local state from IndexedDB when attempt metadata is loaded
  useEffect(() => {
    if (!attempt || attempt.status !== "IN_PROGRESS") return;

    const loadState = async () => {
      const stored = await getLocalAttemptState(attempt.id);
      if (stored) {
        setLocalState(stored);
        // Restore last viewed question if valid
        if (stored.currentQuestionId) {
          const lastIndex = questions.findIndex((q) => q.id === stored.currentQuestionId);
          if (lastIndex !== -1) {
            setCurrentIndex(lastIndex);
          }
        }
      } else {
        // Initialize local state from attempt responses (if resuming from backend)
        const initialResponses: Record<string, LocalQuestionResponse> = {};
        
        // Backend responses format
        const backendResponses = attempt.responses?.questions || [];
        
        questions.forEach((q) => {
          const existing = backendResponses.find((r) => r.questionId === q.id);
          initialResponses[q.id] = {
            questionId: q.id,
            selectedOptionIds: existing?.selectedOptionIds || [],
            numericAnswer: existing?.numericAnswer || null,
            timeSpentSeconds: existing?.timeSpentSeconds || 0,
            status: existing?.status || "NOT_VISITED",
          };
        });

        const newState: LocalAttemptState = {
          attemptId: attempt.id,
          responses: initialResponses,
          currentQuestionId: activeQuestion?.id,
        };
        await saveLocalAttemptState(newState);
        setLocalState(newState);
      }
    };

    loadState();
  }, [attempt, questions]);

  // 2. Track time spent on the active question
  useEffect(() => {
    if (!localState || !activeQuestion || attempt?.status !== "IN_PROGRESS") return;

    // Save active question tracking
    const updateActiveQuestionLocally = async () => {
      const updated = {
        ...localState,
        currentQuestionId: activeQuestion.id,
      };
      await saveLocalAttemptState(updated);
      setLocalState(updated);
    };
    updateActiveQuestionLocally();

    // Start timer interval to track time spent
    timeTimerRef.current = setInterval(() => {
      setLocalState((prev) => {
        if (!prev) return null;
        const currentResp = prev.responses[activeQuestion.id] || {
          questionId: activeQuestion.id,
          selectedOptionIds: [],
          numericAnswer: null,
          timeSpentSeconds: 0,
          status: "NOT_VISITED",
        };

        const updatedResp = {
          ...currentResp,
          timeSpentSeconds: currentResp.timeSpentSeconds + 1,
        };

        const nextState = {
          ...prev,
          responses: {
            ...prev.responses,
            [activeQuestion.id]: updatedResp,
          },
        };

        // Save periodically (non-blocking)
        saveLocalAttemptState(nextState);
        return nextState;
      });
    }, 1000);

    return () => {
      if (timeTimerRef.current) {
        clearInterval(timeTimerRef.current);
      }
    };
  }, [currentIndex, activeQuestion?.id, !!localState, attempt?.id]);

  // 3. Handle response changes inside QuestionCard
  const handleChangeResponse = (selectedIds: string[], numValue: string | null) => {
    if (!localState || !activeQuestion) return;

    setLocalState((prev) => {
      if (!prev) return null;
      const currentResp = prev.responses[activeQuestion.id] || {
        questionId: activeQuestion.id,
        selectedOptionIds: [],
        numericAnswer: null,
        timeSpentSeconds: 0,
        status: "NOT_VISITED",
      };

      const hasAnswer = selectedIds.length > 0 || numValue !== null;
      const isMarked =
        currentResp.status === "MARKED_FOR_REVIEW" ||
        currentResp.status === "ANSWERED_AND_MARKED";

      let nextStatus: LocalQuestionResponse["status"] = "NOT_VISITED";
      if (hasAnswer) {
        nextStatus = isMarked ? "ANSWERED_AND_MARKED" : "ANSWERED";
      } else {
        nextStatus = isMarked ? "MARKED_FOR_REVIEW" : "NOT_ANSWERED";
      }

      const updatedResp: LocalQuestionResponse = {
        ...currentResp,
        selectedOptionIds: selectedIds,
        numericAnswer: numValue,
        status: nextStatus,
      };

      const nextState = {
        ...prev,
        responses: {
          ...prev.responses,
          [activeQuestion.id]: updatedResp,
        },
      };

      saveLocalAttemptState(nextState);
      return nextState;
    });
  };

  // 4. Handle Clear Response
  const handleClearResponse = () => {
    if (!localState || !activeQuestion) return;

    setLocalState((prev) => {
      if (!prev) return null;
      const currentResp = prev.responses[activeQuestion.id] || {
        questionId: activeQuestion.id,
        selectedOptionIds: [],
        numericAnswer: null,
        timeSpentSeconds: 0,
        status: "NOT_VISITED",
      };

      const updatedResp: LocalQuestionResponse = {
        ...currentResp,
        selectedOptionIds: [],
        numericAnswer: null,
        status: "NOT_ANSWERED", // Clear answer and clear mark status
      };

      const nextState = {
        ...prev,
        responses: {
          ...prev.responses,
          [activeQuestion.id]: updatedResp,
        },
      };

      saveLocalAttemptState(nextState);
      return nextState;
    });
  };

  // 5. Handle Toggle Mark for Review
  const handleMarkForReview = () => {
    if (!localState || !activeQuestion) return;

    setLocalState((prev) => {
      if (!prev) return null;
      const currentResp = prev.responses[activeQuestion.id] || {
        questionId: activeQuestion.id,
        selectedOptionIds: [],
        numericAnswer: null,
        timeSpentSeconds: 0,
        status: "NOT_VISITED",
      };

      const hasAnswer =
        currentResp.selectedOptionIds.length > 0 || currentResp.numericAnswer !== null;
      const isCurrentlyMarked =
        currentResp.status === "MARKED_FOR_REVIEW" ||
        currentResp.status === "ANSWERED_AND_MARKED";

      let nextStatus: LocalQuestionResponse["status"] = "NOT_VISITED";
      if (isCurrentlyMarked) {
        // Unmark
        nextStatus = hasAnswer ? "ANSWERED" : "NOT_ANSWERED";
      } else {
        // Mark
        nextStatus = hasAnswer ? "ANSWERED_AND_MARKED" : "MARKED_FOR_REVIEW";
      }

      const updatedResp: LocalQuestionResponse = {
        ...currentResp,
        status: nextStatus,
      };

      const nextState = {
        ...prev,
        responses: {
          ...prev.responses,
          [activeQuestion.id]: updatedResp,
        },
      };

      saveLocalAttemptState(nextState);
      return nextState;
    });
  };

  // 6. Save current state locally (explicit save)
  const handleSaveResponse = async () => {
    if (!localState) return;
    await saveLocalAttemptState(localState);
  };

  // 7. Handle Submit Attempt
  const handleSubmitAttempt = async () => {
    if (!attempt || !localState) return;

    setConfirmSubmitOpen(true);
  };

  const confirmSubmit = async () => {
    if (!attempt || !localState) return;

    setConfirmSubmitOpen(false);

    // Format local state responses list for submission API payload
    const responsesList = Object.values(localState.responses);

    try {
      const res = await submitMutation.mutateAsync({
        attemptId: attempt.id,
        responses: responsesList,
      });

      // Clear local state from IndexedDB
      await deleteLocalAttemptState(attempt.id);

      // Redirect to report view page
      router.push(
        `/dashboard/student/my-courses/${courseId}/subjects/${courseSubjectId}/topics/${topicId}/practice/${bankId}/report?attemptId=${res.data.attempt.id}`
      );
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  // 8. Trigger Fresh attempt flow
  const handleStartFresh = async () => {
    setStartingFresh(true);
    try {
      await getOrStartPracticeAttempt(bankId, true);
      // Invalidate key to reload fresh details
      queryClient.invalidateQueries({
        queryKey: PRACTICE_QUERY_KEYS.attempt(bankId),
      });
      // Refetch
      await refetch();
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to start fresh attempt", err);
    } finally {
      setStartingFresh(false);
    }
  };

  // Navigation out
  const handleClose = () => {
    router.push(`/dashboard/student/my-courses/${courseId}/subjects/${courseSubjectId}/topics/${topicId}`);
  };

  // Render Loader
  if (isLoading || startingFresh) {
    return (
      <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-sm font-semibold text-muted-foreground select-none">
          Setting up practice environment...
        </span>
      </div>
    );
  }

  // Render Error
  if (isError || !attempt) {
    return (
      <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center p-6 text-center select-none">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-bold text-foreground">Practice Session Load Failed</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-2 mb-6">
          {error instanceof Error ? error.message : "You might not have active permissions to attempt this question bank."}
        </p>
        <Button onClick={handleClose} className="min-h-[44px] px-6 rounded-xl">
          Back to Topic Resources
        </Button>
      </div>
    );
  }

  // Handle case where attempt is already completed but student navigated here
  if (attempt.status === "COMPLETED") {
    return (
      <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="rounded-full bg-emerald-500/10 p-4 mb-4">
          <CheckSquare className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Practice Session Completed</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-2 mb-8">
          You have already completed this practice set. Would you like to view the detailed diagnostic report, or reset and start a fresh practice run?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button
            onClick={() =>
              router.push(
                `/dashboard/student/my-courses/${courseId}/subjects/${courseSubjectId}/topics/${topicId}/practice/${bankId}/report?attemptId=${attempt.id}`
              )
            }
            className="flex-1 min-h-[44px] rounded-xl font-bold"
          >
            View Report
          </Button>
          <Button
            variant="outline"
            onClick={handleStartFresh}
            className="flex-1 min-h-[44px] rounded-xl font-bold border-border"
          >
            Attempt Fresh
          </Button>
        </div>
        <Button variant="ghost" onClick={handleClose} className="mt-4 text-xs font-semibold text-muted-foreground">
          Cancel & Go Back
        </Button>
      </div>
    );
  }

  // Format local status values for Navigator indicator
  const mappedResponses: Record<string, any> = {};
  if (localState) {
    Object.keys(localState.responses).forEach((key) => {
      mappedResponses[key] = {
        selectedOptionIds: localState.responses[key].selectedOptionIds,
        numericAnswer: localState.responses[key].numericAnswer,
        status: localState.responses[key].status,
      };
    });
  }

  const activeResponse = localState?.responses[activeQuestion?.id] || {
    selectedOptionIds: [],
    numericAnswer: "",
  };

  return (
    <>
      <CbtLayout
        mode="PRACTICE"
        title={attempt.source === "DPP" ? "Daily Practice Problem (DPP)" : "Chapter Practice Set"}
        subjectName={subjectName}
        questions={questions}
        sections={sections}
        currentIndex={currentIndex}
        onSelectIndex={setCurrentIndex}
        responses={mappedResponses}
        onSaveResponse={handleSaveResponse}
        onMarkForReview={handleMarkForReview}
        onClearResponse={handleClearResponse}
        onSubmit={handleSubmitAttempt}
        onClose={handleClose}
      >
        {activeQuestion && (
          <QuestionCard
            question={activeQuestion}
            questionNumber={currentIndex + 1}
            selectedOptionIds={activeResponse.selectedOptionIds}
            numericAnswer={activeResponse.numericAnswer}
            onChangeResponse={handleChangeResponse}
            onClearResponse={handleClearResponse}
            isReportMode={false}
          />
        )}
      </CbtLayout>

      {/* Confirmation Submit dialog */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150 select-none">
            <h3 className="text-base font-bold text-foreground">Submit Practice Paper?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to submit your answers? This will finish the attempt session and generate your score analysis.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmSubmitOpen(false)}
                className="flex-1 min-h-[44px] rounded-xl font-semibold border-border cursor-pointer"
              >
                Go Back
              </Button>
              <Button
                onClick={confirmSubmit}
                disabled={submitMutation.isPending}
                className="flex-1 min-h-[44px] rounded-xl font-bold bg-emerald-600 hover:bg-emerald-600/90 text-white cursor-pointer"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                ) : null}
                <span>Confirm</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
