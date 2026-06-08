import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface TestSeries {
  id: string;
  examId: string;
  name: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  status: "UPCOMING" | "ONGOING" | "ARCHIVED" | "UNPUBLISHED";
}

export interface ListTestSeriesQuery {
  page?: number;
  limit?: number;
  query?: string;
  examId?: string;
  status?: "UPCOMING" | "ONGOING" | "ARCHIVED" | "UNPUBLISHED";
}

export interface CreateTestSeriesInput {
  examId: string;
  name: string;
  description?: string;
  banner?: string;
  price: string;
  startDate?: string;
  endDate?: string;
  streamId: string[];
}

export async function getAdminTestSeries(filters: ListTestSeriesQuery = {}) {
  const params: Record<string, string | number> = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.query?.trim()) params.query = filters.query.trim();
  if (filters.examId) params.examId = filters.examId;
  if (filters.status) params.status = filters.status;

  const response = await apiClient.get<ApiSuccessResponse<TestSeries[]>>(
    "/test-series/admin-view",
    { params }
  );
  return response.data;
}

export async function createTestSeries(data: CreateTestSeriesInput) {
  const response = await apiClient.post<ApiSuccessResponse<TestSeries>>(
    "/test-series",
    data
  );
  return response.data;
}
