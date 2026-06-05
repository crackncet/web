import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getExams, createExam, deleteExam, getExamById, GetExamsFilters } from "../_api/exams.api";

export const examQueryKeys = {
  all: ["metadata", "exams"] as const,
  list: (filters: GetExamsFilters) => [...examQueryKeys.all, "list", filters] as const,
  detail: (examId: string | null) => [...examQueryKeys.all, "detail", examId] as const,
};

export function useExamsQuery(filters: GetExamsFilters = {}) {
  return useQuery({
    queryKey: examQueryKeys.list(filters),
    queryFn: () => getExams(filters),
  });
}

export function useCreateExamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createExam(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.all });
      toast.success(data.message || "Exam created successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create exam";
      toast.error(message);
    },
  });
}

export function useDeleteExamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) => deleteExam(examId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.all });
      toast.success(data.message || "Exam deactivated successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to deactivate exam";
      toast.error(message);
    },
  });
}

export function useExamDetailsQuery(examId: string | null) {
  return useQuery({
    queryKey: examQueryKeys.detail(examId),
    queryFn: () => getExamById(examId!),
    enabled: !!examId,
  });
}
