import { useQuery } from "@tanstack/react-query";
import { getFeaturedCourses } from "../_api/courses.api";

export const FEATURED_COURSES_KEY = ["featuredCourses"];

export function useFeaturedCourses() {
  return useQuery({
    queryKey: FEATURED_COURSES_KEY,
    queryFn: getFeaturedCourses,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
}
