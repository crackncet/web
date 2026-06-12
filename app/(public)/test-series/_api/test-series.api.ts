import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface PublicTestSeriesListItem {
  id: string;
  examName: string;
  name: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string | null;
  isEnrollmentOpen: boolean;
  streamName: string[];
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "UNPUBLISHED";
}

export interface ListPublicTestSeriesResponse {
  data: PublicTestSeriesListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getPublicTestSeries(params: { page?: number; limit?: number; examId?: string } = {}): Promise<ListPublicTestSeriesResponse> {
  const response = await apiClient.get<ApiSuccessResponse<PublicTestSeriesListItem[]>>(
    "/test-series/public",
    { params }
  );
  return {
    data: response.data.data,
    total: response.data.meta?.total || 0,
    page: response.data.meta?.page || 1,
    limit: response.data.meta?.limit || 20,
    totalPages: response.data.meta?.totalPages || 1,
  };
}
