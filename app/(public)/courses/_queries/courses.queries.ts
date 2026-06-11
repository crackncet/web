import { useQuery } from "@tanstack/react-query";
import { 
  getPublicCourses, 
  getPublicExams, 
  getPublicStreams, 
} from "../_api/courses.api";

export function usePublicCoursesQuery(params: { page?: number; limit?: number; examId?: string } = {}) {
  return useQuery({
    queryKey: ["publicCourses", params],
    queryFn: () => getPublicCourses(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function usePublicExamsQuery() {
  return useQuery({
    queryKey: ["publicExams"],
    queryFn: getPublicExams,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function usePublicStreamsQuery() {
  return useQuery({
    queryKey: ["publicStreams"],
    queryFn: getPublicStreams,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}


