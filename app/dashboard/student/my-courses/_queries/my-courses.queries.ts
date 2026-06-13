import { useQuery } from "@tanstack/react-query";
import { getMyCourses } from "../_api/my-courses.api";

export const STUDENT_COURSES_QUERY_KEYS = {
  all: ["studentCourses"] as const,
  list: () => [...STUDENT_COURSES_QUERY_KEYS.all, "list"] as const,
};

export function useStudentCoursesQuery() {
  return useQuery({
    queryKey: STUDENT_COURSES_QUERY_KEYS.list(),
    queryFn: getMyCourses,
    staleTime: 5 * 60 * 1000, // 5 minutes as specified in student-dashboard-design.md
  });
}
