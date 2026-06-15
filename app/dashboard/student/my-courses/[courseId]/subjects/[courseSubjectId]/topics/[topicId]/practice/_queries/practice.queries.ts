import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrStartPracticeAttempt,
  submitPracticeAttempt,
  getPracticeReport,
  SubmitPracticeAttemptInput,
} from "../_api/practice.api";

export const PRACTICE_QUERY_KEYS = {
  all: ["practice"] as const,
  attempt: (bankId: string) => [...PRACTICE_QUERY_KEYS.all, "attempt", bankId] as const,
  report: (bankId: string, attemptId?: string, attemptNumber?: number) =>
    [...PRACTICE_QUERY_KEYS.all, "report", bankId, { attemptId, attemptNumber }] as const,
};

export function usePracticeAttemptQuery(bankId: string, enabled = true) {
  return useQuery({
    queryKey: PRACTICE_QUERY_KEYS.attempt(bankId),
    queryFn: () => getOrStartPracticeAttempt(bankId, false),
    enabled: enabled && !!bankId,
    staleTime: 0, // Always get freshest status, response caching is handled locally/IndexedDB
  });
}

export function useSubmitPracticeAttemptMutation(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitPracticeAttemptInput) => submitPracticeAttempt(bankId, payload),
    onSuccess: () => {
      // Invalidate the attempt queries for this bank
      queryClient.invalidateQueries({
        queryKey: PRACTICE_QUERY_KEYS.attempt(bankId),
      });
      queryClient.invalidateQueries({
        queryKey: [...PRACTICE_QUERY_KEYS.all, "report", bankId],
      });
    },
  });
}

export function usePracticeReportQuery(
  bankId: string,
  params: { attemptId?: string; attemptNumber?: number },
  enabled = true
) {
  return useQuery({
    queryKey: PRACTICE_QUERY_KEYS.report(bankId, params.attemptId, params.attemptNumber),
    queryFn: () => getPracticeReport(bankId, params),
    enabled: enabled && !!bankId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for reports
  });
}
