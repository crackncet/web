import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface FeaturedTestSeries {
  id: string;
  examName: string;
  name: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string | null;
  streams?: string[];
}

export async function getFeaturedTestSeries(): Promise<FeaturedTestSeries[]> {
  const response = await apiClient.get<ApiSuccessResponse<FeaturedTestSeries[]>>(
    "/test-series/featured"
  );
  return response.data.data;
}
