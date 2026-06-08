import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTestSeries,
  createTestSeries,
  ListTestSeriesQuery,
  CreateTestSeriesInput,
} from "../_api/test-series.api";
import { toast } from "sonner";

export const TEST_SERIES_QUERY_KEYS = {
  all: ["adminTestSeries"] as const,
  list: (filters: ListTestSeriesQuery) => [...TEST_SERIES_QUERY_KEYS.all, "list", filters] as const,
};

export function useAdminTestSeriesQuery(filters: ListTestSeriesQuery) {
  return useQuery({
    queryKey: TEST_SERIES_QUERY_KEYS.list(filters),
    queryFn: () => getAdminTestSeries(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useCreateTestSeriesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestSeriesInput) => createTestSeries(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: TEST_SERIES_QUERY_KEYS.all });
      toast.success(res.message || "Test series created successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Failed to create test series";
      toast.error(message);
    },
  });
}
