import { useQuery } from "@tanstack/react-query";
import { getFeaturedTestSeries } from "../_api/test-series.api";

export const FEATURED_TEST_SERIES_KEY = ["featuredTestSeriesPublic"];

export function useFeaturedTestSeries() {
  return useQuery({
    queryKey: FEATURED_TEST_SERIES_KEY,
    queryFn: getFeaturedTestSeries,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
}
