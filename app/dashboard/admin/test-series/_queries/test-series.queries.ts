import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTestSeries,
  createTestSeries,
  updateTestSeries,
  ListTestSeriesQuery,
  CreateTestSeriesInput,
  UpdateTestSeriesInput,
  getTestSeriesDetail,
  getTestSeriesTests,
  addTestSeriesTests,
  CreateTestsInput,
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

export function useUpdateTestSeriesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testSeriesId, data }: { testSeriesId: string; data: UpdateTestSeriesInput }) =>
      updateTestSeries(testSeriesId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: TEST_SERIES_QUERY_KEYS.all });
      toast.success(res.message || "Test series updated successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Failed to update test series";
      toast.error(message);
    },
  });
}

export function useTestSeriesDetailQuery(testSeriesId: string) {
  return useQuery({
    queryKey: [...TEST_SERIES_QUERY_KEYS.all, "detail", testSeriesId],
    queryFn: () => getTestSeriesDetail(testSeriesId),
    enabled: !!testSeriesId,
    staleTime: 10000,
  });
}

export function useTestSeriesTestsQuery(testSeriesId: string, query: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...TEST_SERIES_QUERY_KEYS.all, "tests", testSeriesId, query],
    queryFn: () => getTestSeriesTests(testSeriesId, query),
    enabled: !!testSeriesId,
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useAddTestSeriesTestsMutation(testSeriesId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestsInput) => addTestSeriesTests(testSeriesId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [...TEST_SERIES_QUERY_KEYS.all, "tests", testSeriesId] });
      toast.success("Tests added successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Failed to add tests";
      toast.error(message);
    },
  });
}


