import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doubtsApi, CreateDoubtPayload, GetStudentDoubtsFilters } from "../_api/doubts.api";
import { toast } from "sonner";

export const doubtsKeys = {
  all: ["doubts"] as const,
  subjects: () => [...doubtsKeys.all, "subjects"] as const,
  list: (filters: GetStudentDoubtsFilters) => [...doubtsKeys.all, "list", filters] as const,
  detail: (id: string) => [...doubtsKeys.all, "detail", id] as const,
};

export function useStudentEligibleSubjectsQuery() {
  return useQuery({
    queryKey: doubtsKeys.subjects(),
    queryFn: doubtsApi.getStudentEligibleSubjects,
  });
}

export function useStudentDoubtsQuery(filters: GetStudentDoubtsFilters) {
  return useQuery({
    queryKey: doubtsKeys.list(filters),
    queryFn: () => doubtsApi.getStudentDoubts(filters),
  });
}

export function useDoubtDetailQuery(doubtId: string) {
  return useQuery({
    queryKey: doubtsKeys.detail(doubtId),
    queryFn: () => doubtsApi.getDoubtDetail(doubtId),
    enabled: !!doubtId,
  });
}

export function useCreateDoubtMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: doubtsApi.createDoubt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doubtsKeys.all });
      toast.success("Your doubt has been submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit doubt");
    },
  });
}

export function useAddResponseMutation(doubtId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string; imageUrl?: string | null }) =>
      doubtsApi.addResponse(doubtId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doubtsKeys.detail(doubtId) });
      queryClient.invalidateQueries({ queryKey: doubtsKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to post message");
    },
  });
}

export function useResolveDoubtMutation(doubtId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => doubtsApi.resolveDoubt(doubtId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doubtsKeys.detail(doubtId) });
      queryClient.invalidateQueries({ queryKey: doubtsKeys.all });
      toast.success("Doubt resolved successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to resolve doubt");
    },
  });
}
