import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseDetailSyllabus, toggleVideoProgress } from "../_api/course-detail.api";
import { toast } from "sonner";

export const COURSE_DETAIL_QUERY_KEYS = {
  all: ["studentCourseDetail"] as const,
  detail: (courseId: string) => [...COURSE_DETAIL_QUERY_KEYS.all, "detail", courseId] as const,
};

export function useStudentCourseDetailQuery(courseId: string) {
  return useQuery({
    queryKey: COURSE_DETAIL_QUERY_KEYS.detail(courseId),
    queryFn: () => getCourseDetailSyllabus(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useToggleVideoProgressMutation(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleVideoProgress,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_QUERY_KEYS.detail(courseId) });
      toast.success(
        data.data.isCompleted
          ? "Video marked as completed!"
          : "Video watch progress cleared!"
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update watch status");
    },
  });
}
