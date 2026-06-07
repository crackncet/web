import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface MemberCourse {
  id: string;
  examId: string;
  examName: string;
  testSeriesId: string | null;
  testSeriesTitle: string | null;
  title: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  streams: string[];
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "UNPUBLISHED";
}

export interface ListCourseQuery {
  page?: number;
  limit?: number;
  query?: string;
  examId?: string;
  status?: string;
}

export async function getMemberCourses(filters: ListCourseQuery) {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.query) params.append("query", filters.query);
  if (filters.examId) params.append("examId", filters.examId);
  if (filters.status) params.append("status", filters.status);

  const response = await apiClient.get<ApiSuccessResponse<MemberCourse[]>>(
    `/courses/member-view?${params.toString()}`
  );
  return response.data;
}
