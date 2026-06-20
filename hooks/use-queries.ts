import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiSuccessResponse } from "@/lib/api-client";
import { toast } from "sonner";

// ============================================================================
// 1. Interfaces & Types
// ============================================================================

export interface QueryStudent {
  fullName: string;
  email: string;
  profileImage: string | null;
}

export interface UserQuery {
  id: string;
  userId: string;
  subject: string;
  message: string;
  response: string | null;
  respondedAt: string | null;
  respondedBy: string | null;
  status: "PENDING" | "RESPONDED";
  createdAt: string;
  student?: QueryStudent;
}

export interface GetQueriesFilters {
  page: number;
  limit: number;
  status?: "PENDING" | "RESPONDED";
  query?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// 2. API Functions
// ============================================================================

export const submitQueryAPI = async (data: { subject: string; message: string }) => {
  const response = await apiClient.post<ApiSuccessResponse<{ id: string }>>("/queries", data);
  return response.data.data;
};

export const getStudentQueriesAPI = async (filters: GetQueriesFilters) => {
  const params: Record<string, any> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.query) {
    params.query = filters.query;
  }
  if (filters.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters.endDate) {
    params.endDate = filters.endDate;
  }
  
  const response = await apiClient.get<ApiSuccessResponse<UserQuery[]>>("/queries", {
    params,
  });

  return {
    queries: response.data.data,
    pagination: {
      page: response.data.meta?.page ?? filters.page ?? 1,
      limit: response.data.meta?.limit ?? filters.limit ?? 10,
      totalPages: response.data.meta?.totalPages ?? 1,
      total: response.data.meta?.total ?? response.data.data.length,
    },
    counts: (response.data.meta as any)?.counts || { all: 0, pending: 0, responded: 0 },
  };
};

export const getAdminQueriesAPI = async (filters: GetQueriesFilters) => {
  const params: Record<string, any> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.query) {
    params.query = filters.query;
  }
  if (filters.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters.endDate) {
    params.endDate = filters.endDate;
  }

  const response = await apiClient.get<ApiSuccessResponse<UserQuery[]>>("/queries/admin", {
    params,
  });

  return {
    queries: response.data.data,
    pagination: {
      page: response.data.meta?.page ?? filters.page ?? 1,
      limit: response.data.meta?.limit ?? filters.limit ?? 10,
      totalPages: response.data.meta?.totalPages ?? 1,
      total: response.data.meta?.total ?? response.data.data.length,
    },
    counts: response.data.meta?.counts ?? { all: 0, pending: 0, responded: 0 },
  };
};

export const respondToQueryAPI = async ({
  queryId,
  response: responseText,
}: {
  queryId: string;
  response: string;
}) => {
  const response = await apiClient.post<ApiSuccessResponse<UserQuery>>(
    `/queries/${queryId}/respond`,
    { response: responseText }
  );
  return response.data.data;
};

// ============================================================================
// 3. React Query Hooks
// ============================================================================

export const queryCacheKeys = {
  all: ["userQueries"] as const,
  studentList: (filters: GetQueriesFilters) => [...queryCacheKeys.all, "student", filters] as const,
  adminList: (filters: GetQueriesFilters) => [...queryCacheKeys.all, "admin", filters] as const,
};

export function useSubmitQuery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitQueryAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryCacheKeys.all });
    },
  });
}

export function useStudentQueries(filters: GetQueriesFilters) {
  return useQuery({
    queryKey: queryCacheKeys.studentList(filters),
    queryFn: () => getStudentQueriesAPI(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminQueries(filters: GetQueriesFilters) {
  return useQuery({
    queryKey: queryCacheKeys.adminList(filters),
    queryFn: () => getAdminQueriesAPI(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useRespondToQuery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: respondToQueryAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryCacheKeys.all });
      toast.success("Response submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit response.");
    },
  });
}
