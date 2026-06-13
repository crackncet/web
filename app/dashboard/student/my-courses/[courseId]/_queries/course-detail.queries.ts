import { useQuery } from "@tanstack/react-query";
import { getCourseDetailSyllabus } from "../_api/course-detail.api";

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
