"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, Play, ShieldAlert, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CbtLayout } from "@/components/cbt/_components/cbt-layout";
import { QuestionCard } from "@/components/cbt/_components/question-card";
import {
  useCbtClockSyncQuery,
  useStartCbtAttemptMutation,
  useSyncCbtResponsesMutation,
  useSubmitCbtAttemptMutation,
  useResumeCbtAttemptQuery,
} from "../../../../_queries/cbt.queries";
import {
  saveCbtLocalState,
  getCbtLocalState,
  deleteCbtLocalState,
  CbtAttemptState,
  CbtQuestionResponse,
} from "../../../../_store/cbt-local";
import { useQueryClient } from "@tanstack/react-query";
import { STUDENT_TEST_SERIES_KEYS } from "../../../../_queries/my-test-series.queries";

export default function CbtAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const testSeriesId = params.testSeriesId as string;
  const testId = params.testId as string;

  // States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptStarted, setAttemptStarted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [localState, setLocalState] = useState<CbtAttemptState | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [syncSeq, setSyncSeq] = useState(0);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState<number | null>(null);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [secondsToStart, setSecondsToStart] = useState<number | null>(null);

  // Sync state tracking
  const dirtyQueueRef = useRef<Set<string>>(new Set());
  const isSyncingRef = useRef(false);
  const lastSyncTimeRef = useRef<number>(0);

  // Queries and mutations
  const { data: clockSyncResponse, isLoading: isClockSyncLoading } = useCbtClockSyncQuery(testId);
  const clockSync = clockSyncResponse?.data;

  const { data: resumeResponse, isLoading: isResumeLoading, isError: isResumeError } = useResumeCbtAttemptQuery(
    testId,
    !attemptStarted
  );

  const startMutation = useStartCbtAttemptMutation();
  const syncMutation = useSyncCbtResponsesMutation();
  const submitMutation = useSubmitCbtAttemptMutation();

  const activeQuestion = questions[currentIndex];
  const timeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start countdown tracking
  useEffect(() => {
    if (!clockSync || !clockSync.startsAt || attemptStarted) return;

    const startsAtTime = new Date(clockSync.startsAt).getTime();
    const serverTimeOffset = new Date(clockSync.serverTime).getTime() - Date.now();

    const updateCountdown = () => {
      const currentServerTime = Date.now() + serverTimeOffset;
      const diffSeconds = Math.max(0, Math.floor((startsAtTime - currentServerTime) / 1000));
      setSecondsToStart(diffSeconds);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [clockSync, attemptStarted]);

  const getStartCountdownText = () => {
    if (secondsToStart === null || secondsToStart <= 0) return null;
    const mins = Math.floor(secondsToStart / 60);
    const secs = secondsToStart % 60;
    return `Starts in ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // 1. Detect if active attempt exists on load and restore/setup
  useEffect(() => {
    if (resumeResponse?.data) {
      const payload = resumeResponse.data;
      setupAttemptSession(payload);
    }
  }, [resumeResponse]);

  // Setup attempt session helper
  const setupAttemptSession = async (payload: any) => {
    setAttemptId(payload.attemptId);
    setQuestions(payload.questions || []);
    setSections(payload.sections || []);
    setSyncSeq(payload.syncSeq);
    setAttemptStarted(true);

    // Initialize remaining time from serverEndsAt
    const endsAt = new Date(payload.serverEndsAt).getTime();
    const serverTimeOffset = clockSync ? new Date(payload.serverTime).getTime() - Date.now() : 0;
    const initialRemaining = Math.max(0, Math.floor((endsAt - (Date.now() + serverTimeOffset)) / 1000));
    setRemainingTimeSeconds(initialRemaining);

    // Load local cache backup if exists
    const cached = await getCbtLocalState(payload.attemptId);
    if (cached) {
      setLocalState(cached);
      if (cached.currentQuestionId) {
        const lastIndex = (payload.questions || []).findIndex((q: any) => q.id === cached.currentQuestionId);
        if (lastIndex !== -1) {
          setCurrentIndex(lastIndex);
        }
      }
    } else {
      // Build from scratch based on responses list
      const initialResponses: Record<string, CbtQuestionResponse> = {};
      const backendResponses = payload.responses || [];

      (payload.questions || []).forEach((q: any) => {
        const existing = backendResponses.find((r: any) => r.questionId === q.id);
        initialResponses[q.id] = {
          questionId: q.id,
          selectedOptionIds: existing?.selectedOptionIds || [],
          numericAnswer: existing?.numericAnswer || null,
          timeSpentSeconds: existing?.timeSpentSeconds || 0,
          status: existing?.status || "NOT_VISITED",
        };
      });

      const newState: CbtAttemptState = {
        attemptId: payload.attemptId,
        responses: initialResponses,
        currentQuestionId: payload.questions?.[0]?.id,
      };
      await saveCbtLocalState(newState);
      setLocalState(newState);
    }
  };

  // 2. Start new attempt handler
  const handleStartAttempt = async () => {
    try {
      const res = await startMutation.mutateAsync(testId);
      setupAttemptSession(res.data);
    } catch (err) {
      console.error("Failed to start CBT attempt:", err);
    }
  };

  // 3. Countdown Clock Timer
  useEffect(() => {
    if (remainingTimeSeconds === null || !attemptStarted) return;

    clockTimerRef.current = setInterval(() => {
      setRemainingTimeSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(clockTimerRef.current!);
          triggerAutoSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (clockTimerRef.current) clearInterval(clockTimerRef.current);
    };
  }, [remainingTimeSeconds, attemptStarted]);

  // 4. Time spent tracking per question
  useEffect(() => {
    if (!localState || !activeQuestion || isAutoSubmitting) return;

    // Save active question local index tracking
    const updateActiveQuestionLocally = async () => {
      const updated = {
        ...localState,
        currentQuestionId: activeQuestion.id,
      };
      await saveCbtLocalState(updated);
      setLocalState(updated);
    };
    updateActiveQuestionLocally();

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

        // Save locally in DB
        saveCbtLocalState(nextState);
        return nextState;
      });

      // Mark the question as dirty so its updated time is synced
      dirtyQueueRef.current.add(activeQuestion.id);
    }, 1000);

    return () => {
      if (timeTimerRef.current) clearInterval(timeTimerRef.current);
    };
  }, [currentIndex, activeQuestion?.id, !!localState, isAutoSubmitting]);

  // 5. Periodic Syncing to Backend (Every 12 seconds to respect the 10s rate limiter)
  useEffect(() => {
    if (!attemptStarted || !attemptId || isAutoSubmitting) return;

    syncTimerRef.current = setInterval(() => {
      performSync();
    }, 12000);

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [attemptStarted, attemptId, syncSeq, isAutoSubmitting]);

  // Sync execution helper
  const performSync = async (force = false) => {
    if (isSyncingRef.current || dirtyQueueRef.current.size === 0 || !localState || !attemptId) return;

    // Check throttle to prevent hitting the 10-second backend rate limiter
    const now = Date.now();
    if (!force && now - lastSyncTimeRef.current < 11000) {
      return;
    }

    const dirtyIds = Array.from(dirtyQueueRef.current);
    isSyncingRef.current = true;

    const patches = dirtyIds.map((id) => {
      const resp = localState.responses[id];
      return {
        questionId: id,
        clientTimestamp: Date.now(),
        response: {
          selectedOptionIds: resp.selectedOptionIds,
          numericAnswer: resp.numericAnswer,
          timeSpentSeconds: resp.timeSpentSeconds,
          status: resp.status,
        },
      };
    });

    const nextSeq = syncSeq + 1;

    try {
      const res = await syncMutation.mutateAsync({
        testId,
        attemptId,
        patches,
        syncSeq: nextSeq,
      });

      if (res.data.syncSeq >= nextSeq) {
        setSyncSeq(res.data.syncSeq);
        lastSyncTimeRef.current = Date.now(); // update last successful sync time
        // Clear successfully synced items from dirty queue
        dirtyIds.forEach((id) => dirtyQueueRef.current.delete(id));
      } else {
        // Enforce sequence sync offset if backend is higher
        setSyncSeq(res.data.syncSeq);
      }
    } catch (err) {
      console.warn("CBT Response sync failed, will retry next interval", err);
    } finally {
      isSyncingRef.current = false;
    }
  };

  // 6. Handle Response change inside QuestionCard
  const handleChangeResponse = (selectedIds: string[], numValue: string | null) => {
    if (!localState || !activeQuestion || isAutoSubmitting) return;

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

      let nextStatus: CbtQuestionResponse["status"] = "NOT_VISITED";
      if (hasAnswer) {
        nextStatus = isMarked ? "ANSWERED_AND_MARKED" : "ANSWERED";
      } else {
        nextStatus = isMarked ? "MARKED_FOR_REVIEW" : "NOT_ANSWERED";
      }

      const updatedResp: CbtQuestionResponse = {
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

      saveCbtLocalState(nextState);
      return nextState;
    });

    // Mark as dirty to sync immediately
    dirtyQueueRef.current.add(activeQuestion.id);
    // Trigger non-blocking immediate sync
    setTimeout(() => performSync(), 50);
  };

  // 7. Clear Response
  const handleClearResponse = () => {
    if (!localState || !activeQuestion || isAutoSubmitting) return;

    setLocalState((prev) => {
      if (!prev) return null;
      const currentResp = prev.responses[activeQuestion.id] || {
        questionId: activeQuestion.id,
        selectedOptionIds: [],
        numericAnswer: null,
        timeSpentSeconds: 0,
        status: "NOT_VISITED",
      };

      const updatedResp: CbtQuestionResponse = {
        ...currentResp,
        selectedOptionIds: [],
        numericAnswer: null,
        status: "NOT_ANSWERED",
      };

      const nextState = {
        ...prev,
        responses: {
          ...prev.responses,
          [activeQuestion.id]: updatedResp,
        },
      };

      saveCbtLocalState(nextState);
      return nextState;
    });

    dirtyQueueRef.current.add(activeQuestion.id);
    setTimeout(() => performSync(), 50);
  };

  // 8. Toggle Mark for Review
  const handleMarkForReview = () => {
    if (!localState || !activeQuestion || isAutoSubmitting) return;

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

      let nextStatus: CbtQuestionResponse["status"] = "NOT_VISITED";
      if (isCurrentlyMarked) {
        nextStatus = hasAnswer ? "ANSWERED" : "NOT_ANSWERED";
      } else {
        nextStatus = hasAnswer ? "ANSWERED_AND_MARKED" : "MARKED_FOR_REVIEW";
      }

      const updatedResp: CbtQuestionResponse = {
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

      saveCbtLocalState(nextState);
      return nextState;
    });

    dirtyQueueRef.current.add(activeQuestion.id);
    setTimeout(() => performSync(), 50);
  };

  // 9. Manual submit trigger
  const handleSubmitAttempt = () => {
    if (isAutoSubmitting) return;
    setConfirmSubmitOpen(true);
  };

  const confirmSubmit = async () => {
    if (!attemptId) return;
    setConfirmSubmitOpen(false);
    setIsAutoSubmitting(true);

    try {
      // Perform one final sync of any dirty responses before submitting
      await performSync(true);
      
      await submitMutation.mutateAsync({ testId, attemptId });
      await deleteCbtLocalState(attemptId);

      // Invalidate queries to refresh list
      queryClient.invalidateQueries({
        queryKey: STUDENT_TEST_SERIES_KEYS.detail(testSeriesId),
      });

      router.push(`/dashboard/student/my-test-series/${testSeriesId}`);
    } catch (err) {
      console.error("Submission failed:", err);
      setIsAutoSubmitting(false);
    }
  };

  // 10. Auto submission trigger when time ends
  const triggerAutoSubmission = async () => {
    if (isAutoSubmitting || !attemptId) return;
    setIsAutoSubmitting(true);

    try {
      // Attempt final sync
      await performSync(true);

      await submitMutation.mutateAsync({ testId, attemptId });
      await deleteCbtLocalState(attemptId);

      queryClient.invalidateQueries({
        queryKey: STUDENT_TEST_SERIES_KEYS.detail(testSeriesId),
      });

      // Redirect to list with auto-submitted notice
      router.push(`/dashboard/student/my-test-series/${testSeriesId}?autosubmitted=true`);
    } catch (err) {
      console.error("Auto submission failed:", err);
    }
  };

  // Navigation close/back safely
  const handleClose = () => {
    if (attemptStarted) {
      // Prompt user about running test session
      if (confirm("You have a running exam attempt. You can close the window, and your progress will keep running in the background. Close exam page?")) {
        router.push(`/dashboard/student/my-test-series/${testSeriesId}`);
      }
    } else {
      router.push(`/dashboard/student/my-test-series/${testSeriesId}`);
    }
  };

  // Formatted Timer string helper
  const getTimerText = () => {
    if (remainingTimeSeconds === null) return "00:00:00";
    const hrs = Math.floor(remainingTimeSeconds / 3600);
    const mins = Math.floor((remainingTimeSeconds % 3600) / 60);
    const secs = remainingTimeSeconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Render Loader
  if (isClockSyncLoading || isResumeLoading) {
    return (
      <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center gap-3 select-none">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-sm font-semibold text-muted-foreground">
          Establishing secure connection to exam engine...
        </span>
      </div>
    );
  }

  // Render Ready instruction screen before starting the attempt
  if (!attemptStarted) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col select-none">
        {/* Simple Header */}
        <header className="h-16 border-b border-border/60 bg-card px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-foreground">Secure Exam Engine</h1>
          </div>
          <Button variant="ghost" onClick={handleClose} className="text-xs font-semibold">
            Exit
          </Button>
        </header>

        {/* Main instruction container */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary shrink-0">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Test Guidelines & Rules
                </span>
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  Read Instructions Carefully Before Starting
                </h2>
              </div>
            </div>

            {/* Instruction body */}
            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed divide-y divide-border/60 pt-2">
              <div className="space-y-2 pb-4">
                <h3 className="font-bold text-foreground text-sm">Exam Overview:</h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>This test series has server-authoritative timing. Once you click "Start Exam", your timer begins.</li>
                  <li>Closing the window or losing network connection does not pause your timer.</li>
                  <li>The exam will automatically submit the moment the timer reaches 0.</li>
                </ul>
              </div>

              <div className="space-y-2 py-4">
                <h3 className="font-bold text-foreground text-sm">Security & Integrity:</h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Answers are saved and synced to the cloud continuously in real-time.</li>
                  <li>Do not open multiple tabs, refresh unnecessarily, or attempt to modify local state.</li>
                  <li>Any suspicious activity may disqualify your attempt.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4">
                <h3 className="font-bold text-foreground text-sm">Marking Scheme:</h3>
                <p>
                  Review the marks displayed on each question. Multiple correct answers (MCQ_M) might award partial marks if configured. Incorrect responses can attract negative markings.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-1/3 min-h-[44px] rounded-xl font-bold border-border"
              >
                Go Back
              </Button>
              <Button
                onClick={handleStartAttempt}
                disabled={startMutation.isPending || (secondsToStart !== null && secondsToStart > 0)}
                className="w-full sm:flex-1 min-h-[44px] rounded-xl font-bold bg-primary hover:bg-primary/95 text-primary-foreground gap-2"
              >
                {startMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                <span>
                  {secondsToStart !== null && secondsToStart > 0
                    ? getStartCountdownText()
                    : "Start Exam Attempt"}
                </span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Formatting response statuses for Navigator indicator
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
        mode="TEST"
        title={clockSync ? "Computer Based Mock Test" : "CBT Attempt Session"}
        subjectName="Mock Examination"
        questions={questions}
        sections={sections}
        currentIndex={currentIndex}
        onSelectIndex={setCurrentIndex}
        responses={mappedResponses}
        onSaveResponse={performSync}
        onMarkForReview={handleMarkForReview}
        onClearResponse={handleClearResponse}
        onSubmit={handleSubmitAttempt}
        onClose={handleClose}
        timerText={getTimerText()}
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
            <h3 className="text-base font-bold text-foreground">Submit Exam?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to finalize and submit your mock exam? This will close your test window, and your solutions will be sent for evaluation.
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
                className="flex-1 min-h-[44px] rounded-xl font-bold bg-primary hover:bg-primary/95 text-primary-foreground cursor-pointer"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                ) : null}
                <span>Submit</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Auto submitting modal overlay */}
      {isAutoSubmitting && (
        <div className="fixed inset-0 z-[130] bg-black/75 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center select-none">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Time is Up!</h3>
            <p className="text-xs text-muted-foreground max-w-xs px-4">
              Saving your final progress and sending your paper for automatic evaluation. Please do not close this window...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
