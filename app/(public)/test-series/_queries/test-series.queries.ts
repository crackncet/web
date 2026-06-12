import { useQuery } from "@tanstack/react-query";
import { 
  getPublicTestSeries, 
} from "../_api/test-series.api";
import { 
  getPublicExams, 
  getPublicStreams, 
} from "../../courses/_api/courses.api";

export function usePublicTestSeriesQuery(params: { page?: number; limit?: number; examId?: string } = {}) {
  return useQuery({
    queryKey: ["publicTestSeries", params],
    queryFn: () => getPublicTestSeries(params),
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
