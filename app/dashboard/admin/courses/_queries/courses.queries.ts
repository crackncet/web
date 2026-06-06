import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminCourses, createCourse, ListCourseQuery, CreateCourseInput } from "../_api/courses.api";
import { toast } from "sonner";

export const COURSE_QUERY_KEYS = {
  all: ["adminCourses"] as const,
  list: (filters: ListCourseQuery) => [...COURSE_QUERY_KEYS.all, "list", filters] as const,
};

export function useAdminCoursesQuery(filters: ListCourseQuery) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.list(filters),
    queryFn: () => getAdminCourses(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseInput) => createCourse(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
      toast.success(res.message || "Course created successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to create course";
      toast.error(message);
    },
  });
}
