import { useQuery } from "@tanstack/react-query";
import { getMyTestSeries, getTestSeriesDetails } from "../_api/my-test-series.api";

export const STUDENT_TEST_SERIES_KEYS = {
  all: ["studentTestSeries"] as const,
  list: () => [...STUDENT_TEST_SERIES_KEYS.all, "list"] as const,
  detail: (testSeriesId: string) => [...STUDENT_TEST_SERIES_KEYS.all, "detail", testSeriesId] as const,
};

export function useStudentTestSeriesQuery() {
  return useQuery({
    queryKey: STUDENT_TEST_SERIES_KEYS.list(),
    queryFn: getMyTestSeries,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentTestSeriesDetailQuery(testSeriesId: string) {
  return useQuery({
    queryKey: STUDENT_TEST_SERIES_KEYS.detail(testSeriesId),
    queryFn: () => getTestSeriesDetails(testSeriesId),
    enabled: !!testSeriesId,
    staleTime: 5 * 60 * 1000,
  });
}
