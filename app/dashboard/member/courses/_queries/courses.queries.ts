import { useQuery } from "@tanstack/react-query";
import { getMemberCourses, ListCourseQuery } from "../_api/courses.api";

export const MEMBER_COURSE_QUERY_KEYS = {
  all: ["memberCourses"] as const,
  list: (filters: ListCourseQuery) => [...MEMBER_COURSE_QUERY_KEYS.all, "list", filters] as const,
};

export function useMemberCoursesQuery(filters: ListCourseQuery) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.list(filters),
    queryFn: () => getMemberCourses(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}
