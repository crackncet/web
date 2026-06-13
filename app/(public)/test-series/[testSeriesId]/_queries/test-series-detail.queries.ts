import { 
  getPublicTestSeriesDetail, 
  getPublicTestSeriesMentors, 
  getPublicTestSeriesOutline, 
  getPublicExamById 
} from "../_api/test-series-detail.api";
import { useQuery } from "@tanstack/react-query";

export function usePublicTestSeriesDetailQuery(testSeriesId: string) {
  return useQuery({
    queryKey: ["publicTestSeriesDetail", testSeriesId],
    queryFn: () => getPublicTestSeriesDetail(testSeriesId),
    enabled: !!testSeriesId,
    staleTime: 1000 * 60 * 35, // 35 minutes cache
  });
}

export function usePublicTestSeriesMentorsQuery(testSeriesId: string) {
  return useQuery({
    queryKey: ["publicTestSeriesMentors", testSeriesId],
    queryFn: () => getPublicTestSeriesMentors(testSeriesId),
    enabled: !!testSeriesId,
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

export function usePublicExamDetailQuery(examId: string | undefined) {
  return useQuery({
    queryKey: ["publicExamDetail", examId],
    queryFn: () => getPublicExamById(examId!),
    enabled: !!examId,
    staleTime: 1000 * 60 * 35, // 35 minutes cache
  });
}
