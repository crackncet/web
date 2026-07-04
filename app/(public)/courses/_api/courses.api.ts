import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface PublicCourseListItem {
  id: string;
  examName: string;
  title: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string | null;
  isEnrollmentOpen: boolean;
  streamName: string[];
  status: "UPCOMING" | "ONGOING";
  isFeatured?: boolean;
}

export interface ListPublicCoursesResponse {
  data: PublicCourseListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getPublicCourses(params: { page?: number; limit?: number; examId?: string } = {}): Promise<ListPublicCoursesResponse> {
  const response = await apiClient.get<ApiSuccessResponse<PublicCourseListItem[]>>(
    "/courses/public",
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

export interface PublicExam {
  id: string;
  name: string;
}

export interface PublicStream {
  id: string;
  name: string;
}

export async function getPublicExams(): Promise<PublicExam[]> {
  const response = await apiClient.get<ApiSuccessResponse<PublicExam[]>>(
    "/metadata/public/exams"
  );
  return response.data.data;
}

export async function getPublicStreams(): Promise<PublicStream[]> {
  const response = await apiClient.get<ApiSuccessResponse<PublicStream[]>>(
    "/metadata/public/streams"
  );
  return response.data.data;
}
