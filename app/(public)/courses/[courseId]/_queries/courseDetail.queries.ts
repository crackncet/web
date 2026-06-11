import { getPublicCourseDetail, getPublicCourseMentors, getPublicCourseOutline, getPublicTestSeriesOutline } from "../_api/courseDetail.api";
import { useQuery } from "@tanstack/react-query";
export function usePublicCourseDetailQuery(courseId: string) {
  return useQuery({
    queryKey: ["publicCourseDetail", courseId],
    queryFn: () => getPublicCourseDetail(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 35, // 35 minutes cache
  });
}

export function usePublicCourseMentorsQuery(courseId: string) {
  return useQuery({
    queryKey: ["publicCourseMentors", courseId],
    queryFn: () => getPublicCourseMentors(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 15, // 15 minutes cache
  });
}

export function usePublicCourseOutlineQuery(courseId: string) {
  return useQuery({
    queryKey: ["publicCourseOutline", courseId],
    queryFn: () => getPublicCourseOutline(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 15, // 15 minutes cache
  });
}

export function usePublicTestSeriesOutlineQuery(testSeriesId: string | null) {
  return useQuery({
    queryKey: ["publicTestSeriesOutline", testSeriesId],
    queryFn: () => getPublicTestSeriesOutline(testSeriesId!),
    enabled: !!testSeriesId,
    staleTime: 1000 * 60 * 15, // 15 minutes cache
  });
}