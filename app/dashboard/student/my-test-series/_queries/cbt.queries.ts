import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getCbtClockSync,
  startCbtAttempt,
  syncCbtResponses,
  submitCbtAttempt,
  resumeCbtAttempt,
  getCbtReport,
} from "../_api/cbt.api";

export const STUDENT_CBT_KEYS = {
  all: ["studentCbt"] as const,
  clockSync: (testId: string) => [...STUDENT_CBT_KEYS.all, "clockSync", testId] as const,
  resume: (testId: string) => [...STUDENT_CBT_KEYS.all, "resume", testId] as const,
  report: (testId: string) => [...STUDENT_CBT_KEYS.all, "report", testId] as const,
};

export function useCbtClockSyncQuery(testId: string) {
  return useQuery({
    queryKey: STUDENT_CBT_KEYS.clockSync(testId),
    queryFn: () => getCbtClockSync(testId),
    enabled: !!testId,
    refetchInterval: 60 * 1000, // Refresh clock offset every minute
  });
}

export function useStartCbtAttemptMutation() {
  return useMutation({
    mutationFn: (testId: string) => startCbtAttempt(testId),
  });
}

export function useSyncCbtResponsesMutation() {
  return useMutation({
    mutationFn: ({
      testId,
      attemptId,
      patches,
      syncSeq,
    }: {
      testId: string;
      attemptId: string;
      patches: any[];
      syncSeq: number;
    }) => syncCbtResponses(testId, { attemptId, patches, syncSeq }),
  });
}

export function useSubmitCbtAttemptMutation() {
  return useMutation({
    mutationFn: ({ testId, attemptId }: { testId: string; attemptId: string }) =>
      submitCbtAttempt(testId, { attemptId }),
  });
}

export function useResumeCbtAttemptQuery(testId: string, enabled = true) {
  return useQuery({
    queryKey: STUDENT_CBT_KEYS.resume(testId),
    queryFn: () => resumeCbtAttempt(testId),
    enabled: !!testId && enabled,
    retry: false, // Don't retry if no active attempt
    meta: {
      preventToast: true,
    },
  });
}

export function useCbtReportQuery(testId: string) {
  return useQuery({
    queryKey: STUDENT_CBT_KEYS.report(testId),
    queryFn: () => getCbtReport(testId),
    enabled: !!testId,
    staleTime: Infinity, // Report is static once evaluated
  });
}
