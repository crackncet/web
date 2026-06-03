import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface FeaturedCourse {
  id: string;
  examName: string;
  title: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string | null;
}

export async function getFeaturedCourses(): Promise<FeaturedCourse[]> {
  const response = await apiClient.get<ApiSuccessResponse<FeaturedCourse[]>>(
    "/courses/featured"
  );
  return response.data.data;
}
