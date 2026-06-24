import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memberDoubtsApi, GetTeacherQueueFilters } from "../_api/doubts.api";
import { toast } from "sonner";

export const memberDoubtsKeys = {
  all: ["member-doubts"] as const,
  queue: (filters: GetTeacherQueueFilters) => [...memberDoubtsKeys.all, "queue", filters] as const,
  detail: (id: string) => [...memberDoubtsKeys.all, "detail", id] as const,
};

export function useTeacherQueueQuery(filters: GetTeacherQueueFilters) {
  return useQuery({
    queryKey: memberDoubtsKeys.queue(filters),
    queryFn: () => memberDoubtsApi.getTeacherQueue(filters),
  });
}

export function useClaimDoubtMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memberDoubtsApi.claimDoubt,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: memberDoubtsKeys.all });
      toast.success("Doubt claimed successfully! You can now respond to it.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to claim doubt");
    },
  });
}

export function useTeacherDoubtDetailQuery(doubtId: string) {
  return useQuery({
    queryKey: memberDoubtsKeys.detail(doubtId),
    queryFn: () => memberDoubtsApi.getDoubtDetail(doubtId),
    enabled: !!doubtId,
  });
}

export function useTeacherAddResponseMutation(doubtId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string; imageUrl?: string | null }) =>
      memberDoubtsApi.addResponse(doubtId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberDoubtsKeys.detail(doubtId) });
      queryClient.invalidateQueries({ queryKey: memberDoubtsKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to post message");
    },
  });
}

export function useTeacherResolveDoubtMutation(doubtId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => memberDoubtsApi.resolveDoubt(doubtId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberDoubtsKeys.detail(doubtId) });
      queryClient.invalidateQueries({ queryKey: memberDoubtsKeys.all });
      toast.success("Doubt marked resolved successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to resolve doubt");
    },
  });
}
